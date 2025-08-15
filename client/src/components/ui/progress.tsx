import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    variant?: "default" | "success" | "warning" | "destructive"
    label?: string
  }
>(({ className, value = 0, max = 100, variant = "default", label, ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    destructive: "bg-red-500"
  }

  const getVariantDescription = () => {
    switch (variant) {
      case 'success':
        return 'Success progress';
      case 'warning':
        return 'Warning progress';
      case 'destructive':
        return 'Error progress';
      default:
        return 'Progress';
    }
  };

  return (
    <div
      ref={ref}
      className={cn("w-full bg-secondary rounded-full h-2 overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `${getVariantDescription()}: ${percentage}% complete`}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out rounded-full",
          variantClasses[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
