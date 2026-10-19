"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function Shell({ title, onClose, children }: ShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-2xl flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

type ConfirmProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  if (!open) return null;
  return (
    <Shell title={title} onClose={onCancel}>
      <p className="text-body-sm text-on-surface-variant">{message}</p>
      <div className="flex justify-end gap-space-xs">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={
            danger
              ? "px-4 py-2 rounded-xl bg-error text-on-error text-body-sm font-semibold cursor-pointer disabled:opacity-50"
              : "px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary text-body-sm font-semibold cursor-pointer disabled:opacity-50"
          }
        >
          {loading ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Shell>
  );
}

type PromptProps = {
  open: boolean;
  title: string;
  label?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

function PromptBody({
  label,
  initialValue = "",
  placeholder,
  confirmLabel = "Save",
  loading,
  onSubmit,
  onCancel,
}: Omit<PromptProps, "open" | "title">) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const trimmed = value.trim();
  const canSubmit = !!trimmed && trimmed !== initialValue.trim() && !loading;

  return (
    <>
      {label && (
        <label className="text-body-sm text-on-surface-variant">{label}</label>
      )}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSubmit) onSubmit(trimmed);
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-surface-container text-on-surface placeholder:text-outline text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex justify-end gap-space-xs">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => canSubmit && onSubmit(trimmed)}
          disabled={!canSubmit}
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary text-body-sm font-semibold cursor-pointer disabled:opacity-40"
        >
          {loading ? "Saving..." : confirmLabel}
        </button>
      </div>
    </>
  );
}

export function PromptDialog({ open, title, onCancel, ...rest }: PromptProps) {
  if (!open) return null;
  return (
    <Shell title={title} onClose={onCancel}>
      <PromptBody onCancel={onCancel} {...rest} />
    </Shell>
  );
}