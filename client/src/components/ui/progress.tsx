import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    variant?: "default" | "success" | "warning" | "destructive"
  }
>(({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    destructive: "bg-red-500"
  }

  return (
    <div
      ref={ref}
      className={cn("w-full bg-secondary rounded-full h-2 overflow-hidden", className)}
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
