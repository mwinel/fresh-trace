"use client"

import { useRef, useState } from "react"
import Link from "next/link"

import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ResetPasswordForm() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState("")

  return (
    <AuthCard>
      <form
        className="p-6 md:p-8"
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const data = new FormData(form)

          if (data.get("password") !== data.get("confirmPassword")) {
            setError("Passwords do not match.")
            form.querySelector<HTMLInputElement>("#confirm-password")?.focus()
            return
          }

          form.reset()
          setError("")
          setComplete(true)
          headingRef.current?.focus()
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
              {complete ? "Reset preview complete" : "Reset your password"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {complete
                ? "You can now return to the login screen."
                : "Choose a new password for your FreshTrace account."}
            </p>
          </div>
          {complete ? (
            <>
              <FieldDescription role="status">
                Demo complete. Your password was not changed or stored.
              </FieldDescription>
              <Field>
                <Button nativeButton={false} render={<Link href="/login" />}>
                  Back to login
                </Button>
              </Field>
            </>
          ) : (
            <>
              <FieldDescription id="reset-note">
                Demo only. No reset token is checked and no password is saved.
              </FieldDescription>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="reset-note"
                  onChange={() => setError("")}
                  required
                />
              </Field>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "password-error" : undefined}
                  onChange={() => setError("")}
                  required
                />
                {error && <FieldError id="password-error">{error}</FieldError>}
              </Field>
              <Field>
                <Button type="submit">Reset password</Button>
                <FieldDescription className="text-center">
                  <Link href="/login">Back to login</Link>
                </FieldDescription>
              </Field>
            </>
          )}
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
