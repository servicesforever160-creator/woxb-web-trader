import { Clock3 } from "lucide-react";

import { cn } from "@/src/lib/utils";

type ComingSoonProps = {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  description?: string;
  status?: string;
  className?: string;
};

export function ComingSoon({
  eyebrow = "PAMM Accounts",
  title = "Coming Soon",
  highlight,
  description = "PAMM accounts are currently under preparation and will be available soon.",
  status = "Feature in progress",
  className,
}: ComingSoonProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-8 text-center",
        className,
      )}
    >
      <div className="w-full max-w-[520px] rounded-xl border border-primary/20 bg-card px-5 py-7 shadow-[0_5px_20px_rgba(0,0,0,0.04)] dark:bg-card dark:shadow-none">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
          <Clock3 className="size-5" />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </div>

        <h1 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
          {highlight ? <span className="text-primary"> {highlight}</span> : null}
        </h1>

        <p className="mx-auto mt-2 max-w-[390px] text-xs leading-5 text-muted-foreground">
          {description}
        </p>

        <div className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="truncate">{status}</span>
        </div>
      </div>
    </section>
  );
}
