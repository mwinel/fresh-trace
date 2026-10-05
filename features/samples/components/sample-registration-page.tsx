"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  canViewStage,
  resolveStage,
  stageIndex,
  canAdvance,
  advanceSample,
} from "../workflow"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { useDemoSession } from "@/features/auth/session-provider"
import { sampleSteps } from "../data/registration-data"
import type { SampleListItem } from "../data/latest-samples"
import {
  emptyReview,
  changeSampleProduct,
  sampleProductError,
  sampleFinalProductLog,
} from "../sample-state"
import { useSamples } from "./sample-provider"
import type { Sample } from "../types"
import type { SampleRegistration } from "../types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LabReportPreview } from "./lab-report-preview"
import { LabTestFields } from "./lab-test-fields"
import { RegistrationFields } from "./registration-fields"
import { SampleLogFields } from "./sample-log-fields"
import {
  emptyStandardizationLog,
  standardizationLogSections,
} from "../standardization-log"
import { FinalProductLogFields } from "./final-product-log-fields"
import { SiloLogFields } from "./silo-log-fields"
import { emptySiloLog } from "../silo-log"
import { TankerLogFields } from "./tanker-log-fields"
import { createTankerChamber, emptyTankerLog } from "../tanker-log"

export function SampleRegistrationPage({
  existingSample,
}: {
  existingSample: SampleListItem
}) {
  const { user } = useDemoSession()
  const { samples, sources, addSource, saveSample } = useSamples()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requested =
    searchParams.get("stage") ??
    (searchParams.get("view") === "report" ? "lab-report" : null)
  const viewedStage = resolveStage(existingSample, requested)
  const step = stageIndex(viewedStage)
  const editing = searchParams.get("mode") === "edit"
  const [sample, setSample] = useState<Sample>(() =>
    structuredClone(existingSample)
  )
  // Provider-managed history is not an unsaved form edit.
  const dirty =
    JSON.stringify({
      ...sample,
      statusHistory: existingSample.statusHistory,
    }) !== JSON.stringify(existingSample)
  useEffect(() => {
    if (requested && !canViewStage(existingSample, requested)) {
      window.history.replaceState(
        null,
        "",
        `/samples/${existingSample.id}?stage=${existingSample.stage}${editing ? "&mode=edit" : ""}`
      )
    }
  }, [requested, existingSample, editing])
  function navigate(stage = viewedStage, editMode = editing) {
    window.history.replaceState(
      null,
      "",
      `/samples/${sample.id}?stage=${stage}${editMode ? "&mode=edit" : ""}`
    )
  }
  function discardChanges() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return false
    setSample(structuredClone(existingSample))
    return true
  }
  const displayedSample = editing ? sample : existingSample
  const identity = displayedSample
  const values = displayedSample.registration
  const {
    reportNumber,
    details: labDetails,
    results: testResults,
    review,
  } = displayedSample.laboratory
  const standardizationDetails =
    displayedSample.logs.standardization ?? emptyStandardizationLog
  const finalProductDetails = sampleFinalProductLog(displayedSample)
  const siloDetails = displayedSample.logs.silo ?? emptySiloLog
  const [initialChambers] = useState(() =>
    ["F", "M", "B"].map(createTankerChamber)
  )
  const tankerDetails = displayedSample.logs.tanker?.details ?? emptyTankerLog
  const tankerChambers =
    displayedSample.logs.tanker?.chambers ?? (editing ? initialChambers : [])

  function updateLaboratory<K extends keyof Sample["laboratory"]>(
    key: K,
    value: Sample["laboratory"][K]
  ) {
    if (!editing) return
    setSample((current) => ({
      ...current,
      laboratory: {
        ...current.laboratory,
        [key]: value,
        review: { ...emptyReview },
      },
    }))
  }

  function updateLog<K extends keyof Sample["logs"]>(
    key: K,
    value: Sample["logs"][K]
  ) {
    if (!editing) return
    setSample((current) => ({
      ...current,
      logs: { ...current.logs, [key]: value },
    }))
  }

  function persist(next: Sample = sample) {
    if (!editing) return
    const saved = samples.find((item) => item.id === next.id)
    for (const key of ["silo", "standardization", "finalProduct"] as const) {
      const log = next.logs[key]
      if (log && JSON.stringify(log) !== JSON.stringify(saved?.logs[key])) {
        next = {
          ...next,
          logs: {
            ...next.logs,
            [key]: { ...log, labTechnician: user?.name ?? "" },
          },
        }
      }
    }

    setSample(next)
    saveSample(next)
    navigate(next.stage === existingSample.stage ? viewedStage : next.stage)
    toast.success("Sample updated successfully.", {
      description: "Changes are temporary and reset when you refresh.",
      position: "top-right",
    })
  }

  function submit(advance = false) {
    if (!editing || !user) return

    if (
      advance &&
      viewedStage === "register" &&
      !sample.registration.sourceId
    ) {
      setSourceError("Select a source before registering the sample.")
      toast.error("Select a source before registering the sample.")
      document.getElementById("sample-source")?.focus()
      return
    }

    const productMessage = sampleProductError(sample, advance)
    setProductError(productMessage)
    if (productMessage) {
      toast.error(productMessage)
      document.getElementById("sample-product")?.focus()
      return
    }

    let next = sample

    if (editing) {
      if (step === 3 && !next.logs.tanker)
        next = {
          ...next,
          logs: {
            ...next.logs,
            tanker: { details: tankerDetails, chambers: tankerChambers },
          },
        }
      if (step === 4 && !next.logs.silo)
        next = { ...next, logs: { ...next.logs, silo: { ...emptySiloLog } } }
      if (step === 5 && !next.logs.standardization)
        next = {
          ...next,
          logs: {
            ...next.logs,
            standardization: { ...emptyStandardizationLog },
          },
        }
      if (step === 6 && !next.logs.finalProduct)
        next = {
          ...next,
          logs: { ...next.logs, finalProduct: sampleFinalProductLog(next) },
        }
    }

    if (viewedStage === "lab-tests" && (editing || advance))
      next = {
        ...next,
        laboratory: {
          ...next.laboratory,
          review: {
            ...next.laboratory.review,
            analysedBy: {
              name: user.name,
              email: user.email,
              signedAt: new Date().toISOString(),
            },
          },
        },
      }

    if (advance) next = advanceSample(next, viewedStage)

    persist(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit(
      (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
        "advance"
    )
  }

  const formId = [
    "sample-registration",
    "sample-lab-tests",
    undefined,
    "sample-tanker-log",
    "sample-silo-log",
    "sample-standardization-log",
    "sample-final-product-log",
  ][step]
  const [productError, setProductError] = useState("")
  const [sourceError, setSourceError] = useState("")
  const heading = useRef<HTMLHeadingElement>(null)
  const currentStep = sampleSteps[step]

  function updateField(field: keyof SampleRegistration, value: string) {
    if (!editing) return

    setSample((current) => ({
      ...current,
      registration: { ...current.registration, [field]: value },
      laboratory: { ...current.laboratory, review: { ...emptyReview } },
    }))

    if (field === "sourceId") setSourceError("")
  }

  function selectStep(index: number) {
    const stage = sampleSteps[index]?.id

    if (!stage || !canViewStage(existingSample, stage) || !discardChanges())
      return
    navigate(stage)
    heading.current?.focus()
  }

  return (
    <div className="grid h-[calc(100dvh-var(--header-height))] min-h-0 min-w-0 shrink-0 grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden p-4 md:h-[calc(100dvh-var(--header-height)-1rem)] lg:p-6">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Back to Samples"
            onClick={() => {
              if (discardChanges()) router.push("/samples")
            }}
          >
            <ArrowLeftIcon aria-hidden="true" />
          </Button>
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-base leading-none font-medium outline-none"
          >
            Step {step + 1} · {currentStep.title}
          </h2>
        </div>
      </div>
      <div
        className={cn(
          "grid min-h-0 min-w-0 overflow-hidden rounded-xl border",
          editing
            ? "grid-rows-[minmax(0,1fr)_auto]"
            : "grid-rows-[minmax(0,1fr)]"
        )}
      >
        <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden px-4 md:grid-cols-[220px_minmax(0,1fr)] md:grid-rows-1 lg:gap-6">
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
                    disabled={!canViewStage(existingSample, item.id)}
                    title={
                      !canViewStage(existingSample, item.id)
                        ? "Not reached"
                        : undefined
                    }
                    onClick={() => selectStep(index)}
                  >
                    <Badge
                      variant={step === index ? "default" : "outline"}
                      className="size-5 rounded-full p-0"
                    >
                      {index + 1}
                    </Badge>
                    {item.label}
                    {!canViewStage(existingSample, item.id) && (
                      <span className="sr-only"> — Not reached</span>
                    )}
                  </Button>
                </li>
              ))}
            </ol>
          </nav>
          {step === 0 ? (
            <form
              id="sample-registration"
              onSubmit={handleSubmit}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <RegistrationFields
                  readOnly={!editing}
                  identity={identity}
                  receivedBy={values.receivedBy}
                  values={values}
                  onChange={updateField}
                  sources={sources}
                  onAddSource={(source) => {
                    if (editing) addSource(source)
                  }}
                  sourceError={sourceError}
                  productError={productError}
                  onProductChange={(productType) => {
                    if (!editing) return
                    setSample((current) =>
                      changeSampleProduct(current, productType)
                    )
                    setProductError("")
                  }}
                />
              </div>
            </form>
          ) : step === 1 ? (
            <form
              id="sample-lab-tests"
              onSubmit={handleSubmit}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <LabTestFields
                  readOnly={!editing}
                  reportNumber={reportNumber}
                  testResults={testResults}
                  onTestResultsChange={(rows) =>
                    updateLaboratory("results", rows)
                  }
                  values={labDetails}
                  onChange={(field, value) =>
                    updateLaboratory("details", {
                      ...labDetails,
                      [field]: value,
                    })
                  }
                />
              </div>
            </form>
          ) : step === 2 ? (
            <div className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain">
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <LabReportPreview
                  readOnly={!editing}
                  reportNumber={reportNumber}
                  identity={identity}
                  details={labDetails}
                  source={sources.find(
                    (source) => source.id === values.sourceId
                  )}
                  results={testResults}
                  review={review}
                  onReview={(action, conclusion, remarks) => {
                    if (!editing || !user) return
                    persist({
                      ...sample,
                      laboratory: {
                        ...sample.laboratory,
                        review: {
                          ...review,
                          status: action,
                          conclusion,
                          remarks,
                        },
                      },
                    })
                  }}
                />
              </div>
            </div>
          ) : step === 3 ? (
            <form
              id="sample-tanker-log"
              onSubmit={handleSubmit}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <TankerLogFields
                  readOnly={!editing}
                  sampleNumber={identity.id}
                  values={tankerDetails}
                  chambers={tankerChambers}
                  onChange={(field, value) =>
                    updateLog("tanker", {
                      details: { ...tankerDetails, [field]: value },
                      chambers: tankerChambers,
                    })
                  }
                  onChambersChange={(chambers) =>
                    updateLog("tanker", { details: tankerDetails, chambers })
                  }
                />
              </div>
            </form>
          ) : step === 4 ? (
            <form
              id="sample-silo-log"
              onSubmit={handleSubmit}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <SiloLogFields
                  readOnly={!editing}
                  sampleNumber={identity.id}
                  values={siloDetails}
                  onChange={(field, value) =>
                    updateLog("silo", { ...siloDetails, [field]: value })
                  }
                />
              </div>
            </form>
          ) : step === 5 ? (
            <form
              id="sample-standardization-log"
              onSubmit={handleSubmit}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <SampleLogFields
                  readOnly={!editing}
                  prefix="standardization"
                  sections={standardizationLogSections}
                  sampleNumber={identity.id}
                  values={standardizationDetails}
                  onChange={(field, value) =>
                    updateLog("standardization", {
                      ...standardizationDetails,
                      [field]: value,
                    })
                  }
                />
              </div>
            </form>
          ) : (
            <form
              id="sample-final-product-log"
              onSubmit={handleSubmit}
              className="no-scrollbar min-h-0 min-w-0 overflow-y-auto overscroll-contain"
            >
              <div className="px-1 pt-4 pb-16 md:pt-6">
                <FinalProductLogFields
                  readOnly={!editing}
                  sampleNumber={identity.id}
                  values={finalProductDetails}
                  onChange={(values) => {
                    if (!editing) return
                    setSample((current) => ({
                      ...current,
                      registration: {
                        ...current.registration,
                        productType:
                          values.productType ??
                          current.registration.productType,
                      },
                      logs: { ...current.logs, finalProduct: values },
                    }))
                  }}
                />
              </div>
            </form>
          )}
        </div>
        {editing && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted px-5 py-3">
            {step > 0 && (
              <Button
                className="mr-auto"
                variant="outline"
                onClick={() => selectStep(step - 1)}
              >
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSample(structuredClone(existingSample))
                navigate(viewedStage, false)
              }}
            >
              Cancel
            </Button>
            {formId && !canAdvance(existingSample, viewedStage) && (
              <Button type="submit" form={formId}>
                {sample.status === "draft" && step === 0
                  ? "Save draft"
                  : "Save"}
              </Button>
            )}
            {canAdvance(existingSample, viewedStage) && (
              <Button
                type={formId ? "submit" : "button"}
                value="advance"
                form={formId}
                onClick={formId ? undefined : () => submit(true)}
              >
                {step === 6 ? "Complete" : "Continue"}
                {step < 6 && <ArrowRightIcon aria-hidden="true" />}
              </Button>
            )}
          </footer>
        )}
      </div>
    </div>
  )
}
