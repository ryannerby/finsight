import * as React from "react"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div ref={triggerRef}>{children}</div>
      {open && (
        <div
          role="tooltip"
          className="absolute z-50 max-w-xs rounded-md border bg-popover text-popover-foreground px-2 py-1 text-xs shadow-md"
          style={{
            top: side === 'bottom' ? '100%' : side === 'top' ? 'auto' : '50%',
            bottom: side === 'top' ? '100%' : 'auto',
            left: side === 'right' ? '100%' : side === 'left' ? 'auto' : '50%',
            right: side === 'left' ? '100%' : 'auto',
            transform:
              side === 'top' || side === 'bottom'
                ? 'translateX(-50%) translateY(6px)'
                : 'translateY(-50%) translateX(6px)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}



