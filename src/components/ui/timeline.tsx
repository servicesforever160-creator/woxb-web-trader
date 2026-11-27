"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Check, Minus, RotateCcw } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { VerificationStep } from "../dashboard/verification-dialog/types/verification-dialog";

export type TimelineItemData = {
    id: string;
    step?: VerificationStep;
    title: React.ReactNode;
    description?: React.ReactNode;
    content?: React.ReactNode;
    completed?: boolean;
    skipped?: boolean;
    active?: boolean;
};

type TimelineProps = {
    items: TimelineItemData[];
    className?: string;
    initialDelay?: number;
    itemDelay?: number;
    animationDuration?: number;
    once?: boolean;

    /**
     * Called when a skipped item is resumed.
     */
    onResume?: (item: TimelineItemData) => void;
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -12,
    },

    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: "easeOut",
        },
    },
};

export function Timeline({
    items,
    className,
    initialDelay = 0.1,
    itemDelay = 0.05,
    animationDuration = 0.35,
    once = true,
    onResume,
}: TimelineProps) {
    return (
        <motion.div
            className={cn("relative", className)}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},

                visible: {
                    transition: {
                        delayChildren: initialDelay,
                        staggerChildren: itemDelay,
                    },
                },
            }}
        >
            {items.map((item, index) => (
                <TimelineItem
                    key={item.id}
                    item={item}
                    isLast={index === items.length - 1}
                    animationDuration={animationDuration}
                    onResume={onResume}
                />
            ))}
        </motion.div>
    );
}

type TimelineItemProps = {
    item: TimelineItemData;
    isLast: boolean;
    animationDuration: number;
    onResume?: (item: TimelineItemData) => void;
};

function TimelineItem({
    item,
    isLast,
    animationDuration,
    onResume,
}: TimelineItemProps) {
    const isCompleted = !!item.completed;
    const isSkipped = !!item.skipped;
    const isActive = !!item.active;

    const canResume =
        isSkipped &&
        !isCompleted &&
        !!onResume;

    return (
        <motion.div
            variants={itemVariants}
            className="relative flex gap-4 sm:gap-5"
        >
            {/* Rail */}
            {!isLast && (
                <div
                    aria-hidden="true"
                    className="absolute left-3 top-7 h-[calc(100%-1.25rem)] w-px overflow-hidden bg-border"
                >
                    <motion.div
                        className={cn(
                            "h-full w-full origin-top",
                            isCompleted
                                ? "bg-primary"
                                : isSkipped
                                    ? "bg-muted-foreground/30"
                                    : "bg-border"
                        )}
                        initial={{ scaleY: 0 }}
                        animate={{
                            scaleY:
                                isCompleted || isSkipped
                                    ? 1
                                    : 0,
                        }}
                        transition={{
                            duration:
                                animationDuration + 0.1,
                            ease: "easeInOut",
                        }}
                    />
                </div>
            )}

            {/* Point */}
            <TimelinePoint
                completed={isCompleted}
                skipped={isSkipped}
                active={isActive}
            />

            {/* Content */}
            <div className="min-w-0 flex-1 pb-8 sm:pb-10">
                <motion.button
                    type="button"
                    disabled={!canResume}
                    layout
                    onClick={() => {
                        if (canResume) {
                            onResume?.(item);
                        }
                    }}
                    className={cn(
                        "group relative flex w-full flex-col gap-1 rounded-2xl bg-accent p-2 px-4 text-left",

                        isSkipped && "opacity-60",

                        canResume &&
                        "cursor-pointer transition-colors hover:bg-accent/80",

                        !canResume &&
                        "cursor-default"
                    )}
                >
                    <div className="flex items-start justify-between gap-3">
                        <h3
                            className={cn(
                                "text-sm font-bold leading-5",

                                isCompleted || isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.title}
                        </h3>

                        {canResume && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    x: 4,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                className="shrink-0"
                            >
                                <RotateCcw
                                    className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary"
                                />
                            </motion.div>
                        )}
                    </div>

                    {item.description && (
                        <p
                            className={cn(
                                "text-xs leading-6 text-muted-foreground",
                                isSkipped &&
                                "text-muted-foreground/70"
                            )}
                        >
                            {item.description}
                        </p>
                    )}

                    {canResume && (
                        <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Click to resume
                        </span>
                    )}
                </motion.button>

                {item.content && (
                    <div className="mt-3 text-sm text-muted-foreground">
                        {item.content}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

type TimelinePointProps = {
    completed: boolean;
    skipped: boolean;
    active: boolean;
};

function TimelinePoint({
    completed,
    skipped,
    active,
}: TimelinePointProps) {
    return (
        <div className="relative z-10 flex size-6 shrink-0 items-center justify-center">
            <motion.div
                className={cn(
                    "relative flex size-6 items-center justify-center rounded-full border-2 bg-background",

                    completed
                        ? "border-primary bg-primary"
                        : skipped
                            ? "border-muted-foreground/40 bg-muted"
                            : active
                                ? "border-primary"
                                : "border-border"
                )}
                animate={
                    completed
                        ? { scale: [1, 1.15, 1] }
                        : { scale: 1 }
                }
                transition={{
                    duration: 0.35,
                    ease: "easeOut",
                }}
            >
                {/* Completed */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-primary"
                    animate={{
                        scale: completed ? 1 : 0,
                        opacity: completed ? 1 : 0,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                />

                {/* Skipped */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-muted"
                    animate={{
                        scale:
                            skipped && !completed
                                ? 1
                                : 0,
                        opacity:
                            skipped && !completed
                                ? 1
                                : 0,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                />

                {/* Pending / active */}
                {!completed && !skipped && (
                    <motion.div
                        className={cn(
                            "size-2 rounded-full",
                            active
                                ? "bg-primary"
                                : "bg-border"
                        )}
                        animate={{
                            scale: active ? 1 : 0.7,
                        }}
                    />
                )}

                {/* Check */}
                <motion.div
                    className="relative z-10"
                    initial={false}
                    animate={{
                        opacity: completed ? 1 : 0,
                        scale: completed ? 1 : 0,
                    }}
                    transition={{
                        duration: 0.2,
                        delay: completed ? 0.08 : 0,
                        ease: "backOut",
                    }}
                >
                    <Check className="size-3.5 text-primary-foreground ml-3" strokeWidth={3} />
                </motion.div>

                {/* Skip */}
                <motion.div
                    className="relative z-10"
                    animate={{
                        opacity:
                            skipped && !completed
                                ? 1
                                : 0,
                        scale:
                            skipped && !completed
                                ? 1
                                : 0,
                    }}
                    transition={{
                        duration: 0.2,
                    }}
                >
                    <Minus
                        className="size-3.5 text-muted-foreground"
                        strokeWidth={2.5}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}