"use client"

import { productOptions as finalProductOptions } from "../products"

import { FieldGroup } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RegistrationField, SampleSectionHeading } from "./sample-form-fields"
import { SampleLogFields } from "./sample-log-fields"
import {
  emptyFinalProductDemoValues,
  finalProductSectionsByType,
  selectFinalProduct,
} from "../final-product-log"
import type { FinalProductLogDetails } from "../types"

export function FinalProductLogFields({
  readOnly = false,
  sampleNumber,
  values,
  onChange,
}: {
  readOnly?: boolean
  sampleNumber: string
  values: FinalProductLogDetails
  onChange: (values: FinalProductLogDetails) => void
}) {
  const productType = values.productType ?? "uht"

  return (
    <div className="@container/registration flex min-w-0 flex-col gap-6">
      <section
        aria-labelledby="final-product-selection-heading"
        className="flex min-w-0 flex-col gap-6 border-b pb-6"
      >
        <SampleSectionHeading
          id="final-product-selection-heading"
          title="Final product selection"
          description="Select the final product you are about to analyse."
        />
        <FieldGroup className="[--registration-label-width:9rem]">
          <RegistrationField id="final-product-type" label="Final product">
            <Select
              disabled={readOnly}
              value={productType}
              items={finalProductOptions}
              onValueChange={(value) => {
                const option = finalProductOptions.find(
                  (item) => item.value === value
                )
                if (option) onChange(selectFinalProduct(values, option.value))
              }}
            >
              <SelectTrigger
                id="final-product-type"
                className="w-full max-w-md"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectGroup>
                  {finalProductOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </RegistrationField>
        </FieldGroup>
      </section>
      <SampleLogFields
        readOnly={readOnly}
        prefix="final-product"
        sections={finalProductSectionsByType[productType]}
        sampleNumber={sampleNumber}
        values={{ ...emptyFinalProductDemoValues, ...values }}
        onChange={(field, value) => onChange({ ...values, [field]: value })}
      />
    </div>
  )
}
