export type Recommendation = "Shortlist" | "Maybe" | "Reject"

export interface JobDescription {
  id: string
  title: string
  department: string
  competencies: string[]
  experienceThreshold: number
  content: string
  version: number
  createdAt: string
}

export interface CandidateResult {
  id: string
  name: string
  fileName: string
  fitScore: number
  recommendation: Recommendation
  matchingSkills: string[]
  missingSkills: string[]
  justification: string
}

export type LogLevel = "info" | "success" | "warning" | "error"

export interface LogEntry {
  id: string
  time: string
  level: LogLevel
  message: string
}

export interface SessionUser {
  name: string
  email: string
  role: string
}
