"use client";

import { Button } from "@/src/components/ui/button";
import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/src/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";
import { Input } from "@/src/components/ui/input";

type DateSelectProps = {
    value?: Date;
    onChange?: (date: Date) => void;
    className?: string;
    hideLabels?: boolean;
    disabled?: boolean;

    minYear?: number;
    maxYear?: number;

    placeholder?: {
        day?: string;
        month?: string;
        year?: string;
    };
};

type DatePart = "day" | "month" | "year";

const MONTHS = [
    { value: 0, label: "January", short: "Jan" },
    { value: 1, label: "February", short: "Feb" },
    { value: 2, label: "March", short: "Mar" },
    { value: 3, label: "April", short: "Apr" },
    { value: 4, label: "May", short: "May" },
    { value: 5, label: "June", short: "Jun" },
    { value: 6, label: "July", short: "Jul" },
    { value: 7, label: "August", short: "Aug" },
    { value: 8, label: "September", short: "Sep" },
    { value: 9, label: "October", short: "Oct" },
    { value: 10, label: "November", short: "Nov" },
    { value: 11, label: "December", short: "Dec" },
];

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getPartRange(
    part: DatePart,
    minYear: number,
    maxYear: number,
) {
    switch (part) {
        case "day":
            return {
                min: 1,
                max: 31,
            };

        case "month":
            return {
                min: 1,
                max: 12,
            };

        case "year":
            return {
                min: minYear,
                max: maxYear,
            };
    }
}

type DatePartPopoverProps = {
    part: DatePart;
    value?: number;
    onSelect: (value: number) => void;
    disabled?: boolean;
    minYear?: number;
    maxYear?: number;
};

function DatePartPopover({
    part,
    value,
    onSelect,
    disabled,
    minYear = 1900,
    maxYear = new Date().getFullYear(),
}: DatePartPopoverProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        if (!open) {
            setSearch("");
        }
    }, [open]);

    const items = React.useMemo(() => {
        if (part === "month") {
            return MONTHS.map((month) => ({
                value: month.value + 1,
                label: month.label,
                search: `${month.label} ${month.short} ${month.value + 1}`,
            }));
        }

        if (part === "day") {
            return Array.from({ length: 31 }, (_, index) => {
                const day = index + 1;

                return {
                    value: day,
                    label: pad(day),
                    search: String(day),
                };
            });
        }

        return Array.from(
            {
                length: Math.max(
                    0,
                    maxYear - minYear + 1,
                ),
            },
            (_, index) => {
                const year = maxYear - index;

                return {
                    value: year,
                    label: String(year),
                    search: String(year),
                };
            },
        );
    }, [part, minYear, maxYear]);

    const filteredItems = items.filter((item) =>
        item.search
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger
                disabled={disabled}
                render={
                    <Button variant="unstyled"
                        type="button"
                        disabled={disabled}
                        aria-label={`Open ${part} selector`}
                        className="absolute right-0 top-0 flex h-full w-6 items-center justify-center rounded-r-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        <ChevronDown className="size-4" />
                    </Button>
                }
            />

            <PopoverContent
                align="center"
                sideOffset={6}
                className="w-[var(--anchor-width)] min-w-32 p-2"
            >
                <div className="relative mb-2">

                    <Input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder={`Search ${part}`}
                        className="h-8"
                        autoFocus
                    />
                </div>

                <div className="max-h-48 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        <div className="space-y-0.5">
                            {filteredItems.map((item) => {
                                const selected =
                                    value === item.value;

                                return (
                                    <Button variant="unstyled"
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            onSelect(item.value);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus-visible:bg-accent focus-visible:text-accent-foreground",
                                            selected &&
                                            "bg-primary/10 text-primary",
                                        )}
                                    >
                                        <span>
                                            {item.label}
                                        </span>

                                        {selected && (
                                            <Check className="size-4 shrink-0" />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No {part} found.
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

type DatePartInputProps = {
    part: DatePart;
    value?: number;
    displayValue: string;
    placeholder: string;
    disabled?: boolean;
    minYear: number;
    maxYear: number;

    onSelect: (value: number) => void;
};

function DatePartInput({
    part,
    value,
    displayValue,
    placeholder,
    disabled,
    minYear,
    maxYear,
    onSelect,
}: DatePartInputProps) {
    const [inputValue, setInputValue] = React.useState(
        displayValue,
    );

    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        setInputValue(displayValue);
    }, [displayValue]);

    const range = getPartRange(
        part,
        minYear,
        maxYear,
    );

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        let nextValue = event.target.value.replace(
            /\D/g,
            "",
        );

        // Limit input length.
        if (part === "day" || part === "month") {
            nextValue = nextValue.slice(0, 2);
        } else {
            nextValue = nextValue.slice(0, 4);
        }

        setInputValue(nextValue);
        setError(false);

        // Don't update the actual date until the value
        // is complete enough to be validated.
        if (!nextValue) {
            return;
        }

        const numericValue = Number(nextValue);

        if (part === "year") {
            if (nextValue.length !== 4) {
                return;
            }
        }

        if (
            numericValue < range.min ||
            numericValue > range.max
        ) {
            setError(true);
            return;
        }

        onSelect(numericValue);
    };

    const handleBlur = () => {
        if (!inputValue) {
            setError(false);
            return;
        }

        const numericValue = Number(inputValue);

        if (
            !Number.isInteger(numericValue) ||
            numericValue < range.min ||
            numericValue > range.max
        ) {
            setError(true);

            // Restore previous valid value.
            setInputValue(displayValue);
            return;
        }

        if (part === "year" && inputValue.length !== 4) {
            setError(true);
            setInputValue(displayValue);
            return;
        }

        onSelect(numericValue);
        setError(false);
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === "Enter") {
            event.currentTarget.blur();
        }

        if (event.key === "Escape") {
            setInputValue(displayValue);
            setError(false);
            event.currentTarget.blur();
        }
    };

    return (
        <div className="relative w-full">
            <Input
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder={placeholder}
                inputMode="numeric"
                maxLength={
                    part === "year" ? 4 : 2
                }
                aria-invalid={error}
                className={cn(
                    "h-9 pr-4",
                    error &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                )}
            />

            <DatePartPopover
                part={part}
                value={value}
                onSelect={(nextValue) => {
                    onSelect(nextValue);
                    setError(false);
                }}
                disabled={disabled}
                minYear={minYear}
                maxYear={maxYear}
            />
        </div>
    );
}

export function DateSelect({
    value,
    onChange,
    className,
    hideLabels = false,
    disabled = false,
    minYear = 1900,
    maxYear = new Date().getFullYear(),
    placeholder = {
        day: "DD",
        month: "MM",
        year: "YYYY",
    },
}: DateSelectProps) {
    const selectedDate =
        value instanceof Date &&
        !Number.isNaN(value.getTime())
            ? value
            : undefined;

    const [parts, setParts] = React.useState<{
        day?: number;
        month?: number;
        year?: number;
    }>({
        day: selectedDate?.getDate(),
        month: selectedDate?.getMonth(),
        year: selectedDate?.getFullYear(),
    });

    React.useEffect(() => {
        if (
            value instanceof Date &&
            !Number.isNaN(value.getTime())
        ) {
            setParts({
                day: value.getDate(),
                month: value.getMonth(),
                year: value.getFullYear(),
            });
        } else {
            setParts({});
        }
    }, [value]);

    const updateDate = React.useCallback(
        (part: DatePart, rawValue: number) => {
            setParts((current) => {
                let nextParts = {
                    ...current,
                    [part]:
                        part === "month"
                            ? rawValue - 1
                            : rawValue,
                };

                const year = nextParts.year;
                const month = nextParts.month;
                const day = nextParts.day;

                /*
                 * If year/month/day are all available,
                 * validate the actual calendar date.
                 */
                if (
                    year !== undefined &&
                    month !== undefined &&
                    day !== undefined
                ) {
                    const maxDay = getDaysInMonth(
                        year,
                        month,
                    );

                    const validDay = Math.min(
                        day,
                        maxDay,
                    );

                    if (validDay !== day) {
                        nextParts = {
                            ...nextParts,
                            day: validDay,
                        };
                    }

                    const date = new Date(
                        year,
                        month,
                        validDay,
                    );

                    /*
                     * Make sure JavaScript didn't roll the
                     * date into another month/year.
                     */
                    if (
                        date.getFullYear() === year &&
                        date.getMonth() === month &&
                        date.getDate() === validDay
                    ) {
                        onChange?.(date);
                    }
                }

                return nextParts;
            });
        },
        [onChange],
    );

    const renderPart = (
        part: DatePart,
        label: string,
        displayValue: string,
        selectedValue?: number,
    ) => {
        return (
            <div className="min-w-0 flex-1">
                {!hideLabels && (
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        {label}
                    </label>
                )}

                <DatePartInput
                    part={part}
                    value={selectedValue}
                    displayValue={displayValue}
                    placeholder={
                        placeholder[part] ?? ""
                    }
                    onSelect={(nextValue) =>
                        updateDate(
                            part,
                            nextValue,
                        )
                    }
                    disabled={disabled}
                    minYear={minYear}
                    maxYear={maxYear}
                />
            </div>
        );
    };

    const validYear =
        parts.year !== undefined &&
        parts.year >= minYear &&
        parts.year <= maxYear
            ? parts.year
            : undefined;

    return (
        <div
            className={cn(
                "flex w-full items-end gap-2",
                className,
            )}
        >
            {renderPart(
                "day",
                "Day",
                parts.day !== undefined
                    ? pad(parts.day)
                    : "",
                parts.day,
            )}

            {renderPart(
                "month",
                "Month",
                parts.month !== undefined
                    ? pad(parts.month + 1)
                    : "",
                parts.month !== undefined
                    ? parts.month + 1
                    : undefined,
            )}

            {renderPart(
                "year",
                "Year",
                validYear !== undefined
                    ? String(validYear)
                    : "",
                validYear,
            )}
        </div>
    );
}