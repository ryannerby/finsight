import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  updatedAt?: string | Date
  rightSlot?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, updatedAt, rightSlot, className }: SectionHeaderProps) {
  const dateText = updatedAt ? (typeof updatedAt === 'string' ? new Date(updatedAt).toLocaleString() : updatedAt.toLocaleString()) : null
  return (
    <div className={cn("flex items-center justify-between py-6", className)}>
      <div className="text-section">{title}</div>
      <div className="flex items-center gap-3">
        {rightSlot}
        {dateText && (
          <div className="flex items-center gap-1 text-caption text-muted-foreground" aria-label={`Updated ${dateText}`}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Updated {dateText}</span>
          </div>
        )}
      </div>
    </div>
  )
}



