"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronUp, Terminal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LogEntry } from "@/lib/hr-types"

const LEVEL_STYLES: Record<LogEntry["level"], string> = {
  info: "text-muted-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-destructive",
}

const LEVEL_LABEL: Record<LogEntry["level"], string> = {
  info: "INFO",
  success: "OK",
  warning: "WARN",
  error: "ERR",
}

export function SystemConsole({ logs, onClear }: { logs: LogEntry[]; onClear: () => void }) {
  const [open, setOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, open])

  return (
    <div className="sticky bottom-0 z-20 border-t bg-background">
      <div className="flex h-10 items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Terminal className="h-4 w-4 text-muted-foreground" />
          System Logs &amp; Utilities
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
            {logs.length}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <span className="mr-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Session active
          </span>
          <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear logs">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse console" : "Expand console"}
          >
            <ChevronUp className={cn("h-4 w-4 transition-transform", !open && "rotate-180")} />
          </Button>
        </div>
      </div>
      {open && (
        <div
          ref={scrollRef}
          className="max-h-40 overflow-auto border-t bg-muted/30 px-4 py-2 font-mono text-xs sm:px-6"
        >
          {logs.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No activity logged yet.</p>
          ) : (
            <ul className="space-y-1">
              {logs.map((log) => (
                <li key={log.id} className="flex gap-3">
                  <span className="shrink-0 text-muted-foreground/70">{log.time}</span>
                  <span className={cn("shrink-0 font-semibold", LEVEL_STYLES[log.level])}>
                    [{LEVEL_LABEL[log.level]}]
                  </span>
                  <span className="text-foreground/90">{log.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
