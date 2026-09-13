"use client"

import { useRef, useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  UploadCloud,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SAMPLE_RESUME_TEXT } from "@/lib/hr-data"
import type { CandidateResult, JobDescription, LogLevel } from "@/lib/hr-types"
import { ScoreRing } from "./score-ring"
import { RecommendationBadge } from "./recommendation-badge"
import { TabIntro } from "./tab-intro"

interface SingleEvaluationProps {
  activeJd: JobDescription | null
  addLog: (message: string, level?: LogLevel) => void
}

export function SingleEvaluation({ activeJd, addLog }: SingleEvaluationProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jdMode, setJdMode] = useState<"active" | "paste">("active")
  const [jdText, setJdText] = useState("")
  const [dragging, setDragging] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<CandidateResult | null>(null)
  const [justificationOpen, setJustificationOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canEvaluate = !!resumeFile && (jdMode === "paste" ? jdText.trim().length > 0 : !!activeJd)

  function ingestFile(file: File) {
    setResumeFile(file)
    setResumeFileName(file.name)
    setResumeText(SAMPLE_RESUME_TEXT)
    addLog(`Resume ingested: ${file.name} — ready for live analysis.`)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      ingestFile(file)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      ingestFile(file)
    }
  }

  const runEvaluation = async () => {
    if (!canEvaluate || !resumeFile) return

    setEvaluating(true)
    setResult(null)
    addLog("Sending single candidate resume to live backend for semantic evaluation...")

    const formData = new FormData()
    const targetJdContent = jdMode === "paste" ? jdText : activeJd?.content || activeJd?.description || activeJd?.title || "General Evaluation"
    
    formData.append("job_description", targetJdContent)
    formData.append("resume", resumeFile)

    try {
      const response = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST",
        body: formData,
      })

      const evaluated = await response.json()

      if (response.ok && evaluated) {
        setResult(evaluated)
        addLog(
          `Evaluation complete — Fit Score ${evaluated.fitScore}/100, recommendation "${evaluated.recommendation}".`,
          evaluated.recommendation === "Reject" ? "warning" : "success",
        )
      } else {
        addLog(`Server error: ${evaluated.detail || "Unknown error"}`, "warning")
      }
    } catch (error) {
      addLog(`Failed to connect to backend: ${error}`, "warning")
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="space-y-6">
      <TabIntro
        icon={Sparkles}
        gradient="from-violet-600 to-blue-600"
        eyebrow="Single Candidate Assessment"
        heading="Read one résumé the way your sharpest recruiter would — in seconds, not hours"
        painPoint="Drop in a single applicant and let deep semantic matching weigh every skill, role, and achievement against your live job description. You get a defensible fit score, the strengths worth championing, and the gaps worth probing — so your opening interview question lands sharper than a competitor's final one."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resume ingestion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Resume Ingestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
                dragging ? "border-primary bg-muted/60" : "border-border hover:border-muted-foreground/40",
              )}
            >
              <UploadCloud className="mb-2 h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium">Drag &amp; drop resume here</p>
              <p className="text-xs text-muted-foreground">PDF up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button variant="outline" size="sm" className="mt-4" type="button">
                <Upload className="h-4 w-4" />
                Upload Resume PDF
              </Button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Text extraction preview
                </span>
                {resumeFileName && (
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    {resumeFileName}
                  </Badge>
                )}
              </div>
              <div className="h-40 overflow-auto rounded-md border bg-muted/40 p-3">
                {resumeFile ? (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                    Selected file ready for backend extraction: {resumeFileName}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">Extracted resume text will appear here.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job description input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="inline-flex rounded-lg border bg-muted p-1">
              <button
                type="button"
                onClick={() => setJdMode("active")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  jdMode === "active" ? "bg-background shadow-sm" : "text-muted-foreground",
                )}
              >
                Use loaded JD
              </button>
              <button
                type="button"
                onClick={() => setJdMode("paste")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  jdMode === "paste" ? "bg-background shadow-sm" : "text-muted-foreground",
                )}
              >
                Upload / paste text
              </button>
            </div>

            {jdMode === "active" ? (
              <div className="space-y-3">
                {activeJd ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{activeJd.title}</span>
                      <Badge variant="outline" className="font-normal">
                        {activeJd.department}
                      </Badge>
                      <Badge variant="outline" className="font-normal">
                        {activeJd.experienceThreshold}+ yrs
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeJd.competencies.map((c) => (
                        <Badge key={c} variant="secondary" className="font-normal">
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <div className="h-28 overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      {activeJd.content}
                    </div>
                  </>
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No job description loaded in memory. Deploy one from the Job Description Manager,
                    or paste text instead.
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here, or upload a JD PDF..."
                className="min-h-[184px] resize-none font-mono text-xs"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={runEvaluation} disabled={!canEvaluate || evaluating} size="lg">
          {evaluating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Evaluating candidate...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Run Match Evaluation
            </>
          )}
        </Button>
      </div>

      {/* Results dashboard */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Match Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <ScoreRing score={result.fitScore} />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recommendation</p>
                  <RecommendationBadge recommendation={result.recommendation} className="text-sm" />
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Candidate: <span className="font-medium text-foreground">{result.name}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Matching Skills ({result.matchingSkills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills?.map((s) => (
                    <Badge key={s} className="gap-1 bg-emerald-500/10 font-normal text-emerald-600 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-500/10">
                      <CheckCircle2 className="h-3 w-3" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-destructive">
                  <XCircle className="h-4 w-4" />
                  Missing Skills ({result.missingSkills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills && result.missingSkills.length ? (
                    result.missingSkills.map((s) => (
                      <Badge key={s} className="gap-1 bg-destructive/10 font-normal text-destructive ring-1 ring-inset ring-destructive/20 hover:bg-destructive/10">
                        <XCircle className="h-3 w-3" />
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None — all competencies met.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border">
              <button
                onClick={() => setJustificationOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              >
                Match Justification
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", justificationOpen && "rotate-180")}
                />
              </button>
              {justificationOpen && (
                <div className="border-t px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {result.justification}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}