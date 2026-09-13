import type { CandidateResult, JobDescription, Recommendation } from "./hr-types"

export const SKILL_POOL = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "GraphQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "System Design",
  "CI/CD",
  "REST APIs",
  "Redis",
  "Terraform",
  "Go",
  "Machine Learning",
  "Data Modeling",
  "Microservices",
  "Next.js",
  "Testing",
]

export const initialJobDescriptions: JobDescription[] = [
  {
    id: "jd-1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    competencies: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "System Design"],
    experienceThreshold: 5,
    version: 3,
    createdAt: "2025-08-12",
    content:
      "We are seeking a Senior Full-Stack Engineer to design, build, and scale customer-facing products. You will own features end to end, collaborate with product and design, and mentor engineers. Strong experience with React, TypeScript, Node.js, relational databases, and cloud infrastructure is required.",
  },
  {
    id: "jd-2",
    title: "Data Platform Engineer",
    department: "Data",
    competencies: ["Python", "AWS", "Docker", "Data Modeling", "CI/CD", "Kubernetes"],
    experienceThreshold: 4,
    version: 1,
    createdAt: "2025-09-01",
    content:
      "The Data Platform Engineer will build reliable data pipelines and tooling that power analytics and ML across the company. Expertise in Python, distributed systems, containerization, and cloud-native data infrastructure is essential.",
  },
]

const FIRST_NAMES = [
  "Alex",
  "Priya",
  "Jordan",
  "Mei",
  "Diego",
  "Sara",
  "Liam",
  "Amara",
  "Noah",
  "Yuki",
  "Omar",
  "Elena",
  "Kwame",
  "Ravi",
  "Chloe",
  "Tomás",
]
const LAST_NAMES = [
  "Chen",
  "Patel",
  "Okafor",
  "Rossi",
  "Nguyen",
  "Kim",
  "Silva",
  "Haddad",
  "Johnson",
  "Ivanova",
  "Mbeki",
  "Larsson",
  "Garcia",
  "Yamamoto",
  "Cohen",
  "Ahmed",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sample<T>(arr: T[], count: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < count && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

export function recommendationForScore(score: number): Recommendation {
  if (score >= 75) return "Shortlist"
  if (score >= 55) return "Maybe"
  return "Reject"
}

export function randomName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
}

export function evaluateAgainst(required: string[], name: string, fileName: string): CandidateResult {
  const matchCount = Math.max(1, Math.min(required.length, Math.round(Math.random() * required.length)))
  const matchingSkills = sample(required, matchCount)
  const missingSkills = required.filter((s) => !matchingSkills.includes(s))
  const extraSkills = sample(
    SKILL_POOL.filter((s) => !required.includes(s)),
    Math.floor(Math.random() * 3),
  )
  const base = (matchingSkills.length / required.length) * 100
  const jitter = Math.round((Math.random() - 0.3) * 18)
  const fitScore = Math.max(18, Math.min(98, Math.round(base + jitter)))
  const recommendation = recommendationForScore(fitScore)

  const justification =
    `${name} matches ${matchingSkills.length} of ${required.length} core competencies. ` +
    (matchingSkills.length
      ? `Demonstrated strength in ${matchingSkills.slice(0, 3).join(", ")}. `
      : "") +
    (missingSkills.length
      ? `Gaps identified in ${missingSkills.slice(0, 3).join(", ")}, which are weighted heavily for this role. `
      : "Meets all listed competencies. ") +
    (extraSkills.length ? `Brings additional exposure to ${extraSkills.join(", ")}. ` : "") +
    `Semantic alignment with the job description scored ${fitScore}/100, leading to a "${recommendation}" recommendation.`

  return {
    id: `cand-${Math.random().toString(36).slice(2, 9)}`,
    name,
    fileName,
    fitScore,
    recommendation,
    matchingSkills,
    missingSkills,
    justification,
  }
}

export const SAMPLE_RESUME_TEXT = `JORDAN CHEN
Senior Software Engineer  |  jordan.chen@email.com  |  San Francisco, CA

SUMMARY
Full-stack engineer with 6 years of experience building scalable web
applications. Specialized in React, TypeScript, and cloud-native services.

EXPERIENCE
Lead Engineer — Northwind Labs (2021–Present)
  - Architected a multi-tenant SaaS platform on AWS serving 40k+ users.
  - Led migration to a TypeScript + Node.js microservices stack.
Software Engineer — Bright Systems (2018–2021)
  - Built React dashboards and REST/GraphQL APIs backed by PostgreSQL.

SKILLS
React, TypeScript, Node.js, PostgreSQL, AWS, Docker, GraphQL, CI/CD`
