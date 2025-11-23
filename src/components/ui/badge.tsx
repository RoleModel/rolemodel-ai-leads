import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
  asChild?: boolean
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  const variantClass = {
    default: "badge--primary",
    secondary: "badge--info",
    destructive: "badge--danger",
    outline: "badge--notice",
  }[variant] || "badge--primary"

  return (
    <Comp
      data-slot="badge"
      className={cn("badge", variantClass, className)}
      {...props}
    />
  )
}

export { Badge }
