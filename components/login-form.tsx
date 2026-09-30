"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/auth-card"
import { useRouter } from "next/navigation"
import { useDemoSession } from "@/features/auth/session-provider"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState("")
  const { user, ready, login } = useDemoSession()
  const router = useRouter()

  useEffect(() => {
    if (ready && user) router.replace("/overview")
  }, [ready, user, router])

  if (!ready || user) return null

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AuthCard>
        <form
          className="p-6 md:p-8"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setError("")
            try {
              if (
                !login(
                  String(data.get("email") ?? ""),
                  String(data.get("password") ?? "")
                )
              ) {
                setError("Incorrect email or password.")
                event.currentTarget
                  .querySelector<HTMLInputElement>("#password")
                  ?.focus()
              }
            } catch {
              setError(
                "Unable to save your session. Allow browser storage and try again."
              )
            }
          }}
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-balance text-muted-foreground">
                Login to your FreshTrace account
              </p>
            </div>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="m@example.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                onChange={() => setError("")}
                required
              />
            </Field>
            <Field data-invalid={Boolean(error)}>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                onChange={() => setError("")}
                required
              />
            </Field>
            {error && <FieldError id="login-error">{error}</FieldError>}
            <FieldDescription>
              Demo sign-in. Your session is saved in this browser until you log
              out.
            </FieldDescription>
            <Field>
              <Button type="submit">Login</Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? Talk to your IT administrator.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </AuthCard>
      <FieldDescription className="px-6 text-center">
        Read our <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
