"use client";

import { Button } from "@/src/components/ui/button";
import * as React from "react";
import {
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";



export type SearchSelectItems = Array<{
  value: string;
  label: string;
  icon?: React.ReactNode
}>;

type SearchableSelectProps = {
  items: SearchSelectItems;
  label: string;
  value?: string;
  disabled?: boolean;
  defaultSelected?: string,
  onValueChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

const SearchableSelect = ({
  items,
  label,
  value: controlledValue,
  disabled = false,
  defaultSelected = "",
  onValueChange,
  searchPlaceholder = "Search country...",
  emptyMessage = "No country found.",
}: SearchableSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultSelected);
  const [search, setSearch] = React.useState("");
  const listId = React.useId();
  const currentValue = controlledValue ?? value;
  const selectedItem = items.find((item) => item.value === currentValue);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover
      open={open}
      onOpenChange={(state) => {
        setOpen(state);

        if (!state) {
          setSearch("");
        }
      }}
    >
      <PopoverTrigger
      disabled={disabled}
        render={
          <Button variant="unstyled"
            type="button"
            role="combobox"
            aria-controls={listId}
            aria-expanded={open ? "true" : "false"}
            className={cn(
              `
      group/select relative
      flex h-10 w-full min-w-0
      items-center justify-between
      overflow-hidden
      rounded-lg

      border border-primary/20
      bg-background/70

      pl-10 pr-[13px]

      text-sm
      font-medium
      text-foreground

      shadow-inner
      outline-none

      transition-all duration-200

      hover:border-primary/40

      focus:border-primary/60
      focus:ring-2
      focus:ring-primary/10

      dark:bg-white/[0.025]
      dark:hover:bg-white/[0.04]

      [@media(max-height:760px)]:h-9
    `,
              open &&
              `
        border-primary/60
        bg-background/85
      `
            )}
          >
            <span
              className={cn(
                "relative flex justify-start z-10 min-w-0 flex-1 truncate text-left",
                !currentValue && "font-normal text-muted-foreground/70"
              )}
            >
              {selectedItem?.icon && <span className="mr-2 flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[2px] z-20 text-foreground">
                {selectedItem.icon}
              </span>}
              {selectedItem?.label || label}
            </span>

            <ChevronDown
              className={cn(
                "relative z-10 ml-2 size-3.5 shrink-0 text-primary/70 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="
          z-[100]
          w-[var(--anchor-width)]
          min-w-[190px]

          overflow-hidden
          rounded-xl

          border border-primary/20

          bg-background/95
          p-1.5

          shadow-[
            0_14px_36px_rgba(0,0,0,0.10),
            0_3px_10px_rgba(212,168,83,0.06),
            inset_0_1px_0_rgba(255,255,255,0.16)
          ]

          backdrop-blur-2xl

          dark:border-primary/25
          dark:bg-[#11110f]/95

          dark:shadow-[
            0_20px_50px_rgba(0,0,0,0.50),
            0_0_24px_rgba(212,168,83,0.06),
            inset_0_1px_0_rgba(255,255,255,0.04)
          ]
        "
      >
        <Command className="bg-transparent">
          {/* Search */}
          <div
            className="
              mb-1.5
              flex h-9 items-center gap-2
              rounded-lg

              border border-primary/15
              bg-background-muted/70
              px-2.5

              shadow-[
                inset_0_1px_2px_rgba(0,0,0,0.04)
              ]

              transition-all duration-200

              focus-within:border-primary/45
              focus-within:bg-background-muted/90
              focus-within:ring-2
              focus-within:ring-primary/8

              dark:bg-white/[0.03]
              dark:focus-within:bg-white/[0.05]
            "
          >
            <Search
              className="
                size-3.5 shrink-0
                text-primary/65
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={searchPlaceholder}
              className="
                h-full min-h-12 min-w-0 flex-1
                bg-transparent

                text-xs
                text-foreground

                outline-none

                placeholder:text-muted-foreground/65
              "
            />
          </div>

          {/* List */}
          <CommandList id={listId} className="max-h-[252px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <CommandEmpty
                className="
                  py-5 text-center
                  text-xs
                  text-muted-foreground
                "
              >
                {emptyMessage}
              </CommandEmpty>
            ) : (
              <CommandGroup className="p-0">
                {filteredItems.map((country) => {
                  const isSelected =
                    currentValue === country.value;

                  return (
                    <CommandItem
                      key={country.value}
                      value={country.value}
                      onSelect={() => {
                        if (controlledValue === undefined) {
                          setValue(country.value);
                        }
                        onValueChange?.(
                          country.value
                        );
                        setSearch("");
                        setOpen(false);
                      }}
                      className={cn(
                        `
                          group/item
                          my-0.5
                          flex min-h-8
                          cursor-pointer
                          items-center

                          rounded-lg
                          px-2.5 py-1.5

                          text-xs
                          text-foreground

                          transition-all
                          duration-150

                          hover:bg-primary/[0.07]
                          data-[selected=true]:bg-primary/[0.08]

                          dark:hover:bg-primary/10
                          dark:data-[selected=true]:bg-primary/10
                        `,
                        isSelected &&
                        `
                            bg-primary/12
                            font-medium

                            shadow-[
                              inset_0_0_0_1px_rgba(212,168,83,0.08)
                            ]

                            dark:bg-primary/15
                          `
                      )}
                    >
                      {country.icon && <span className="mr-2 flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[2px]">
                        {country.icon}
                      </span>}
                      <span className="min-w-0 flex-1 truncate">
                        {country.label}
                      </span>

                      <span
                        className={cn(
                          `
                            ml-2
                            flex size-5 shrink-0
                            items-center justify-center
                            rounded-full

                            border border-primary/15
                            bg-primary/[0.06]

                            transition-all duration-150
                          `,
                          isSelected
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-75"
                        )}
                      >
                        <Check className="size-3 text-primary" />
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
