import { useId, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

type Props = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm text-neutral-300">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-neutral-500",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}