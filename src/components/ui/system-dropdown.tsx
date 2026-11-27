"use client";

import { Button } from "@/src/components/ui/button";
import * as React from "react";
import { Check, Search } from "lucide-react";

import { cn } from "@/src/lib/utils";

export type SystemDropdownItem = {
  value: string;
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  searchValue?: string;
};

type SystemDropdownPanelProps = {
  items: SystemDropdownItem[];
  selectedValue?: string;
  onSelect: (item: SystemDropdownItem) => void;
  className?: string;
  listClassName?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  showSearch?: boolean;
  listId?: string;
};

export function SystemDropdownPanel({
  items,
  selectedValue,
  onSelect,
  className,
  listClassName,
  searchPlaceholder = "Search...",
  emptyLabel = "No results found.",
  showSearch = true,
  listId,
}: SystemDropdownPanelProps) {
  const [search, setSearch] = React.useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = React.useMemo(() => {
    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) =>
      `${item.label} ${item.searchValue ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [items, normalizedSearch]);

  return (
    <div
      className={cn(
        `
          overflow-hidden rounded-xl border border-border
          bg-card p-1.5
          shadow-[0_18px_44px_rgba(16,24,40,0.16)]
          ring-1 ring-primary/10
        `,
        className
      )}
    >
      {showSearch && (
        <div
          className="
            mb-1.5 flex h-9 items-center gap-2 rounded-lg
            border border-primary/18 bg-background-muted/75 px-2.5
            shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)]
            transition-all duration-200
            focus-within:border-primary/45
            focus-within:bg-background-muted/95
            focus-within:ring-2 focus-within:ring-primary/10
          "
        >
          <Search className="size-3.5 shrink-0 text-primary/70" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="
              h-full min-w-0 flex-1 bg-transparent
              text-xs text-foreground outline-none
              placeholder:text-muted-foreground/65
            "
          />
        </div>
      )}

      <div
        id={listId}
        role="listbox"
        className={cn("max-h-[190px] overflow-y-auto py-1", listClassName)}
      >
        {filteredItems.length === 0 ? (
          <div className="py-5 text-center text-xs text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = item.value === selectedValue;

            return (
              <Button variant="unstyled"
                key={item.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(item)}
                className={cn(
                  `
                    flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                    text-left text-sm text-foreground
                    transition-colors duration-100
                    hover:bg-primary/10
                  `,
                  isSelected && "bg-primary/10"
                )}
              >
                {item.leading && (
                  <span className="flex shrink-0 items-center">
                    {item.leading}
                  </span>
                )}

                <span className="min-w-0 flex-1 truncate">
                  {item.label}
                </span>

                {item.trailing ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.trailing}
                  </span>
                ) : (
                  <span
                    className={cn(
                      `
                        flex size-5 shrink-0 items-center justify-center
                        rounded-full border border-primary/15 bg-primary/[0.06]
                        transition-all duration-150
                      `,
                      isSelected
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-0"
                    )}
                  >
                    <Check className="size-3 text-primary" />
                  </span>
                )}
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
}
