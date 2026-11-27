"use client";

import { Button } from "@/src/components/ui/button";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

type InfoTooltipProps = {
  content: React.ReactNode;
  className?: string;
  iconClassName?: string;
};

export function InfoTooltip({
  content,
  className,
  iconClassName,
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="unstyled"
            type="button"
            aria-label="More information"
            className={cn(
              "inline-flex shrink-0 cursor-help items-center justify-center",
              "rounded-full text-muted-foreground/70",
              "transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              className
            )}
          />
        }
      >
        <Info className={cn("size-3.5", iconClassName)} />
      </TooltipTrigger>

      <TooltipContent
        side="top"
        sideOffset={6}
        className="max-w-[260px] text-xs leading-5"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}