"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

import { cn } from "@/lib/utils"

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}) {
  const variantClass =
    {
      default: "btn btn--no-border",
      outline: "btn btn--secondary",
    }[variant] ?? "btn btn--no-border"

  const sizeClass =
    {
      default: "btn--medium",
      sm: "btn--small",
      lg: "btn--large",
    }[size] ?? "btn--medium"

  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn("toggle", variantClass, sizeClass, className)}
      {...props}
    />
  )
}

export { Toggle }
