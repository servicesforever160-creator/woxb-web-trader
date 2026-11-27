"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/src/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"
import { AnimatePresence, motion, useAnimationControls } from "framer-motion"

/* -------------------------------------------------------------------------- */
/*  Ripple (Material-style)                                                   */
/* -------------------------------------------------------------------------- */

type RippleData = { id: number; x: number; y: number; size: number }

function useRipple() {
  const [ripples, setRipples] = React.useState<RippleData[]>([])
  const nextId = React.useRef(0)

  const trigger = React.useCallback((e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Radius that reaches the farthest corner, so the ripple always fills the item
    const radius = Math.hypot(
      Math.max(x, rect.width - x),
      Math.max(y, rect.height - y)
    )
    const size = radius * 2

    setRipples((prev) => [
      ...prev,
      { id: nextId.current++, x: x - radius, y: y - radius, size },
    ])
  }, [])

  const remove = React.useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return { ripples, trigger, remove }
}

function RippleLayer({
  ripples,
  onDone,
}: {
  ripples: RippleData[]
  onDone: (id: number) => void
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full bg-primary/30"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              scale: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.55, ease: "easeOut", delay: 0.05 },
            }}
            onAnimationComplete={() => onDone(r.id)}
          />
        ))}
      </AnimatePresence>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Select                                                                    */
/* -------------------------------------------------------------------------- */

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  error,
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
  error?: boolean
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      aria-invalid={error || undefined}
      className={cn(
        "group flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-200 outline-none select-none hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:border-ring data-[popup-open]:ring-3 data-[popup-open]:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-[popup-open]:rotate-180 motion-reduce:transition-none" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  open,
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  > & { open?: boolean }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50 mt-0"
      >
        {/*
          Open/close animation is driven by Base UI's data-starting-style /
          data-ending-style attributes, so the popup animates both in AND out
          (Base UI keeps it mounted until the exit transition finishes).
        */}
        <SelectPrimitive.Popup
          {...props}
          className={cn(
            `
              group/popup relative isolate z-50
              w-(--anchor-width) min-w-36
              overflow-hidden rounded-xl
              bg-popover text-popover-foreground
              outline-none
              ring-1 ring-foreground/10
              shadow-lg

              [transform-origin:var(--transform-origin,top)]
              transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)]
              will-change-[opacity,transform]

              data-[starting-style]:scale-x-95 data-[starting-style]:scale-y-[0.6] data-[starting-style]:opacity-0
              data-[ending-style]:scale-95 data-[ending-style]:opacity-0
              data-[ending-style]:duration-150 data-[ending-style]:ease-[cubic-bezier(0.4,0,1,1)]

              motion-reduce:transition-none
            `,
            className
          )}
        >
          {/* Content fades in slightly after the surface expands, like Material menus */}
          <SelectPrimitive.List
            className="
              overflow-y-auto p-1.5
              transition-opacity duration-300 ease-out
              group-data-[starting-style]/popup:opacity-0
              group-data-[ending-style]/popup:opacity-0
              group-data-[ending-style]/popup:duration-100
              motion-reduce:transition-none
            "
          >
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  onPointerDown,
  ...props
}: SelectPrimitive.Item.Props) {
  const { ripples, trigger, remove } = useRipple()

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      onPointerDown={(e) => {
        if (e.button === 0 && !props.disabled) trigger(e)
        onPointerDown?.(e)
      }}
      className={cn(
        "relative flex w-full items-center gap-1.5 overflow-hidden rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors duration-150 focus:bg-primary/35 focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 hover:bg-sidebar-accent! cursor-pointer data-[selected]:bg-primary/10! data-[selected]:font-medium",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
      <RippleLayer ripples={ripples} onDone={remove} />
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}