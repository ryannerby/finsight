import * as React from "react"

interface InlineErrorProps {
  message: string
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md border border-danger/30 bg-danger/5 text-danger">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12" y2="16" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  )
}



