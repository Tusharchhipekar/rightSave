"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Icon from "@/features/landing/Icon";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { useSignin, useSignup } from "../hooks/useAuth";

type Mode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState({
    identifier: "",
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  const signin = useSignin();
  const signup = useSignup();
  const mutation = mode === "signin" ? signin : signup;

  const set =
    (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const switchMode = (targetMode: Mode) => {
    if (targetMode === mode) return;
    signin.reset();
    signup.reset();
    setMode(targetMode);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      signin.mutate({
        identifier: fields.identifier.trim(),
        password: fields.password,
      });
    } else {
      signup.mutate({
        username: fields.username.trim().toLowerCase(),
        fullName: fields.fullName.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
      });
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-outline-variant/30 bg-surface-container/90 p-8 shadow-2xl backdrop-blur-2xl text-on-surface">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container/20 text-primary border border-primary-container/30 shadow-md group-hover:scale-105 transition-transform">
            <Icon name="sync_saved_locally" className="text-[24px]" />
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            RightSave<span className="text-primary font-label-code-sm ml-1 px-1.5 py-0.5 rounded bg-surface-container-high text-xs">AI</span>
          </span>
        </Link>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
          {mode === "signin"
            ? "Sign in to access your AI-indexed Instagram Reels"
            : "Join RightSave to search your saved Reels with natural AI queries"}
        </p>
      </div>

      {/* Dual Mode Tab Switcher */}
      <div className="mt-6 flex rounded-xl bg-surface-container-lowest p-1 border border-outline-variant/20">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === "signin"
              ? "bg-surface-container-high text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === "signup"
              ? "bg-surface-container-high text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Google Login Section */}

      <div className="mt-5">
        <button
          type="button"
          onClick={() => {
            const authUrl =
              process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:4001/api/v1";
            window.location.href = `${authUrl}/auth/google`;
          }}
          className="w-full py-3 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-medium text-xs hover:bg-surface-container-high transition-all flex items-center justify-center gap-2.5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30" />
          </div>
          <span className="relative bg-surface-container px-3 text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/70">
            or continue with
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={onSubmit} className="space-y-4">

        {mode === "signin" ? (
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={fields.identifier}
                onChange={set("identifier")}
                placeholder="name@example.com or username"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fields.fullName}
                onChange={set("fullName")}
                placeholder="Alex Morgan"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={fields.username}
                onChange={set("username")}
                placeholder="alexmorgan"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={fields.email}
                onChange={set("email")}
                placeholder="alex@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-on-surface-variant">
              Password
            </label>
            {mode === "signup" && (
              <span className="text-[11px] text-on-surface-variant/70">
                Min. 8 characters
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={fields.password}
              onChange={set("password")}
              placeholder="••••••••"
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[18px]" />
            </button>
          </div>
        </div>

        {/* Error Callout */}
        {mutation.error && (
          <div className="rounded-xl bg-error-container/30 border border-error/30 p-3 text-xs text-error flex items-center gap-2">
            <Icon name="error" className="text-[16px] flex-shrink-0" />
            <span>{getErrorMessage(mutation.error)}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-semibold text-sm hover:bg-primary hover:text-on-primary shadow-[0_4px_20px_rgba(128,131,255,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {mutation.isPending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
            </>
          ) : (
            <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
          )}
        </button>
      </form>

      {/* Footer Switcher & Back Home Link */}
      <div className="mt-6 pt-4 border-t border-outline-variant/20 text-center space-y-2">
        <p className="text-xs text-on-surface-variant">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-semibold hover:underline ml-1"
          >
            {mode === "signin" ? "Create one now" : "Sign in"}
          </button>
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="arrow_back" className="text-[14px]" />
            <span>Back to landing page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}