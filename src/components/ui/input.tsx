"use client";

import { Button } from "@/src/components/ui/button";
import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { Check, ChevronDown, Eye, EyeOff, FlagIcon, Search } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";

import { cn } from "@/src/lib/utils";
import { countries } from "@/src/lib/countryData";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./command";

type Country = (typeof countries)[number];

function Input({
  className,
  type,
  countryCode = "PK",
  isAuthInp = false,
  onCountryCodeChange,
  disabled,
  ...props
}: React.ComponentProps<"input"> & { countryCode?: string, onCountryCodeChange?: (countryCode: string) => void; isAuthInp?: boolean }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [countryOpen, setCountryOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const isPassword = type === "password";
  const isPhone = type === "phone";
  const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const inputType = isPassword && showPassword ? "text" : isPhone ? "tel" : type;

  const selectedCountry = React.useMemo(
    () => countries.find(
      (country) =>
        country.isoCode2.toUpperCase() === countryCode.toUpperCase()
    ), [countryCode]
  );


  const Flag = selectedCountry && Flags[selectedCountry.isoCode2.toUpperCase() as keyof typeof Flags];

  const selectCountry = (country: Country) => {
    onCountryCodeChange?.(country.isoCode2);
    setCountryOpen(false);
  };

  const filteredCountries = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return countries;

    return countries.filter((country) => {
      return (
        country.name.toLowerCase().includes(query) ||
        country.phoneCode.toLowerCase().includes(query) ||
        country.isoCode2.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div
      className={cn(
        `
          relative ${isPhone && `flex items-center justify-between`} h-10 w-full
          overflow-hidden rounded-lg border border-border bg-background
          transition-colors
          focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20
        `,
        `${isAuthInp ? isPhone ? "pl-0" : "pl-10" : "px-0!"} text-sm`,
        isInvalid && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {isPhone && onCountryCodeChange && (
        <Popover
          open={countryOpen}
          onOpenChange={setCountryOpen}
        >
          <PopoverTrigger
            render={
              <Button variant="unstyled" type="button" disabled={disabled}
                onClick={() => setCountryOpen((previous) => !previous)}
                className={cn("flex h-full items-center gap-1.5 px-3 py-2", "text-sm font-medium text-foreground", "transition-colors duration-150", "hover:bg-primary/5", "focus-visible:outline-none")}
                aria-label="Select country"
                aria-expanded={countryOpen} >
                {
                  selectedCountry && Flag
                    ?
                    <>
                      <Flag title={selectedCountry.name} className="h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover" />
                      <span className="text-muted-foreground">
                        {selectedCountry.phoneCode}
                      </span>
                    </>
                    :
                    <>
                      <FlagIcon className="h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover" />
                      <span>+??</span>
                    </>
                }
                <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform duration-200", countryOpen && "rotate-180")} strokeWidth={1.8} />
              </Button>
            }
          />

          <PopoverContent
            align="start"
            sideOffset={6}
            className="
            mt-2
        z-[100]
        w-[250px]
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
                  placeholder="Search country..."
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

              <CommandList className="max-h-[190px] overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <CommandEmpty
                    className="
                  py-5 text-center
                  text-xs
                  text-muted-foreground
                "
                  >
                    No country found.
                  </CommandEmpty>
                ) : (
                  <CommandGroup className="p-0">
                    {filteredCountries.map((country) => {
                      const CountryFlag =
                        Flags[
                        country.isoCode2.toUpperCase() as keyof typeof Flags
                        ];

                      const isSelected = selectedCountry ?
                        country.isoCode2.toUpperCase() ===
                        selectedCountry.isoCode2.toUpperCase()
                        : false;

                      return (
                        <CommandItem
                          key={country.id}
                          value={country.phoneCode}
                          onSelect={() => {
                            selectCountry(country);
                            setSearch("");
                            setCountryOpen(false);
                          }}
                          className={cn(
                            `
      group/item
      my-0.5
      flex
      min-h-8
      w-full
      cursor-pointer
      items-center
      gap-3
      rounded-lg
      px-3
      py-2
      text-left
      text-sm
      text-foreground
      transition-all
      duration-150
      hover:bg-primary/10
      data-[selected=true]:bg-primary/[0.08]
      dark:hover:bg-primary/10
      dark:data-[selected=true]:bg-primary/10
    `,
                            isSelected && `
      bg-primary/5
      font-medium
    `
                          )}
                        >
                          {/* Left: Flag + Country name */}
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            {CountryFlag && (
                              <CountryFlag
                                className="
          h-3.5
          w-[21px]
          shrink-0
          rounded-[2px]
        "
                              />
                            )}

                            <span className="min-w-0 truncate">
                              {country.name}
                            </span>
                          </div>

                          {/* Right: Phone code + Check */}
                          <div className="ml-auto flex shrink-0 items-center gap-2">
                            <span className="text-muted-foreground">
                              {country.phoneCode}
                            </span>

                            <span
                              className={cn(
                                `
          flex
          size-5
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-primary/15
          bg-primary/[0.06]
          transition-all
          duration-150
        `,
                                isSelected
                                  ? "scale-100 opacity-100"
                                  : "scale-75 opacity-0"
                              )}
                            >
                              <Check className="size-3 text-primary" />
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>

          </PopoverContent>
        </Popover>
      )}

      <div
        className="
          relative flex h-full min-w-0 flex-1 items-center
          bg-transparent
        "
      >
        <InputPrimitive
          {...props}
          disabled={disabled}
          type={inputType}
          data-slot="input"
          className={cn(
            `
              h-10 w-full border-0 bg-transparent
              px-[13px] py-[10px] ${isPhone && `pl-2!`} text-sm font-medium
              text-foreground outline-none
              placeholder:font-normal
              placeholder:text-muted-foreground/70
              selection:bg-primary/20 selection:text-foreground
              disabled:cursor-not-allowed disabled:opacity-70

              [&:-webkit-autofill]:bg-transparent
              [&:-webkit-autofill]:text-foreground
              [&:-webkit-autofill]:shadow-[0_0_0_1000px_var(--autofill-background)_inset]
              [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]
              bg-background
            `,
            isPassword && "pr-12",
            className
          )}
        />

        {isPassword && (
          <Button variant="unstyled"
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="
              absolute right-3 top-1/2 z-20
              flex size-7 -translate-y-1/2 items-center justify-center
              rounded-md text-muted-foreground
              transition-all duration-200
              hover:bg-primary/10 hover:text-primary
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-primary/30
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {showPassword ? (
              <EyeOff className="size-4" strokeWidth={1.8} />
            ) : (
              <Eye className="size-4" strokeWidth={1.8} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export { Input };
