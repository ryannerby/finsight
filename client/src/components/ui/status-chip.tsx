import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusChipVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        good: "border-transparent bg-good text-good-foreground",
        caution: "border-transparent bg-caution text-caution-foreground",
        risk: "border-transparent bg-risk text-risk-foreground",
        info: "border-transparent bg-info text-info-foreground",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "default",
    },
  }
)

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusChipVariants> {
  children: React.ReactNode
}

function StatusChip({ 
  className, 
  variant, 
  size, 
  children, 
  ...props 
}: StatusChipProps) {
  return (
    <div 
      className={cn(statusChipVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export { StatusChip, statusChipVariants }
