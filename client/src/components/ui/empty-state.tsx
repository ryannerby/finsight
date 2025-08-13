import * as React from "react"

interface EmptyStateProps {
  title: string
  helper?: string
  action?: React.ReactNode
}

export function EmptyState({ title, helper, action }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="text-foreground/30 mb-2">
        <svg className="mx-auto h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      </div>
      <div className="font-medium">{title}</div>
      {helper && <div className="text-sm text-muted-foreground mt-1">{helper}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}


