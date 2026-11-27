"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";

import { cn } from "@/src/lib/utils";
import { Button } from "./button";

type TimeSelectProps = {
    value?: string;
    onChange?: (value: string) => void;

    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    placeholder?: string;
    disabled?: boolean;

    className?: string;
};

type ClockMode = "hour" | "minute";

const CLOCK_SIZE = 220;
const CLOCK_CENTER = CLOCK_SIZE / 2;
const CLOCK_RADIUS = 82;

const formatTime = (time?: string) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return "";
    }

    const hour12 =
        hours % 12 === 0
            ? 12
            : hours % 12;

    const period =
        hours >= 12 ? "PM" : "AM";

    return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

export function TimeSelect({
    value,
    onChange,
    open,
    onOpenChange,
    placeholder = "Select time",
    disabled = false,
    className,
}: TimeSelectProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [draftValue, setDraftValue] = React.useState(value ?? "");
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const [selectedHour24, selectedMinute] = draftValue
        ? draftValue.split(":")
        : ["00", "00"];

    const hour24 = Number(selectedHour24);
    const minute = Number(selectedMinute);

    const selectedHour12 =
        hour24 % 12 === 0 ? 12 : hour24 % 12;

    const period: "AM" | "PM" =
        hour24 >= 12 ? "PM" : "AM";

    const [clockMode, setClockMode] =
        React.useState<ClockMode>("hour");

    const clockRef = React.useRef<HTMLDivElement>(null);

    const setOpen = (nextOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
    };

    React.useEffect(() => {
        if (isOpen) {
            setDraftValue(value ?? "");
            setClockMode("hour");
        }
    }, [isOpen]);


    const convertTo24Hour = (
        hour12: number,
        period: "AM" | "PM"
    ) => {
        if (period === "AM") {
            return hour12 === 12 ? 0 : hour12;
        }

        return hour12 === 12 ? 12 : hour12 + 12;
    };

    const handleTimeChange = (
        hour: number,
        minute: number
    ) => {
        const formattedHour = String(hour).padStart(2, "0");
        const formattedMinute = String(minute).padStart(2, "0");

        setDraftValue(
            `${formattedHour}:${formattedMinute}`
        );
    };

    const handleCancel = () => {
        setDraftValue(value ?? "");
        setOpen(false);
    };

    const handleApply = () => {
        onChange?.(draftValue);
        setOpen(false);
    };

    const handlePeriodChange = (
        nextPeriod: "AM" | "PM"
    ) => {
        const nextHour24 = convertTo24Hour(
            selectedHour12,
            nextPeriod
        );

        handleTimeChange(
            nextHour24,
            minute
        );
    };

    const getClockValue = (
        clientX: number,
        clientY: number
    ) => {
        if (!clockRef.current) return null;

        const rect =
            clockRef.current.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        const x = clientX - centerX;
        const y = clientY - centerY;

        let angle = Math.atan2(y, x);

        let degrees =
            (angle * 180) / Math.PI;

        // Make 12 o'clock = 0 degrees.
        degrees += 90;

        if (degrees < 0) {
            degrees += 360;
        }

        if (clockMode === "hour") {

            let hour12 =
                Math.round(degrees / 30) % 12;

            hour12 =
                hour12 === 0 ? 12 : hour12;

            return {
                value: hour12,
                formatted: String(hour12),
            };
        }


        const minute =
            Math.round(degrees / 6) % 60;

        return {
            value: minute,
            formatted: String(minute).padStart(2, "0"),
        };
    };

    const selectFromPointer = (
        clientX: number,
        clientY: number
    ) => {
        const result = getClockValue(
            clientX,
            clientY
        );

        if (!result) return;

        if (clockMode === "hour") {
            const nextHour24 = convertTo24Hour(
                result.value,
                period
            );

            handleTimeChange(
                nextHour24,
                minute
            );

            setClockMode("minute");
        } else {
            handleTimeChange(
                hour24,
                result.value
            );
        }
    };

    const handlePointerDown = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        event.currentTarget.setPointerCapture(
            event.pointerId
        );

        selectFromPointer(
            event.clientX,
            event.clientY
        );
    };

    const handlePointerMove = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {
            selectFromPointer(
                event.clientX,
                event.clientY
            );
        }
    };


    const currentValue =
        clockMode === "hour"
            ? selectedHour12
            : minute;


    const totalValues =
        clockMode === "hour"
            ? 12
            : 60;


    const [handAngle, setHandAngle] = React.useState(0);
    const previousAngleRef = React.useRef(0);

    const getShortestAngle = (
        targetAngle: number,
        previousAngle: number
    ) => {
        let delta = targetAngle - previousAngle;

        if (delta > 180) {
            delta -= 360;
        }

        if (delta < -180) {
            delta += 360;
        }

        return previousAngle + delta;
    };

    const targetAngle =
        clockMode === "hour"
            ? ((selectedHour12 % 12) / 12) * 360
            : (minute / 60) * 360;

    React.useEffect(() => {
        const nextAngle = getShortestAngle(
            targetAngle,
            previousAngleRef.current
        );

        previousAngleRef.current = nextAngle;
        setHandAngle(nextAngle);
    }, [targetAngle]);

    const angle = handAngle;

    const handX =
        CLOCK_CENTER +
        Math.sin(
            (angle * Math.PI) / 180
        ) *
        CLOCK_RADIUS;

    const handY =
        CLOCK_CENTER -
        Math.cos(
            (angle * Math.PI) / 180
        ) *
        CLOCK_RADIUS;

    return (
        <Popover
            open={isOpen}
            onOpenChange={setOpen}
        >
            <PopoverTrigger
                render={
                    <motion.button
                        type="button"
                        disabled={disabled}
                        whileHover={
                            !disabled
                                ? { y: -1 }
                                : undefined
                        }
                        whileTap={
                            !disabled
                                ? { scale: 0.997 }
                                : undefined
                        }
                        className={cn(
                            `
                group flex min-h-10 w-full
                items-center justify-between
                rounded-lg
                border border-border
                bg-background-muted
                px-3
                py-2.5
                shadow-[0_3px_14px_rgba(0,0,0,0.03)]
                transition-[border-color,box-shadow]
                duration-200
                hover:border-primary/25
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:bg-[#101010]
                `,
                            className
                        )}
                    >
                        <span
                            className={cn(
                                "text-xs font-semibold",
                                value
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {value
                                ? `${String(selectedHour12).padStart(2, "0")}:${selectedMinute} ${period}`
                                : placeholder}
                        </span>

                        <ChevronDown
                            className="
                size-4 shrink-0
                text-foreground
                dark:text-primary
                transition-transform
                duration-300
                group-hover:translate-y-0.5
                "
                        />
                    </motion.button>
                }
            />

            <PopoverContent
                align="start"
                sideOffset={4}
                className="
                w-[280px]
                overflow-hidden
                rounded-xl
                border-border
                bg-popover
                p-0
                shadow-md
                "
            >
                {/* Header */}
                <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                        <Button variant="unstyled"
                            type="button"
                            onClick={() =>
                                setClockMode("hour")
                            }
                            className={cn(
                                `
                                rounded-md
                                px-2
                                py-1
                                text-2xl
                                font-semibold
                                tracking-tight
                                transition-colors
                                `,
                                clockMode === "hour"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {String(
                                selectedHour12
                            ).padStart(2, "0")}
                        </Button>

                        <span className="text-2xl font-semibold text-muted-foreground">
                            :
                        </span>

                        <Button variant="unstyled"
                            type="button"
                            onClick={() =>
                                setClockMode("minute")
                            }
                            className={cn(
                                `
                                rounded-md
                                px-2
                                py-1
                                text-2xl
                                font-semibold
                                tracking-tight
                                transition-colors
                                `,
                                clockMode === "minute"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {selectedMinute}
                        </Button>

                        {/* AM / PM */}
                        <div className="ml-2 flex rounded-md border border-border bg-muted/40 p-0.5">
                            {(["AM", "PM"] as const).map(
                                (item) => (
                                    <Button variant="unstyled"
                                        key={item}
                                        type="button"
                                        onClick={() =>
                                            handlePeriodChange(
                                                item
                                            )
                                        }
                                        className={cn(
                                            `
                                            rounded px-2
                                            py-1
                                            text-xs
                                            font-semibold
                                            transition-colors
                                            `,
                                            period === item
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {item}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mt-1 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Select {clockMode}
                    </div>
                </div>

                {/* Clock */}
                <div className="flex justify-center px-3 py-4">
                    <div
                        ref={clockRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        className="
                        relative
                        select-none
                        touch-none
                        cursor-pointer
                        "
                        style={{
                            width: CLOCK_SIZE,
                            height: CLOCK_SIZE,
                        }}
                    >
                        {/* Clock face */}
                        <div
                            className="
                            absolute
                            inset-0
                            rounded-full
                            bg-muted/40
                            dark:bg-muted/20
                            "
                        />

                        {/* Clock hand */}
                        <div
                            className="
                                absolute
                                left-1/2
                                top-1/2
                                h-[2px]
                                origin-left
                                bg-primary
                            "
                            style={{
                                width: CLOCK_RADIUS,
                                transform: `rotate(${angle - 90}deg)`,
                            }}
                        />
                        <div
                            className="
                                absolute
                                z-20
                                size-2.5
                                -translate-x-1/2
                                -translate-y-1/2
                                rounded-full
                                bg-primary
                            "
                            style={{
                                left: CLOCK_CENTER,
                                top: CLOCK_CENTER,
                            }}
                        />

                        <div
                            className="
                                absolute
                                z-40
                                flex
                                size-8
                                -translate-x-1/2
                                -translate-y-1/2
                                items-center
                                justify-center
                               bg-primary
                               rounded-full
                                text-sm
                                font-semibold
                                text-primary-foreground
                                shadow-sm
                            "
                            style={{
                                left: handX,
                                top: handY,
                            }}
                        >
                            {String(currentValue).padStart(2, "0")}
                        </div>

                        {Array.from({
                            length:
                                clockMode === "hour"
                                    ? 12
                                    : 12,
                        }).map((_, index) => {
                            const displayValue =
                                clockMode === "hour"
                                    ? index === 0
                                        ? 12
                                        : index
                                    : index * 5;

                            const displayText =
                                clockMode === "hour"
                                    ? String(
                                        displayValue
                                    )
                                    : String(
                                        displayValue
                                    ).padStart(
                                        2,
                                        "0"
                                    );

                            const total = 12;

                            const itemAngle =
                                (index / total) *
                                360;

                            const x =
                                CLOCK_CENTER +
                                Math.sin(
                                    (itemAngle *
                                        Math.PI) /
                                    180
                                ) *
                                CLOCK_RADIUS;

                            const y =
                                CLOCK_CENTER -
                                Math.cos(
                                    (itemAngle *
                                        Math.PI) /
                                    180
                                ) *
                                CLOCK_RADIUS;

                            const selected =
                                clockMode ===
                                    "hour"
                                    ? displayValue ===
                                    selectedHour12
                                    : displayValue ===
                                    minute;

                            return (
                                <motion.button
                                    key={displayText}
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        if (
                                            clockMode ===
                                            "hour"
                                        ) {
                                            const nextHour24 =
                                                convertTo24Hour(
                                                    displayValue,
                                                    period
                                                );

                                            handleTimeChange(
                                                nextHour24,
                                                minute
                                            );

                                            setClockMode(
                                                "minute"
                                            );
                                        } else {
                                            handleTimeChange(
                                                hour24,
                                                displayValue
                                            );
                                        }
                                    }}
                                    className={cn(
                                        `
                                        absolute
                                        z-30
                                        flex
                                        size-8
                                        -translate-x-1/2
                                        -translate-y-1/2
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-sm
                                        font-medium
                                        transition-colors
                                        `,
                                        selected
                                            ? "text-primary-foreground"
                                            : "text-foreground hover:bg-primary/10"
                                    )}
                                    style={{
                                        left: x,
                                        top: y,
                                    }}
                                    whileTap={{
                                        scale: 0.9,
                                    }}
                                >
                                    {!selected &&
                                        displayText}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <span className="text-xs font-semibold text-foreground">
                        {draftValue
                            ? formatTime(draftValue)
                            : "--:--"}
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handleApply}
                            disabled={!draftValue}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}