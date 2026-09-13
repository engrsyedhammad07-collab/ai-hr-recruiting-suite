"use client"

import { BrainCircuit, FileCheck2, LogOut, Layers, UserRound, FolderKanban } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { JobDescription, SessionUser } from "@/lib/hr-types"

export type TabKey = "single" | "batch" | "jd"

const NAV: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "single", label: "Single Candidate Evaluation", icon: UserRound },
  { key: "batch", label: "Batch Analysis Dashboard", icon: Layers },
  { key: "jd", label: "Job Description Manager", icon: FolderKanban },
]

interface HeaderBarProps {
  user: SessionUser
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  activeJd: JobDescription | null
  onSignOut: () => void
}

export function HeaderBar({ user, activeTab, onTabChange, activeJd, onSignOut }: HeaderBarProps) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-tight">
              AI-Powered HR Recruitment &amp; Resume Intelligence Suite
            </span>
            <span className="text-xs text-muted-foreground">Semantic candidate evaluation</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden max-w-[280px] items-center gap-1.5 truncate border-border bg-muted/60 py-1 font-normal md:flex"
          >
            <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="truncate">
              JD in memory:{" "}
              <span className="font-medium text-foreground">
                {activeJd ? activeJd.title : "None loaded"}
              </span>
            </span>
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3 transition-colors hover:bg-muted">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
                <span className="hidden h-2 w-2 rounded-full bg-emerald-500 sm:inline-block" aria-label="Active session" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{user.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onSignOut} className="hidden lg:inline-flex">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto px-2 sm:px-4">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
              activeTab === key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {activeTab === key && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </nav>
    </header>
  )
}
