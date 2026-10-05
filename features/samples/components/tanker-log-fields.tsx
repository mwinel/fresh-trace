"use client"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  RegistrationField,
  LockedField,
  SelectField,
} from "./sample-form-fields"
import {
  createTankerChamber,
  tankerDeliveryFields,
  tankerAnalysisFields,
} from "../tanker-log"
import type { TankerChamberLog, TankerLogDetails } from "../types"

const fieldGrid =
  "grid gap-3 [--registration-label-width:9rem] @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-x-6"

export function TankerLogFields({
  readOnly = false,
  sampleNumber,
  values,
  chambers,
  onChange,
  onChambersChange,
}: {
  readOnly?: boolean
  sampleNumber: string
  values: TankerLogDetails
  chambers: TankerChamberLog[]
  onChange: (field: keyof TankerLogDetails, value: string) => void
  onChambersChange: (chambers: TankerChamberLog[]) => void
}) {
  function updateChamber(
    id: string,
    field: keyof Omit<TankerChamberLog, "id">,
    value: string
  ) {
    if (readOnly) return
    onChambersChange(
      chambers.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  return (
    <div className="@container/registration flex flex-col gap-6">
      <section
        aria-labelledby="tanker-delivery-heading"
        className="flex min-w-0 flex-col gap-6"
      >
        <div className="flex flex-col gap-1">
          <h3 id="tanker-delivery-heading" className="text-sm font-medium">
            Delivery details
          </h3>
          <p className="text-sm text-muted-foreground">
            Record the tanker delivery and sampling details.
          </p>
        </div>
        <FieldGroup className={fieldGrid}>
          <LockedField
            id="tanker-sample-number"
            label="Sample number"
            value={sampleNumber}
          />
          {tankerDeliveryFields.map(({ key, label, type }) => (
            <RegistrationField key={key} id={`tanker-${key}`} label={label}>
              <Input
                readOnly={readOnly}
                id={`tanker-${key}`}
                type={type}
                value={values[key]}
                onChange={(event) => onChange(key, event.target.value)}
              />
            </RegistrationField>
          ))}
        </FieldGroup>
      </section>
      {chambers.map((row, index) => (
        <section
          key={row.id}
          aria-labelledby={`tanker-${row.id}-heading`}
          className="flex min-w-0 flex-col gap-6 border-t pt-6"
        >
          <div className="flex flex-col gap-1">
            <h3 id={`tanker-${row.id}-heading`} className="text-sm font-medium">
              Chamber {row.chamber || index + 1} analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Record the quantity and analysis results for this chamber.
            </p>
          </div>
          <FieldGroup className={fieldGrid}>
            <RegistrationField id={`tanker-${row.id}-chamber`} label="Chamber">
              <Input
                readOnly={readOnly}
                id={`tanker-${row.id}-chamber`}
                placeholder="e.g. F, M, B"
                value={row.chamber}
                onChange={(event) =>
                  updateChamber(row.id, "chamber", event.target.value)
                }
              />
            </RegistrationField>
            {tankerAnalysisFields.map(({ key, label, type, options }) =>
              options ? (
                <SelectField
                  readOnly={readOnly}
                  key={key}
                  id={`tanker-${row.id}-${key}`}
                  label={label}
                  placeholder="Select result…"
                  options={options}
                  value={row[key]}
                  onChange={(value) => updateChamber(row.id, key, value)}
                />
              ) : (
                <RegistrationField
                  key={key}
                  id={`tanker-${row.id}-${key}`}
                  label={label}
                >
                  <Input
                    readOnly={readOnly}
                    id={`tanker-${row.id}-${key}`}
                    type={type}
                    step={type === "number" ? "any" : undefined}
                    value={row[key]}
                    onChange={(event) =>
                      updateChamber(row.id, key, event.target.value)
                    }
                  />
                </RegistrationField>
              )
            )}
          </FieldGroup>
          {!readOnly && chambers.length > 1 && (
            <Button
              type="button"
              variant="link"
              className="self-start px-0"
              aria-label={`Remove chamber ${row.chamber || index + 1}`}
              onClick={() => {
                const hasResults = tankerAnalysisFields.some(
                  ({ key }) => row[key] !== ""
                )
                if (
                  hasResults &&
                  !window.confirm(
                    "Remove this chamber and its readings from this demo session?"
                  )
                )
                  return
                onChambersChange(
                  chambers.filter((chamber) => chamber.id !== row.id)
                )
              }}
            >
              Remove chamber
            </Button>
          )}
        </section>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="link"
          className="self-start px-0"
          onClick={() => onChambersChange([...chambers, createTankerChamber()])}
        >
          Add chamber
        </Button>
      )}
    </div>
  )
}
