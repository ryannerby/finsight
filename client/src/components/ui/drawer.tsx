import * as React from "react"
import { createPortal } from "react-dom"

interface DrawerProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: string
  children?: React.ReactNode
  width?: number
}

export function Drawer({ open, onOpenChange, title, children, width = 420 }: DrawerProps) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className={open ? "fixed inset-0 z-50" : "hidden"} aria-hidden={!open}>
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute top-0 right-0 h-full bg-card text-card-foreground border-l shadow-xl" style={{ width }}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">{title}</div>
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => onOpenChange(false)} aria-label="Close drawer">✕</button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-48px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}


