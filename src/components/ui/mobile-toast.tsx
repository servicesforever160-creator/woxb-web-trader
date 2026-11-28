import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/src/components/ui/drawer"
import { Button } from "@/src/components/ui/button"
import {
    CheckCircle2,
    Info,
    TriangleAlert,
    OctagonX,
    Loader2,
    X,
} from "lucide-react"
import { type ComponentPropsWithoutRef, type ReactNode, useEffect, useState } from "react"

type MobileToast = {
    id: string
    title?: ReactNode
    description?: ReactNode
    type?: string
    actionProps?: ComponentPropsWithoutRef<"button">
}

let mobileToastListener: ((toast: MobileToast) => void) | null = null

export const showMobileToast = (toastData: MobileToast) => {
    mobileToastListener?.(toastData)
}

function ToastIcon({ type }: { type?: string }) {
    switch (type) {
        case "success":
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                    <CheckCircle2 className="size-8" />
                </div>
            )

        case "error":
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                    <OctagonX className="size-8" />
                </div>
            )

        case "warning":
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
                    <TriangleAlert className="size-8" />
                </div>
            )

        case "info":
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                    <Info className="size-8" />
                </div>
            )

        case "loading":
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Loader2 className="size-8 animate-spin" />
                </div>
            )

        default:
            return null
    }
}

export function MobileToastDrawer() {
    const [toastData, setToastData] = useState<MobileToast | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        mobileToastListener = (data) => {
            setToastData(data)
            setOpen(true)
        }

        return () => {
            mobileToastListener = null
        }
    }, [])

    const closeDrawer = () => {
        setOpen(false)
    }
    const action = toastData?.actionProps

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent className="px-4 pb-10">
                <DrawerHeader className="relative px-0 pt-6 text-left">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={closeDrawer}
                        className="absolute right-0 top-3 size-8 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="size-4" />
                    </Button>

                    <div className="w-full flex items-center pt-2">
                        <div className="w-full flex justify-center">
                            <ToastIcon type={toastData?.type} />
                        </div>

                    </div>
                    {toastData?.title && (
                        <DrawerTitle className=" w-full mt-2 text-foreground text-center font-semibold">
                            {toastData.title}
                        </DrawerTitle>
                    )}

                    {toastData?.description && (
                        <DrawerDescription className="mt-3 w-full text-foreground text-center text-sm leading-6">
                            {toastData.description}
                        </DrawerDescription>
                    )}
                </DrawerHeader>

                <div className="mt-8 px-0">
                    <Button
                        {...action}
                        type="button"
                        variant={"destructive"}
                        className={`w-full ${toastData?.type === "success" ? "bg-green-600" : toastData?.type === "error" ? "bg-red-500" : ""}`}
                        onClick={(event) => {
                            action?.onClick?.(event)
                            closeDrawer()
                        }}
                    >
                        {action?.children ?? "Okay"}
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
