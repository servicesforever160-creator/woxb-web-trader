"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

interface OtpInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  onSubmit?: (otp: string) => void;
  onError?: boolean;
  onSuccess?: boolean;
  onReset?: () => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const OtpInput = ({
  value,
  onChange,
  onSubmit,
  onError = false,
  onSuccess = false,
  onReset,
  length = 6,
  autoFocus = true,
  disabled = false,
}: OtpInputProps) => {
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const controls = useAnimation();
  const prevCompleteRef = useRef(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const isComplete = value.length === length && value.every((digit) => digit !== "");

  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      onSubmit?.(value.join(""));
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete, value, onSubmit]);

  useEffect(() => {
    if (!onError) return;

    controls.start({
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });

    onChangeRef.current(Array(length).fill(""));
    otpInputRefs.current[0]?.focus();
  }, [onError, controls, length]);

  useEffect(() => {
    if (onSuccess) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.35, ease: "easeOut" },
      });
    }
  }, [onSuccess, controls]);

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, "").slice(-1);
    const nextOtp = [...value];
    nextOtp[index] = digit;
    onChange(nextOtp);

    if (digit && (onError || onSuccess)) {
      onReset?.();
    }

    if (digit && index < length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pastedCode) return;

    const nextOtp = Array(length).fill("");
    pastedCode.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    onChange(nextOtp);

    if (onError || onSuccess) {
      onReset?.();
    }

    otpInputRefs.current[Math.min(pastedCode.length, length) - 1]?.focus();
  };

  const stateClasses = onSuccess
    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
    : onError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-200/30"
      : "border-foreground/20 focus:border-primary focus:ring-primary/20";

  return (
    <motion.div
      animate={controls}
      className="mt-4 flex justify-center gap-2 sm:gap-3"
    >
      {Array.from({ length }).map((_, index) => (
        <motion.input
          key={index}
          ref={(element) => {
            otpInputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus && index === 0}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[index] ?? ""}
          disabled={disabled || onSuccess}
          aria-label={`Verification code digit ${index + 1}`}
          aria-invalid={onError || undefined}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={`
            size-10 rounded-lg
            border
            text-center text-base
            font-bold text-foreground
            outline-none
            transition-colors
            focus:ring-2
            sm:size-12
            sm:text-lg
            bg-muted-foreground/5
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${stateClasses}
          `}
        />
      ))}
    </motion.div>
  );
};