import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type Props = ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-white text-black hover:bg-neutral-200",
        variant === "ghost" && "text-neutral-300 hover:bg-neutral-800",
        className,
      )}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}