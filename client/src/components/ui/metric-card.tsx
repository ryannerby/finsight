import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip } from "./tooltip"

export interface MetricCardProps {
  label: string
  value: React.ReactNode
  status?: 'good' | 'warning' | 'bad' | 'neutral'
  tooltip?: string
  className?: string
  ariaLabel?: string
}

export function MetricCard({ label, value, status = 'neutral', tooltip, className, ariaLabel }: MetricCardProps) {
  const statusRing =
    status === 'good' ? 'ring-green-500/30' : status === 'warning' ? 'ring-yellow-500/30' : status === 'bad' ? 'ring-red-500/30' : 'ring-[hsl(var(--secondary))]/20'

  const content = (
    <div
      className={cn(
        "group relative h-full w-[220px] rounded-lg border p-4 flex flex-col items-center justify-center gap-1 text-center",
        "bg-card text-card-foreground",
        statusRing,
        // uniform card height across grids
        "min-h-[112px]",
        className,
      )}
      aria-label={ariaLabel || label}
      role="group"
      tabIndex={0}
    >
      <div className="text-xs text-muted-foreground tracking-wide uppercase">{label}</div>
      <div className="mt-1 text-2xl font-semibold leading-tight">{value}</div>
    </div>
  )

  if (!tooltip) return content
  return (
    <Tooltip content={tooltip}>
      {content}
    </Tooltip>
  )
}


