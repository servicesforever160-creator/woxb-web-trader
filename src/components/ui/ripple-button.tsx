"use client";

import { Button } from "@/src/components/ui/button";
import * as React from "react";

import { cn } from "@/src/lib/utils";

type Ripple = {
    x: number;
    y: number;
    size: number;
    id: number;
};

type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function RippleButton({
    className,
    children,
    onClick,
    ...props
}: RippleButtonProps) {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height) * 2;

        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const id = Date.now() + Math.random();

        setRipples((current) => [
            ...current,
            {
                x,
                y,
                size,
                id,
            },
        ]);

        onClick?.(event);
    };

    const removeRipple = (id: number) => {
        setRipples((current) =>
            current.filter((ripple) => ripple.id !== id),
        );
    };

    return (
        <Button variant="unstyled"
            {...props}
            onClick={handleClick}
            className={cn(
                "relative isolate overflow-hidden",
                className,
            )}
        >
            {children}

            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
                {ripples.map((ripple) => (
                    <span
                        key={ripple.id}
                        className="absolute rounded-full bg-current/10 animate-ripple"
                        style={{
                            width: ripple.size,
                            height: ripple.size,
                            left: ripple.x,
                            top: ripple.y,
                        }}
                        onAnimationEnd={() =>
                            removeRipple(ripple.id)
                        }
                    />
                ))}
            </span>
        </Button>
    );
}