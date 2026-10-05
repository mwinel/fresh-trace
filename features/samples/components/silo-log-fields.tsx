"use client"

import { SampleLogFields } from "./sample-log-fields"
import { siloLogSections } from "../silo-log"
import type { SiloLogDetails } from "../types"

export function SiloLogFields(props: {
  readOnly?: boolean
  sampleNumber: string
  values: SiloLogDetails
  onChange: (field: keyof SiloLogDetails, value: string) => void
}) {
  return <SampleLogFields prefix="silo" sections={siloLogSections} {...props} />
}
