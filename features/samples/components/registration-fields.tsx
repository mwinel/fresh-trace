"use client"

import { SourceField } from "./source-field"

import { sampleOptions } from "../data/registration-data"
import type {
  SampleIdentity,
  SampleRegistration,
  SampleSource,
  FinalProductType,
} from "../types"

import { productOptions, isProductType } from "../products"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup } from "@/components/ui/field"
import {
  SampleSectionHeading,
  RegistrationField,
  LockedField,
  SelectField,
} from "./sample-form-fields"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"

export function RegistrationFields({
  readOnly = false,
  identity,
  receivedBy,
  values,
  onChange,
  sourceError,
  productError,
  onProductChange,
  sources,
  onAddSource,
}: {
  readOnly?: boolean
  identity: SampleIdentity
  receivedBy: string
  values: SampleRegistration
  onChange: (field: keyof SampleRegistration, value: string) => void
  productError: string
  onProductChange: (value: FinalProductType) => void
  sourceError: string
  sources: SampleSource[]
  onAddSource: (source: SampleSource) => void
}) {
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kampala",
  }).format(new Date(identity.createdAt))
  return (
    <div className="@container/registration flex flex-col gap-6">
      <section
        aria-labelledby="registration-details-heading"
        className="grid gap-6 @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-6"
      >
        <SampleSectionHeading
          id="registration-details-heading"
          title="Sample details"
          description="Record the sample source, collection details, and condition on receipt."
          className="col-span-full"
        />
        <FieldGroup className="gap-3 [--registration-label-width:7rem]">
          <LockedField
            id="sample-number"
            label="Sample Number"
            value={identity.id}
          />
          <LockedField id="sample-date" label="Sample date" value={date} />
          <RegistrationField id="sample-receipt-time" label="Receipt time">
            <Input
              readOnly={readOnly}
              id="sample-receipt-time"
              type="time"
              value={values.receiptTime}
              onChange={(event) => onChange("receiptTime", event.target.value)}
            />
          </RegistrationField>
          <RegistrationField id="sample-temperature" label="Temperature °C">
            <InputGroup>
              <InputGroupInput
                readOnly={readOnly}
                id="sample-temperature"
                type="number"
                step="any"
                placeholder="Enter temperature"
                value={values.temperature}
                onChange={(event) =>
                  onChange("temperature", event.target.value)
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>°C</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </RegistrationField>
        </FieldGroup>
        <FieldGroup className="gap-3 [--registration-label-width:8rem]">
          <RegistrationField
            id="sample-source"
            label="Source"
            error={sourceError}
          >
            <SourceField
              readOnly={readOnly}
              sources={sources}
              value={values.sourceId}
              onChange={(value) => onChange("sourceId", value)}
              onAdd={onAddSource}
              error={sourceError}
            />
          </RegistrationField>
          <RegistrationField
            id="sample-product"
            label="Product"
            error={productError}
          >
            <Select
              disabled={readOnly}
              value={values.productType || null}
              items={productOptions}
              onValueChange={(value) => {
                if (isProductType(value)) onProductChange(value)
              }}
            >
              <SelectTrigger
                id="sample-product"
                className="w-full"
                aria-invalid={Boolean(productError)}
                aria-describedby={
                  productError ? "sample-product-error" : undefined
                }
              >
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectGroup>
                  {productOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {productError && (
              <p id="sample-product-error" className="text-sm text-destructive">
                {productError}
              </p>
            )}
          </RegistrationField>
          <SelectField
            readOnly={readOnly}
            id="sample-volume"
            label="Size / volume"
            placeholder="Select volume"
            options={sampleOptions.volumes}
            value={values.volume}
            onChange={(value) => onChange("volume", value)}
          />
          <SelectField
            readOnly={readOnly}
            id="sample-equipment"
            label="Equipment"
            placeholder="Select equipment"
            options={sampleOptions.equipment}
            value={values.equipment}
            onChange={(value) => onChange("equipment", value)}
          />
        </FieldGroup>
      </section>
      <section
        aria-labelledby="registration-description-heading"
        className="flex flex-col gap-6 border-t pt-6"
      >
        <SampleSectionHeading
          id="registration-description-heading"
          title="Sample description"
          description="Describe the sample and add any collection notes."
          className="col-span-full"
        />
        <RegistrationField
          id="sample-description"
          label="Description"
          className="[--registration-label-width:7rem] @[42rem]/registration:w-2/3"
        >
          <Textarea
            readOnly={readOnly}
            id="sample-description"
            className="min-h-34"
            placeholder="Describe the sample or add collection notes…"
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
        </RegistrationField>
      </section>
      <section
        aria-labelledby="registration-analysis-heading"
        className="grid gap-6 border-t pt-6 @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-6"
      >
        <SampleSectionHeading
          id="registration-analysis-heading"
          title="Integrity and analysis"
          description="Select the sample integrity and the analysis required."
          className="col-span-full"
        />
        <FieldGroup className="gap-3 [--registration-label-width:7rem]">
          <SelectField
            readOnly={readOnly}
            id="sample-integrity"
            label="Integrity"
            placeholder="Select integrity"
            options={sampleOptions.integrity}
            value={values.integrity}
            onChange={(value) => onChange("integrity", value)}
          />
        </FieldGroup>
        <FieldGroup className="gap-3 [--registration-label-width:8rem]">
          <SelectField
            readOnly={readOnly}
            id="sample-analysis"
            label="Analysis"
            placeholder="Select analysis"
            options={sampleOptions.analyses}
            value={values.analysis}
            onChange={(value) => onChange("analysis", value)}
          />
        </FieldGroup>
      </section>
      <section
        aria-labelledby="registration-receipt-heading"
        className="grid gap-6 border-t pt-6 @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-6"
      >
        <SampleSectionHeading
          id="registration-receipt-heading"
          title="Sampling and receipt"
          description="Record who collected and received the sample."
          className="col-span-full"
        />
        <FieldGroup className="gap-3 [--registration-label-width:7rem]">
          <SelectField
            readOnly={readOnly}
            id="sample-sampler"
            label="Sampler"
            placeholder="Select person"
            options={[receivedBy, ...sampleOptions.samplers]}
            value={values.sampler}
            onChange={(value) => onChange("sampler", value)}
          />
        </FieldGroup>
        <FieldGroup className="gap-3 [--registration-label-width:8rem]">
          <LockedField
            id="sample-received-by"
            label="Received by"
            value={receivedBy}
          />
        </FieldGroup>
      </section>
    </div>
  )
}
