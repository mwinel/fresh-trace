"use client"

import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  RegistrationField,
  LockedField,
  SelectField,
} from "./sample-form-fields"
import type { SampleLogSection } from "../types"

export function SampleLogFields<Key extends string>({
  prefix,
  sections,
  sampleNumber,
  values,
  onChange,
}: {
  prefix: string
  sections: SampleLogSection<Key>[]
  sampleNumber: string
  values: Record<Key, string>
  onChange: (field: Key, value: string) => void
}) {
  return (
    <div className="@container/registration flex flex-col gap-6">
      {sections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={`${prefix}-${section.id}-heading`}
          className={cn(
            "flex min-w-0 flex-col gap-6",
            index > 0 && "border-t pt-6"
          )}
        >
          <div className="flex flex-col gap-1">
            <h3
              id={`${prefix}-${section.id}-heading`}
              className="text-sm font-medium"
            >
              {section.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
          </div>
          <FieldGroup className="grid gap-3 [--registration-label-width:9rem] @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-x-6">
            {section.id === "sample" && (
              <LockedField
                id={`${prefix}-sample-number`}
                label="Sample number"
                value={sampleNumber}
              />
            )}
            {section.fields.map(
              ({ key, label, type, options, startsNewRow }) =>
                options ? (
                  <SelectField
                    key={key}
                    id={`${prefix}-${key}`}
                    label={label}
                    placeholder="Select result…"
                    options={options}
                    className={
                      startsNewRow
                        ? "@[42rem]/registration:col-start-1"
                        : undefined
                    }
                    value={values[key]}
                    onChange={(value) => onChange(key, value)}
                  />
                ) : (
                  <RegistrationField
                    key={key}
                    id={`${prefix}-${key}`}
                    label={label}
                    className={cn(
                      type === "textarea" && "@[42rem]/registration:col-span-2",
                      startsNewRow && "@[42rem]/registration:col-start-1"
                    )}
                  >
                    {type === "textarea" ? (
                      <Textarea
                        id={`${prefix}-${key}`}
                        value={values[key]}
                        onChange={(event) => onChange(key, event.target.value)}
                      />
                    ) : (
                      <Input
                        id={`${prefix}-${key}`}
                        type={type}
                        step={type === "number" ? "any" : undefined}
                        value={values[key]}
                        onChange={(event) => onChange(key, event.target.value)}
                      />
                    )}
                  </RegistrationField>
                )
            )}
          </FieldGroup>
        </section>
      ))}
    </div>
  )
}
