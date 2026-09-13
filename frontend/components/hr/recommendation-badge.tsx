import { CheckCircle2, HelpCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/hr-types"

const CONFIG: Record<Recommendation, { icon: React.ElementType; className: string }> = {
  Shortlist: {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  },
  Maybe: {
    icon: HelpCircle,
    className: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
  },
  Reject: {
    icon: XCircle,
    className: "bg-destructive/10 text-destructive ring-destructive/20",
  },
}

export function RecommendationBadge({
  recommendation,
  className,
}: {
  recommendation: Recommendation
  className?: string
}) {
  const { icon: Icon, className: styles } = CONFIG[recommendation]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        styles,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {recommendation}
    </span>
  )
}
