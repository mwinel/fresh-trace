"use client"

import { LockKeyholeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

export function RegistrationField({
  id,
  label,
  children,
  error,
  className,
}: {
  id: string
  label: string
  children: React.ReactNode
  error?: string
  className?: string
}) {
  return (
    <Field
      data-invalid={Boolean(error)}
      className={cn(
        "grid items-start gap-2 @[28rem]/registration:grid-cols-[var(--registration-label-width)_minmax(0,1fr)] @[28rem]/registration:gap-3",
        className
      )}
    >
      <FieldLabel htmlFor={id} className="@[28rem]/registration:pt-2">
        {label}
      </FieldLabel>
      <FieldContent className="min-w-0">{children}</FieldContent>
    </Field>
  )
}

export function LockedField({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: string
}) {
  return (
    <RegistrationField id={id} label={label}>
      <InputGroup className="bg-muted/50">
        <InputGroupInput id={id} value={value} readOnly />
        <InputGroupAddon align="inline-end">
          <LockKeyholeIcon aria-hidden="true" />
          <span className="sr-only">
            Automatically assigned; cannot be edited
          </span>
        </InputGroupAddon>
      </InputGroup>
    </RegistrationField>
  )
}

export function SelectField({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  className,
}: {
  className?: string
  id: string
  label: string
  placeholder: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <RegistrationField id={id} label={label} className={className}>
      <Select
        value={value || null}
        onValueChange={(next) => onChange(next ?? "")}
        items={options.map((option) => ({ label: option, value: option }))}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent side="bottom" alignItemWithTrigger={false}>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </RegistrationField>
  )
}

export function SampleSectionHeading({
  id,
  title,
  description,
  className,
}: {
  id: string
  title: string
  description: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h3 id={id} className="text-sm font-medium">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
