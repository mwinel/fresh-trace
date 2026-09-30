"use client"

import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox"
import {
  SampleSectionHeading,
  RegistrationField,
  LockedField,
  SelectField,
} from "./sample-form-fields"
import { labTestOptions } from "../data"
import { TestResultsSection } from "./test-results-section"
import type { LabTestDetails, LabTestResult } from "../types"

export function LabTestFields({
  reportNumber,
  testResults,
  onTestResultsChange,
  values,
  onChange,
}: {
  reportNumber: string
  testResults: LabTestResult[]
  onTestResultsChange: (rows: LabTestResult[]) => void
  values: LabTestDetails
  onChange: (field: keyof LabTestDetails, value: string) => void
}) {
  return (
    <div className="@container/registration flex flex-col gap-6">
      <section
        aria-labelledby="lab-report-details-heading"
        className="flex min-w-0 flex-col gap-6"
      >
        <SampleSectionHeading
          id="lab-report-details-heading"
          title="Report details"
          description="Link the report to its delivery number and client."
        />
        <FieldGroup className="grid gap-3 [--registration-label-width:9rem] @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-x-6">
          <LockedField
            id="test-report-number"
            label="Report number"
            value={reportNumber}
          />
          <RegistrationField
            id="test-delivery-report-number"
            label="Delivery number"
          >
            <Input
              id="test-delivery-report-number"
              value={values.deliveryReportNumber}
              onChange={(event) =>
                onChange("deliveryReportNumber", event.target.value)
              }
            />
          </RegistrationField>
          <RegistrationField id="test-client" label="Client">
            <Combobox
              items={labTestOptions.clients}
              value={values.client || null}
              onValueChange={(value) => onChange("client", value ?? "")}
            >
              <ComboboxInput id="test-client" placeholder="Search client…" />
              <ComboboxContent>
                <ComboboxEmpty>No matching clients.</ComboboxEmpty>
                <ComboboxList>
                  {(client: string) => (
                    <ComboboxItem key={client} value={client}>
                      {client}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </RegistrationField>
        </FieldGroup>
      </section>
      <section
        aria-labelledby="lab-sample-dates-heading"
        className="flex min-w-0 flex-col gap-6 border-t pt-6"
      >
        <SampleSectionHeading
          id="lab-sample-dates-heading"
          title="Sample dates"
          description="Record when the sample was collected and its sell-by date."
        />
        <FieldGroup className="grid gap-3 [--registration-label-width:9rem] @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-x-6">
          <RegistrationField id="test-sampling-date" label="Sampling date">
            <Input
              id="test-sampling-date"
              type="date"
              value={values.samplingDate}
              onChange={(event) => onChange("samplingDate", event.target.value)}
            />
          </RegistrationField>
          <RegistrationField id="test-sell-by-date" label="Sell-by date">
            <Input
              id="test-sell-by-date"
              type="date"
              value={values.sellByDate}
              onChange={(event) => onChange("sellByDate", event.target.value)}
            />
          </RegistrationField>
        </FieldGroup>
      </section>
      <section
        aria-labelledby="lab-testing-details-heading"
        className="flex min-w-0 flex-col gap-6 border-t pt-6"
      >
        <SampleSectionHeading
          id="lab-testing-details-heading"
          title="Testing details"
          description="Select the laboratory and record the testing date and time."
        />
        <FieldGroup className="grid gap-3 [--registration-label-width:9rem] @[42rem]/registration:grid-cols-2 @[42rem]/registration:gap-x-6">
          <SelectField
            id="test-testing-lab"
            label="Testing lab"
            placeholder="Select testing lab…"
            options={labTestOptions.testingLabs}
            value={values.testingLab}
            onChange={(value) => onChange("testingLab", value)}
          />
          <RegistrationField id="test-testing-date" label="Testing date">
            <Input
              id="test-testing-date"
              type="date"
              value={values.testingDate}
              onChange={(event) => onChange("testingDate", event.target.value)}
            />
          </RegistrationField>
          <RegistrationField id="test-testing-time" label="Testing time">
            <Input
              id="test-testing-time"
              type="time"
              value={values.testingTime}
              onChange={(event) => onChange("testingTime", event.target.value)}
            />
          </RegistrationField>
        </FieldGroup>
      </section>
      <TestResultsSection rows={testResults} onChange={onTestResultsChange} />
    </div>
  )
}
