import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function TabIntro({
  icon: Icon,
  eyebrow,
  heading,
  painPoint,
  gradient,
}: {
  icon: LucideIcon
  eyebrow: string
  heading: string
  painPoint: string
  gradient: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5 sm:p-6">
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
          gradient,
        )}
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            gradient,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1.5">
          <span
            className={cn(
              "bg-gradient-to-r bg-clip-text text-xs font-semibold uppercase tracking-wider text-transparent",
              gradient,
            )}
          >
            {eyebrow}
          </span>
          <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">{heading}</h1>
          <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground">{painPoint}</p>
        </div>
      </div>
    </div>
  )
}
