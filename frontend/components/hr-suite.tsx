"use client"

import { useCallback, useState } from "react"

import { AuthView } from "@/components/hr/auth-view"
import { HeaderBar, type TabKey } from "@/components/hr/header-bar"
import { SingleEvaluation } from "@/components/hr/single-evaluation"
import { BatchAnalysis } from "@/components/hr/batch-analysis"
import { JdManager } from "@/components/hr/jd-manager"
import { SystemConsole } from "@/components/hr/system-console"
import { initialJobDescriptions } from "@/lib/hr-data"
import type { JobDescription, LogEntry, LogLevel, SessionUser } from "@/lib/hr-types"

export function HrSuite() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("single")
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(initialJobDescriptions)
  const [activeJdId, setActiveJdId] = useState<string | null>(initialJobDescriptions[0]?.id ?? null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const activeJd = jobDescriptions.find((j) => j.id === activeJdId) ?? null

  const addLog = useCallback((message: string, level: LogLevel = "info") => {
    setLogs((prev) => [
      ...prev.slice(-99),
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: new Date().toLocaleTimeString([], { hour12: false }),
        level,
        message,
      },
    ])
  }, [])

  function handleAuthenticated(u: SessionUser) {
    setUser(u)
    setLogs([])
    setTimeout(() => addLog(`Authenticated as ${u.email}. Session established.`, "success"), 0)
  }

  function handleSignOut() {
    if (user) addLog(`Signed out ${user.email}.`, "warning")
    setUser(null)
  }

  function handleDeploy(jd: JobDescription) {
    setActiveJdId(jd.id)
    addLog(`Job description "${jd.title}" (v${jd.version}) loaded into memory for evaluation.`, "success")
  }

  function handleSaveJd(jd: JobDescription) {
    setJobDescriptions((prev) => {
      const exists = prev.some((j) => j.id === jd.id)
      return exists ? prev.map((j) => (j.id === jd.id ? jd : j)) : [...prev, jd]
    })
  }

  function handleDeleteJd(id: string) {
    setJobDescriptions((prev) => prev.filter((j) => j.id !== id))
    if (activeJdId === id) setActiveJdId(null)
  }

  if (!user) {
    return <AuthView onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <HeaderBar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeJd={activeJd}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "single" && <SingleEvaluation activeJd={activeJd} addLog={addLog} />}
        {activeTab === "batch" && <BatchAnalysis activeJd={activeJd} addLog={addLog} />}
        {activeTab === "jd" && (
          <JdManager
            jobDescriptions={jobDescriptions}
            activeJdId={activeJdId}
            onDeploy={handleDeploy}
            onSave={handleSaveJd}
            onDelete={handleDeleteJd}
            addLog={addLog}
          />
        )}
      </main>

      <SystemConsole logs={logs} onClear={() => setLogs([])} />
    </div>
  )
}
