import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        // Optics .btn-group handles styling.
        className={cn("btn-group", className)}
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

const ButtonGroupText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center px-3 text-sm font-medium", className)}
        {...props}
      />
    )
  }
)
ButtonGroupText.displayName = "ButtonGroupText"

const ButtonGroupSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-px bg-border mx-1 h-4", className)}
        {...props}
      />
    )
  }
)
ButtonGroupSeparator.displayName = "ButtonGroupSeparator"

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator }
