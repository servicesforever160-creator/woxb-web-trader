import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import Skeleton from "./skeleton";

export const FilterTabs = ({ items, active, setActive, variant = "default", loading, className }: { loading?: boolean, items: string[], active: string, setActive: (v: string) => void, variant?: "default" | "button", className?: string }) => {

    switch (variant) {
        case "button":
            return (<motion.div
                className={cn(`inline-flex rounded-xl border border-border
                            bg-card p-1 shadow
                            dark:shadow-none`,
                    className)}
            >
                {loading ? (
                    items.map((item) => (
                        <Skeleton key={item} className="h-9 min-w-[82px] rounded-lg" />
                    ))
                ) : items.map((item) => {
                    const isActive = active === item;

                    return (
                        <Button variant="unstyled"
                            key={item}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setActive(item)}
                            className={cn(
                                `
                                    relative h-9 min-w-[82px] rounded-lg px-4
                                    text-xs font-semibold transition-colors duration-150
                                    focus-visible:outline-none focus-visible:ring-2
                                    focus-visible:ring-primary/35
                                    cursor-pointer
                                  `,
                                isActive
                                    ? "text-foreground dark:text-card"
                                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="education-filter"
                                    className="
                                      absolute inset-0 rounded-lg
                                      border border-primary/15
                                      bg-primary
                                      text-background
                                      shadow-[0_3px_10px_rgba(16,24,40,0.06)]
                                    "
                                    transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 32,
                                    }}
                                />
                            )}

                            <span className="relative z-10">
                                {item}
                            </span>
                        </Button>
                    );
                })}
            </motion.div>)
        default:
            return <div className="flex items-center gap-1">
                {loading ? (
                    items.map((filter) => (
                        <Skeleton key={filter} className="h-8 w-16 mx-1.5 rounded-md" />
                    ))
                ) : items.map((filter) => {
                    const isActive = active === filter;
                    return (
                        <motion.button
                            key={filter}
                            type="button"
                            onClick={() => setActive(filter)}
                            whileTap={{ scale: 0.97 }}
                            className={`
                                        relative h-8 px-3.5
                                        text-xs font-medium
                                        text-muted-foreground
                                        transition-colors duration-150
                                        hover:text-foreground
                                        cursor-pointer
                                        ${isActive ? " text-foreground!" : ""}
                                      `}
                        >
                            {filter}

                            {isActive && (
                                <motion.span
                                    layoutId="result-filter-underline"
                                    className="
                                            absolute bottom-0 left-3 right-3
                                            h-[4px] rounded-full
                                            bg-primary
                                          "
                                    transition={{
                                        type: "spring",
                                        stiffness: 450,
                                        damping: 35,
                                    }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
    }
}