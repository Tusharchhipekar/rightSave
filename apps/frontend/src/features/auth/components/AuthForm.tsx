"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { useSignin, useSignup } from "../hooks/useAuth";

type Mode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
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

  const switchMode = () => {
    signin.reset();
    signup.reset();
    setMode((m) => (m === "signin" ? "signup" : "signin"));
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
        username: fields.username.trim(),
        fullName: fields.fullName.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-neutral-400">
          Save reels. Find them later by asking.
        </p>
      </div>

      {mode === "signin" ? (
        <Input
          label="Email or username"
          value={fields.identifier}
          onChange={set("identifier")}
          autoComplete="username"
          required
        />
      ) : (
        <>
          <Input
            label="Full name"
            value={fields.fullName}
            onChange={set("fullName")}
            autoComplete="name"
            required
          />
          <Input
            label="Username"
            value={fields.username}
            onChange={set("username")}
            autoComplete="username"
            required
          />
          <Input
            label="Email"
            type="email"
            value={fields.email}
            onChange={set("email")}
            autoComplete="email"
            required
          />
        </>
      )}

      <Input
        label="Password"
        type="password"
        value={fields.password}
        onChange={set("password")}
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        required
      />

      {mutation.error && (
        <p className="text-sm text-red-400">
          {getErrorMessage(mutation.error)}
        </p>
      )}

      <Button type="submit" loading={mutation.isPending} className="w-full">
        {mode === "signin" ? "Sign in" : "Sign up"}
      </Button>

      <p className="text-center text-sm text-neutral-400">
        {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="text-white underline underline-offset-4"
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </form>
  );
}