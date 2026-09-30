"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { useDemoSession } from "@/features/auth/session-provider"
import { sampleSteps, initialSources, testParameters } from "../data"
import type {
  SampleIdentity,
  SampleRegistration,
  LabTestDetails,
  ReportReview,
} from "../types"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { createTestResult } from "./test-results-section"
import { LabReportPreview } from "./lab-report-preview"
import { LabTestFields } from "./lab-test-fields"
import { RegistrationFields } from "./registration-fields"
import { SampleLogFields } from "./sample-log-fields"
import {
  emptyStandardizationLog,
  standardizationLogSections,
} from "../standardization-log"
import { emptyUhtLog, uhtLogSections } from "../uht-log"
import { SiloLogFields } from "./silo-log-fields"
import { emptySiloLog } from "../silo-log"
import { TankerLogFields } from "./tanker-log-fields"
import { createTankerChamber, emptyTankerLog } from "../tanker-log"

const emptyReview: ReportReview = {
  status: "awaiting-review",
  conclusion: "",
  remarks: "",
  analysedBy: null,
  technicalSignatory: null,
  decidedBy: null,
}

const emptyRegistration: SampleRegistration = {
  source: "",
  description: "",
  volume: "",
  equipment: "",
  temperature: "",
  receiptTime: "",
  integrity: "",
  analysis: "",
  sampler: "",
}

type SavedSample = SampleIdentity & {
  values: SampleRegistration
  receivedBy: string
  status: "draft" | "registered"
}

export function SampleRegistrationPage() {
  const { user } = useDemoSession()
  // The dashboard session gate mounts this page only in the browser.
  const [identity] = useState<SampleIdentity>(() => ({
    id: `SM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }))
  const [reportNumber] = useState(
    () => `RP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  )
  const [labDetails, setLabDetails] = useState<LabTestDetails>({
    deliveryReportNumber: "",
    client: "",
    testingLab: "",
    sellByDate: "",
    samplingDate: "",
    testingDate: "",
    reportIssueDate: new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Africa/Kampala",
    }).format(new Date(identity.createdAt)),
    testingTime: "",
  })
  const [testResults, setTestResults] = useState(() =>
    testParameters.slice(0, 4).map((parameter) => createTestResult(parameter))
  )
  const [review, setReview] = useState<ReportReview>(emptyReview)
  const [standardizationDetails, setStandardizationDetails] = useState(
    emptyStandardizationLog
  )
  const [uhtDetails, setUhtDetails] = useState(emptyUhtLog)
  const [siloDetails, setSiloDetails] = useState(emptySiloLog)
  const [tankerDetails, setTankerDetails] = useState(emptyTankerLog)
  const [tankerChambers, setTankerChambers] = useState(() =>
    ["F", "M", "B"].map(createTankerChamber)
  )
  const [sources, setSources] = useState(initialSources)
  const [values, setValues] = useState(emptyRegistration)
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState<SavedSample | null>(null)
  const [sourceError, setSourceError] = useState("")
  const heading = useRef<HTMLHeadingElement>(null)
  const currentStep = sampleSteps[step]
  const stepForm = (
    {
      1: "sample-lab-tests",
      3: "sample-tanker-log",
      4: "sample-silo-log",
      5: "sample-standardization-log",
      6: "sample-uht-log",
    } as Record<number, string | undefined>
  )[step]
  const isSaved =
    saved !== null && JSON.stringify(saved.values) === JSON.stringify(values)

  function updateField(field: keyof SampleRegistration, value: string) {
    setReview(emptyReview)
    setValues((current) => ({ ...current, [field]: value }))
    if (field === "source") setSourceError("")
  }

  function selectStep(index: number) {
    setStep(index)
    heading.current?.focus()
  }

  function save(status: SavedSample["status"]) {
    if (!user) return
    setSaved({
      ...identity,
      receivedBy: user.name,
      values: { ...values },
      status,
    })
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height))] min-h-0 min-w-0 flex-col gap-5 p-4 md:h-[calc(100dvh-var(--header-height)-1rem)] lg:p-6">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/samples"
            className={buttonVariants({
              variant: "secondary",
              size: "icon-sm",
            })}
          >
            <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
          </Link>
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-base leading-none font-medium outline-none"
          >
            Step {step + 1} · {currentStep.title}
          </h2>
        </div>
        <p className="pr-0.5 text-sm font-medium">{identity.id}</p>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border">
        <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-5 px-4 md:grid-cols-[220px_minmax(0,1fr)] md:grid-rows-1 lg:gap-6">
          <nav
            aria-label="Sample registration steps"
            className="min-h-0 min-w-0 overflow-auto pt-4 md:pb-4"
          >
            <ol className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
              {sampleSteps.map((item, index) => (
                <li key={item.id} className="shrink-0">
                  <Button
                    type="button"
                    variant={step === index ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    aria-current={step === index ? "step" : undefined}
                    onClick={() => selectStep(index)}
                  >
                    <Badge
                      variant={step === index ? "default" : "outline"}
                      className="size-5 rounded-full p-0"
                    >
                      {index + 1}
                    </Badge>
                    {item.label}
                  </Button>
                </li>
              ))}
            </ol>
          </nav>
          {step === 0 ? (
            <form
              id="sample-registration"
              onSubmit={(event) => {
                event.preventDefault()
                if (!values.source) {
                  const message =
                    "Select a source before registering the sample."
                  setSourceError(message)
                  toast.error(message, { id: "sample-source-error" })
                  event.currentTarget
                    .querySelector<HTMLInputElement>("#sample-source")
                    ?.focus()
                  return
                }
                save("registered")
                selectStep(1)
              }}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <RegistrationFields
                  identity={identity}
                  receivedBy={user?.name ?? ""}
                  values={values}
                  onChange={updateField}
                  sources={sources}
                  onAddSource={(source) =>
                    setSources((current) => [...current, source])
                  }
                  sourceError={sourceError}
                />
              </div>
            </form>
          ) : step === 1 ? (
            <form
              id="sample-lab-tests"
              onSubmit={(event) => {
                event.preventDefault()
                if (!user) return
                setReview((current) => ({
                  ...current,
                  analysedBy: current.analysedBy ?? {
                    name: user.name,
                    email: user.email,
                    signedAt: new Date().toISOString(),
                  },
                }))
                selectStep(2)
              }}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <LabTestFields
                  reportNumber={reportNumber}
                  testResults={testResults}
                  onTestResultsChange={(rows) => {
                    setTestResults(rows)
                    setReview(emptyReview)
                  }}
                  values={labDetails}
                  onChange={(field, value) => {
                    setLabDetails((current) => ({ ...current, [field]: value }))
                    setReview(emptyReview)
                  }}
                />
              </div>
            </form>
          ) : step === 2 ? (
            <div className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain">
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <LabReportPreview
                  reportNumber={reportNumber}
                  identity={identity}
                  details={labDetails}
                  source={sources.find((source) => source.id === values.source)}
                  results={testResults}
                  review={review}
                  reviewerName={user?.name ?? ""}
                  onReview={(action, conclusion, remarks) => {
                    if (!user) return
                    const signature = {
                      name: user.name,
                      email: user.email,
                      signedAt: new Date().toISOString(),
                    }
                    setReview((current) =>
                      action === "technical-sign-off"
                        ? {
                            ...current,
                            conclusion,
                            remarks,
                            technicalSignatory: signature,
                            status: "awaiting-review",
                            decidedBy: null,
                          }
                        : {
                            ...current,
                            conclusion,
                            remarks,
                            status: action,
                            decidedBy: signature,
                            technicalSignatory:
                              current.conclusion === conclusion &&
                              current.remarks === remarks
                                ? current.technicalSignatory
                                : null,
                          }
                    )
                    toast.success(
                      action === "technical-sign-off"
                        ? "Technical sign-off recorded for this demo session."
                        : `Report ${action} for this demo session.`
                    )
                  }}
                />
              </div>
            </div>
          ) : step === 3 ? (
            <form
              id="sample-tanker-log"
              onSubmit={(event) => {
                event.preventDefault()
                toast.success(
                  "Tanker log retained for this demo session. Entries reset on refresh."
                )
                selectStep(4)
              }}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <TankerLogFields
                  sampleNumber={identity.id}
                  values={tankerDetails}
                  chambers={tankerChambers}
                  onChange={(field, value) =>
                    setTankerDetails((current) => ({
                      ...current,
                      [field]: value,
                    }))
                  }
                  onChambersChange={setTankerChambers}
                />
              </div>
            </form>
          ) : step === 4 ? (
            <form
              id="sample-silo-log"
              onSubmit={(event) => {
                event.preventDefault()
                toast.success(
                  "Silo log retained for this demo session. Entries reset on refresh."
                )
                selectStep(5)
              }}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <SiloLogFields
                  sampleNumber={identity.id}
                  values={siloDetails}
                  onChange={(field, value) =>
                    setSiloDetails((current) => ({
                      ...current,
                      [field]: value,
                    }))
                  }
                />
              </div>
            </form>
          ) : step === 5 ? (
            <form
              id="sample-standardization-log"
              onSubmit={(event) => {
                event.preventDefault()
                toast.success(
                  "Standardization log retained for this demo session. Entries reset on refresh."
                )
                selectStep(6)
              }}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <SampleLogFields
                  prefix="standardization"
                  sections={standardizationLogSections}
                  sampleNumber={identity.id}
                  values={standardizationDetails}
                  onChange={(field, value) =>
                    setStandardizationDetails((current) => ({
                      ...current,
                      [field]: value,
                    }))
                  }
                />
              </div>
            </form>
          ) : (
            <form
              id="sample-uht-log"
              onSubmit={(event) => {
                event.preventDefault()
                toast.success(
                  "UHT log saved for this demo session. Entries reset on refresh."
                )
              }}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <SampleLogFields
                  prefix="uht"
                  sections={uhtLogSections}
                  sampleNumber={identity.id}
                  values={uhtDetails}
                  onChange={(field, value) =>
                    setUhtDetails((current) => ({ ...current, [field]: value }))
                  }
                />
              </div>
            </form>
          )}
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted px-5 py-3">
          {step === 0 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => save("draft")}
              >
                Save draft
              </Button>
              <Button type="submit" form="sample-registration">
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button
                className="mr-auto"
                variant="outline"
                onClick={() => selectStep(step - 1)}
              >
                <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
                Back
              </Button>
              {step === sampleSteps.length - 1 && (
                <Button type="submit" form={stepForm}>
                  Save
                </Button>
              )}
              {step < sampleSteps.length - 1 && (
                <Button
                  variant="default"
                  type={stepForm ? "submit" : "button"}
                  form={stepForm}
                  onClick={stepForm ? undefined : () => selectStep(step + 1)}
                >
                  Next step
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
