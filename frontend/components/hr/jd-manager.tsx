"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Eye,
  FolderKanban,
  Pencil,
  Plus,
  Rocket,
  Save,
  Trash2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { JobDescription, LogLevel } from "@/lib/hr-types"
import { TabIntro } from "./tab-intro"

interface JdManagerProps {
  jobDescriptions: JobDescription[]
  activeJdId: string | null
  onDeploy: (jd: JobDescription) => void
  onSave: (jd: JobDescription) => void
  onDelete: (id: string) => void
  addLog: (message: string, level?: LogLevel) => void
}

const EMPTY = { title: "", department: "", competencies: "", experienceThreshold: "3", content: "" }

export function JdManager({
  jobDescriptions,
  activeJdId,
  onDeploy,
  onSave,
  onDelete,
  addLog,
}: JdManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState<JobDescription | null>(null)

  function resetForm() {
    setForm(EMPTY)
    setEditingId(null)
  }

  function startEdit(jd: JobDescription) {
    setEditingId(jd.id)
    setForm({
      title: jd.title,
      department: jd.department,
      competencies: jd.competencies.join(", "),
      experienceThreshold: String(jd.experienceThreshold),
      content: jd.content,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleSave() {
    if (!form.title.trim()) {
      addLog("Cannot save job description without a title.", "error")
      return
    }
    const existing = jobDescriptions.find((j) => j.id === editingId)
    const jd: JobDescription = {
      id: editingId ?? `jd-${Math.random().toString(36).slice(2, 8)}`,
      title: form.title.trim(),
      department: form.department.trim() || "General",
      competencies: form.competencies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experienceThreshold: Number(form.experienceThreshold) || 0,
      content: form.content.trim(),
      version: existing ? existing.version + 1 : 1,
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
    }
    onSave(jd)
    addLog(
      existing
        ? `Job description "${jd.title}" updated to version ${jd.version}.`
        : `New job description "${jd.title}" created.`,
      "success",
    )
    resetForm()
  }

  return (
    <div className="space-y-6">
      <TabIntro
        icon={FolderKanban}
        gradient="from-teal-500 to-blue-600"
        eyebrow="Job Description Repository"
        heading="One source of truth for every role you hire — versioned, consistent, always in sync"
        painPoint="Author, refine, and version-control every job profile in a single library, then deploy the exact requirement set your evaluations run against. When a role evolves, your scoring evolves with it — no stale criteria, no drift between cycles, and no two recruiters grading by different rules."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              {editingId ? "Edit Job Description" : "Create Job Description"}
            </CardTitle>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
                New
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Role title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Full-Stack Engineer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dept">Department tag</Label>
                <Input
                  id="dept"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Experience (yrs)</Label>
                <Input
                  id="exp"
                  type="number"
                  min={0}
                  value={form.experienceThreshold}
                  onChange={(e) => setForm({ ...form, experienceThreshold: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Essential competencies</Label>
              <Input
                id="skills"
                value={form.competencies}
                onChange={(e) => setForm({ ...form, competencies: e.target.value })}
                placeholder="React, TypeScript, Node.js, AWS"
              />
              <p className="text-xs text-muted-foreground">Comma-separated skill requirements.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Role description</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Describe responsibilities, scope, and requirements..."
                className="min-h-[120px] resize-none"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4" />
              {editingId ? "Save Changes" : "Create Job Description"}
            </Button>
          </CardContent>
        </Card>

        {/* Library */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              Active JD Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden sm:table-cell">Dept</TableHead>
                    <TableHead className="hidden md:table-cell">Ver.</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobDescriptions.map((jd) => (
                    <TableRow key={jd.id} className={cn(activeJdId === jd.id && "bg-muted/50")}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 font-medium">
                            {jd.title}
                            {activeJdId === jd.id && (
                              <Badge className="gap-1 bg-emerald-500/10 font-normal text-emerald-600 ring-1 ring-inset ring-emerald-500/20 hover:bg-emerald-500/10">
                                <CheckCircle2 className="h-3 w-3" />
                                In memory
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {jd.competencies.length} competencies · {jd.experienceThreshold}+ yrs
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="font-normal">
                          {jd.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                        v{jd.version}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreview(jd)}
                            aria-label={`Preview ${jd.title}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(jd)}
                            aria-label={`Edit ${jd.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              onDelete(jd.id)
                              addLog(`Job description "${jd.title}" removed from repository.`, "warning")
                            }}
                            aria-label={`Delete ${jd.title}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button size="sm" onClick={() => onDeploy(jd)} disabled={activeJdId === jd.id}>
                            <Rocket className="h-4 w-4" />
                            Deploy
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {jobDescriptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                        No job descriptions yet. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview modal */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {preview.department}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  {preview.experienceThreshold}+ yrs
                </Badge>
                <Badge variant="outline" className="font-normal">
                  Version {preview.version}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preview.competencies.map((c) => (
                  <Badge key={c} variant="secondary" className="font-normal">
                    {c}
                  </Badge>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{preview.content}</p>
              <Button
                className="w-full"
                onClick={() => {
                  onDeploy(preview)
                  setPreview(null)
                }}
                disabled={activeJdId === preview.id}
              >
                <Rocket className="h-4 w-4" />
                Deploy to Memory
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
