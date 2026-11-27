"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { Button } from "@/src/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { motion } from "framer-motion"
import { useIsMobile } from "@/src/hooks/use-mobile"
import { MobileToastDrawer, showMobileToast } from "./mobile-toast"

const TOAST_TIMEOUT = 3000
const toast = ToastPrimitive.createToastManager()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

let isMobile = false

function setMobileState(value: boolean) {
  isMobile = value
}

function ToastViewport({
  className,
  position = "top-right",
  ...props
}: ToastPrimitive.Viewport.Props & {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}) {
  const positions = {
    "top-right": "top-4 right-3",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <ToastPrimitive.Viewport
      className={cn(
        "pointer-events-none fixed z-9999 w-full max-w-sm",
        positions[position],
        className
      )}
      {...props}
    />
  );
}

function Toast({ className, type, ...props }: ToastPrimitive.Root.Props & {
  type?: string | undefined;
}) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        `
        group/toast
        pointer-events-auto
        absolute
        z-[calc(1000-var(--toast-index))]
        right-0
        w-full
        overflow-hidden
        rounded-lg
        border
        bg-background-muted
        text-popover-foreground
        shadow-xl
        shadow-primary/5
        outline-none
        select-none

        transition-all
        duration-300
        ease-[cubic-bezier(0.22,1,0.36,1)]

        data-starting-style:opacity-0
        data-starting-style:translate-x-full

        data-ending-style:opacity-0
        data-ending-style:translate-x-full

        data-expanded:opacity-100
        data-expanded:translate-x-0
        `,
        className
      )}
      {...props}
    >
      {props.children}

      <motion.div
        className={cn(
          `absolute bottom-0 left-0 h-1 w-full origin-left ${props}`,
          {
            "bg-green-500": type === "success",
            "bg-blue-500": type === "info",
            "bg-yellow-500": type === "warning",
            "bg-red-500": type === "error",
            "bg-primary": type === "loading",
          },
        )}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{
          duration: TOAST_TIMEOUT / 1000,
          ease: "linear",
        }}
      />
    </ToastPrimitive.Root>
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        {},
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm text-primary font-medium", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-foreground", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className
      )}
      {...props}
    >
      {children ?? (
        <XIcon aria-hidden="true" />
      )}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = (
      <CircleCheckIcon aria-hidden="true" />
    )
  }

  if (type === "info") {
    icon = (
      <InfoIcon aria-hidden="true" />
    )
  }

  if (type === "warning") {
    icon = (
      <TriangleAlertIcon aria-hidden="true" />
    )
  }

  if (type === "error") {
    icon = (
      <OctagonXIcon className="text-destructive" aria-hidden="true" />
    )
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon className="animate-spin" aria-hidden="true" />
    )
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} type={toastItem.type}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle className={toastItem.type === "success" ? "text-green-600" : toastItem.type === "error" ? "text-red-500" : ""} />
          <ToastDescription className={toastItem.type === "success" ? "text-green-600" : toastItem.type === "error" ? "text-red-500" : ""} />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {

  const mobile = useIsMobile()

  React.useEffect(() => {
    setMobileState(mobile)

    return () => {
      setMobileState(false)
    }
  }, [mobile])

  return (
    <ToastProvider timeout={TOAST_TIMEOUT} toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
      <MobileToastDrawer />
    </ToastProvider>
  )
}

let activeToastId: string | undefined

const addToast = (
  options: Parameters<typeof toast.add>[0]
) => {
  if (isMobile) {
    showMobileToast({
      id: crypto.randomUUID(),
      title: options.title,
      description: options.description,
      type: options.type,
      actionProps: options.actionProps,
    })

    return
  } else {
    if (activeToastId !== undefined) {
      toast.close(activeToastId)
    }

    activeToastId = toast.add(options)

    return activeToastId
  }
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  addToast,
  useToastManager,
}
