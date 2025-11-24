"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const styles = {
  scrollArea: {
    height: '100%',
    width: '100%',
    borderRadius: 'inherit',
  },
}

function ScrollArea({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      style={style}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        style={styles.scrollArea}
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      style={{
        display: 'flex',
        touchAction: 'none',
        padding: '1px',
        transition: 'colors 200ms',
        userSelect: 'none',
        ...(orientation === "vertical" ? {
          height: '100%',
          width: '10px',
          borderLeft: '1px solid transparent'
        } : {
          height: '10px',
          flexDirection: 'column',
          borderTop: '1px solid transparent'
        })
      }}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        style={{
          backgroundColor: 'var(--op-color-neutral-plus-six)',
          position: 'relative',
          flex: 1,
          borderRadius: '9999px'
        }}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
