import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import '@rolemodel/optics/dist/css/components/badge.css'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "danger" | "outline" | 'warning' | "notice" | 'primary' | 'outline'
  asChild?: boolean
}


function Badge({
  className,
  variant = "outline",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  const variantClass = {
    primary: "badge--primary",
    default: "badge",
    secondary: "badge--info",
    danger: "badge--danger",
    warning: "badge--warning",
    outline: "badge--outline",
    notice: "badge--notice",
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
