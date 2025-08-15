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
  status?: string // Additional status text for screen readers
}

function StatusChip({ 
  className, 
  variant, 
  size, 
  children, 
  status,
  ...props 
}: StatusChipProps) {
  const getStatusIcon = () => {
    switch (variant) {
      case 'good':
        return '✓';
      case 'caution':
        return '⚠';
      case 'risk':
        return '✗';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  const getStatusDescription = () => {
    switch (variant) {
      case 'good':
        return 'Good status';
      case 'caution':
        return 'Caution status';
      case 'risk':
        return 'Risk status';
      case 'info':
        return 'Information status';
      default:
        return 'Status';
    }
  };

  return (
    <div 
      className={cn(statusChipVariants({ variant, size }), className)} 
      role="status"
      aria-label={`${status || children}: ${getStatusDescription()}`}
      {...props}
    >
      <span className="mr-1" aria-hidden="true">{getStatusIcon()}</span>
      {children}
    </div>
  )
}

export { StatusChip, statusChipVariants }
