"use client"

import * as React from "react"

import { cn } from "@/src/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block mb-[5px] text-xs text-foreground/50 tracking-[0.4px] uppercase leading-none font-medium select-none",
        className
      )}
      {...props}
    />
  )
}

export { Label }
