"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm() {
  const router = useRouter()

  return (
    <AuthCard>
      <form
        className="p-6 md:p-8"
        onSubmit={(event) => {
          event.preventDefault()
          router.push("/reset-password")
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-muted-foreground">
              Enter your email address to reset your password.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="recovery-email">Email</FieldLabel>
            <Input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="m@example.com"
              required
            />
          </Field>
          <Field>
            <Button type="submit">Continue</Button>
            <FieldDescription className="text-center">
              <Link href="/login">Back to login</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
