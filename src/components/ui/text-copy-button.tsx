import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Check, Copy } from "lucide-react"
import { useState, type MouseEvent } from "react";
import { addToast } from "@/src/components/ui/toast";

export const TextCopyButton = ({ value, className, label = "Copy account number" }: { value: string; className?: string; label?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            addToast({ title: "Could not copy text", type: "error" });
            return;
        }

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    return <Button variant="unstyled"
        type="button"
        onClick={handleCopy}
        className={cn(
            "text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
            className
        )}
        title={label}
        aria-label={copied ? "Copied" : label}
    >
        {copied ? (
            <Check
                className="h-3.5 w-3.5 text-green-500 animate-in zoom-in duration-200"
            />
        ) : (
            <Copy
                className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110 active:scale-75"
            />
        )}
    </Button>
}
