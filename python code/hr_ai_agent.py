import io
import os
import time
from typing import List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import pdfplumber
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI HR Recruiting Agent Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def get_valid_model():
    try:
        models = client.models.list()
        available = [m.id for m in models.data]
        print(f"[INFO] Models available to this API key: {available}")
        
        preferences = [
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
            "qwen/qwen3.8-27b",
            "llama-3.1-8b-instant",
            "llama-3.3-70b-versatile"
        ]
        
        for pref in preferences:
            if pref in available:
                print(f"[INFO] Automatically selected active model: {pref}")
                return pref
                
        if available:
            print(f"[INFO] Defaulting to first available model: {available[0]}")
            return available[0]
            
    except Exception as e:
        print(f"[WARN] Could not fetch model list dynamically: {e}")
        
    return "llama-3.1-8b-instant"

ACTIVE_MODEL = get_valid_model()

class ExperienceItem(BaseModel):
    title: Optional[str] = Field(default="Not specified")
    company: Optional[str] = Field(default="Not specified")
    dates: Optional[str] = Field(default="Not specified")
    description: Optional[List[str]] = Field(default=[])

class CandidateProfile(BaseModel):
    full_name: Optional[str] = Field(default="Unknown Candidate")
    email: Optional[str] = Field(default="N/A")
    phone: Optional[str] = Field(default="N/A")
    skills: Optional[List[str]] = Field(default=[])
    experience: Optional[List[ExperienceItem]] = Field(default=[])
    education: Optional[str] = Field(default="Not specified")
    certifications: Optional[List[str]] = Field(default=[])
    projects: Optional[List[str]] = Field(default=[])

class JobMatchResult(BaseModel):
    fit_score: Optional[int] = Field(default=50)
    matching_skills: Optional[List[str]] = Field(default=[])
    missing_skills: Optional[List[str]] = Field(default=[])
    match_justification: Optional[str] = Field(default="Pending evaluation review.")
    recommendation: Optional[str] = Field(default="Maybe")

def call_groq_with_retry(messages, response_format={"type": "json_object"}, max_retries=5):
    delay = 5
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model=ACTIVE_MODEL,
                messages=messages,
                response_format=response_format
            )
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rate_limit" in error_str.lower():
                if attempt == max_retries - 1:
                    raise e
                time.sleep(delay)
                delay *= 2
            else:
                raise e

@app.post("/api/evaluate")
async def evaluate_single(job_description: str = Form(...), resume: UploadFile = File(...)):
    try:
        file_bytes = await resume.read()
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            res_text = "".join([page.extract_text() + "\n" for page in pdf.pages if page.extract_text()])
        if not res_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        candidate_schema = CandidateProfile.model_json_schema()
        match_schema = JobMatchResult.model_json_schema()

        comp_profile = call_groq_with_retry([
            {"role": "system", "content": f"You are an expert HR assistant. Extract candidate details and respond ONLY with a valid JSON object matching this schema:\n{candidate_schema}"},
            {"role": "user", "content": f"Extract candidate details from this resume:\n\n{res_text}"}
        ])
        profile = CandidateProfile.model_validate_json(comp_profile.choices[0].message.content)

        eval_prompt = f"Candidate Profile:\n{profile.model_dump_json()}\n\nJob Description:\n{job_description}"
        comp_eval = call_groq_with_retry([
            {"role": "system", "content": f"Compare candidate profile against job description and respond ONLY with a valid JSON object matching this schema:\n{match_schema}. IMPORTANT: The 'recommendation' field MUST be EXACTLY one of these three strings: 'Shortlist', 'Maybe', or 'Reject'."},
            {"role": "user", "content": eval_prompt}
        ])
        match_result = JobMatchResult.model_validate_json(comp_eval.choices[0].message.content)

        return {
            "id": "cand-single",
            "fileName": resume.filename,
            "name": profile.full_name,
            "email": profile.email,
            "phone": profile.phone,
            "fitScore": match_result.fit_score,
            "recommendation": match_result.recommendation,
            "matchingSkills": match_result.matching_skills,
            "missingSkills": match_result.missing_skills,
            "justification": match_result.match_justification
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_batch(job_description: str = Form(...), resumes: List[UploadFile] = File(...)):
    try:
        batch_results = []
        candidate_schema = CandidateProfile.model_json_schema()
        match_schema = JobMatchResult.model_json_schema()

        for idx, resume_file in enumerate(resumes):
            file_bytes = await resume_file.read()
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                res_text = "".join([page.extract_test() + "\n" for page in pdf.pages if page.extract_text()]) if hasattr(pdf.pages[0], 'extract_text') else ""
            if not res_text.strip():
                # fallback text gathering if needed
                res_text = "".join([page.extract_text() + "\n" for page in pdf.pages if page.extract_text()])
            if not res_text.strip():
                continue

            comp_profile = call_groq_with_retry([
                {"role": "system", "content": f"You are an expert HR assistant. Extract candidate details and respond ONLY with a valid JSON object matching this schema:\n{candidate_schema}"},
                {"role": "user", "content": f"Extract candidate details from this resume:\n\n{res_text}"}
            ])
            profile = CandidateProfile.model_validate_json(comp_profile.choices[0].message.content)

            eval_prompt = f"Candidate Profile:\n{profile.model_dump_json()}\n\nJob Description:\n{job_description}"
            comp_eval = call_groq_with_retry([
                {"role": "system", "content": f"Compare candidate profile against job description and respond ONLY with a valid JSON object matching this schema:\n{match_schema}. IMPORTANT: The 'recommendation' field MUST be EXACTLY one of these three strings: 'Shortlist', 'Maybe', or 'Reject'."},
                {"role": "user", "content": eval_prompt}
            ])
            match_result = JobMatchResult.model_validate_json(comp_eval.choices[0].message.content)

            batch_results.append({
                "id": idx + 1,
                "fileName": resume_file.filename,
                "name": profile.full_name,
                "email": profile.email,
                "phone": profile.phone,
                "fitScore": match_result.fit_score,
                "recommendation": match_result.recommendation,
                "matchingSkills": match_result.matching_skills,
                "missingSkills": match_result.missing_skills,
                "justification": match_result.match_justification
            })
            time.sleep(1)

        batch_results = sorted(batch_results, key=lambda x: x["fitScore"], reverse=True)
        return {
            "status": "success",
            "total_evaluated": len(batch_results),
            "results": batch_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))