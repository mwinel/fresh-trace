"use client"
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react"
import { formatSampleNumber } from "@/lib/utils"
import { usePathname } from "next/navigation"
import type { Sample, SampleSource } from "../types"
import {
  archiveSampleRecords,
  createSample,
  saveSampleRecord,
} from "../sample-state"
import { createSampleFixtures } from "../data/latest-samples"
import { initialSources } from "../data/registration-data"
type SampleStore = {
  samples: Sample[]
  setSamples: Dispatch<SetStateAction<Sample[]>>
  sources: SampleSource[]
  addSource: (source: SampleSource) => void
  saveSample: (sample: Sample) => void
  createDraft: (receivedBy: string) => Sample
  archiveSamples: (ids: readonly string[]) => void
  referenceAt: string
  archivedReportIds: ReadonlySet<string>
  archiveReports: (ids: readonly string[]) => void
}
const Context = createContext<SampleStore | null>(null)
export function SampleProvider({ children }: { children: ReactNode }) {
  const [archivedReportIds, setArchivedReportIds] = useState<Set<string>>(
    () => new Set()
  )
  const [samples, setSamples] = useState<Sample[]>([])
  const [referenceAt, setReferenceAt] = useState<string | null>(null)
  const initialized = useRef(false)
  const pathname = usePathname()
  const [sources, setSources] = useState(initialSources)
  const reservedIds = useRef(new Set<string>())
  useEffect(() => {
    const now = new Date().toISOString()
    if (!initialized.current) {
      const fixtures = createSampleFixtures(now)
      setSamples(fixtures)
      reservedIds.current = new Set(fixtures.map((sample) => sample.id))
      initialized.current = true
    }
    setReferenceAt(now)
  }, [pathname])
  function createDraft(receivedBy: string) {
    const createdAt = new Date().toISOString()
    for (let suffix = 0; suffix < 1000; suffix++) {
      const id = formatSampleNumber(createdAt, suffix)
      if (reservedIds.current.has(id)) continue
      reservedIds.current.add(id)
      const sample = createSample(id, createdAt, receivedBy)
      setSamples((current) => [sample, ...current])
      setReferenceAt(createdAt)
      return sample
    }
    throw new Error("All sample numbers for today have been used.")
  }
  if (!referenceAt) return null
  return (
    <Context
      value={{
        samples,
        archivedReportIds,
        archiveReports: (ids) =>
          setArchivedReportIds((current) => new Set([...current, ...ids])),
        referenceAt,
        createDraft,
        setSamples,
        sources,
        addSource: (source) => setSources((current) => [...current, source]),
        saveSample: (sample) => {
          const now = new Date().toISOString()
          setSamples((current) => saveSampleRecord(current, sample, now))
          setReferenceAt(now)
        },
        archiveSamples: (ids) => {
          const now = new Date().toISOString()
          setSamples((current) => archiveSampleRecords(current, ids, now))
          setReferenceAt(now)
        },
      }}
    >
      {children}
    </Context>
  )
}
export function useSamples() {
  const value = useContext(Context)
  if (!value) throw new Error("SampleProvider is required")
  return value
}
export function SampleSourceName({ sourceId }: { sourceId: string }) {
  const { sources } = useSamples()
  return (
    sources.find((source) => source.id === sourceId)?.name ?? "Unknown source"
  )
}
