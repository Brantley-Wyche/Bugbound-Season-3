"use client";
// beUI stateful button (beui.dev/components/motion/button), adapted for Bugbound:
// labels swap without a letter cascade or blur, and a failed run shows no icon,
// so the season's one authored moment stays the Repaired record.

import { Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "./base";

export type ButtonState = "idle" | "loading" | "success" | "error";

export interface StatefulButtonProps extends Omit<ButtonProps, "children"> {
  state?: ButtonState;
  children: ReactNode;
  loadingText?: ReactNode;
  successText?: ReactNode;
  errorText?: ReactNode;
  icon?: ReactNode;
}

function IconSlot({ keyId, children }: { keyId: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      key={keyId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.12 }}
      className="inline-grid shrink-0 place-items-center"
    >
      {children}
    </motion.span>
  );
}

export const StatefulButton = forwardRef<HTMLButtonElement, StatefulButtonProps>(function StatefulButton(
  {
    state = "idle",
    children,
    loadingText = "Loading",
    successText = "Done",
    errorText = "Try again",
    icon,
    disabled,
    onClick,
    ...rest
  },
  ref,
) {
  const isBusy = state === "loading";
  const stateText =
    state === "loading"
      ? loadingText
      : state === "success"
        ? successText
        : state === "error"
          ? errorText
          : children;

  return (
    // A busy button stays focusable: disabling it would drop keyboard focus
    // to the document mid-run. Its caller announces progress separately.
    <Button
      ref={ref}
      disabled={disabled}
      aria-disabled={isBusy || undefined}
      aria-busy={isBusy}
      whileHover={undefined}
      onClick={isBusy ? undefined : onClick}
      {...rest}
    >
      <span className="relative inline-flex items-center justify-center gap-2">
        <AnimatePresence initial={false}>
          {state === "loading" ? (
            <IconSlot keyId="loading-icon">
              <Loader2 className="h-4 w-4 animate-spin" />
            </IconSlot>
          ) : null}
          {state === "success" ? (
            <IconSlot keyId="success-icon">
              <Check className="h-4 w-4" />
            </IconSlot>
          ) : null}
          {state === "idle" && icon ? (
            <IconSlot keyId="idle-icon">{icon}</IconSlot>
          ) : null}
        </AnimatePresence>
        <span className="whitespace-nowrap">{stateText}</span>
      </span>
    </Button>
  );
});
