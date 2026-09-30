"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/auth-card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AuthCard>
        <form
          className="p-6 md:p-8"
          onSubmit={(event) => {
            event.preventDefault()
            event.currentTarget.reset()
            setSubmitted(true)
          }}
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-balance text-muted-foreground">
                Login to your FreshTrace account
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
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
                required
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="remember-me"
                name="rememberMe"
                aria-describedby="login"
              />
              <FieldLabel htmlFor="remember-me" className="font-normal">
                Remember me.
              </FieldLabel>
            </Field>
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
