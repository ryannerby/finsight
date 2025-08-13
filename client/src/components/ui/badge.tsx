import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
        secondary:
          "border-transparent bg-[hsl(var(--secondary))]/20 text-foreground",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-700",
        warning: "border-transparent bg-yellow-100 text-yellow-700",
        muted: "border-transparent bg-muted/20 text-foreground/70",
        info: "border-transparent bg-[hsl(var(--info))]/20 text-[hsl(var(--info))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }


