import type { FinalProductType, Sample } from "./types"
import { sampleRegistrationTime } from "./metrics"

export type SampleChartDays = 7 | 30 | 90
export type ProductChartRow = { date: string; total: number } & Record<
  FinalProductType,
  number
>
const day = 24 * 60 * 60 * 1000
const kampalaOffset = 3 * 60 * 60 * 1000

export function getProductSampleMetrics(
  samples: Sample[],
  referenceAt: string,
  days: SampleChartDays
) {
  const end = Date.parse(referenceAt)
  const start = end - days * day
  const firstDay = Math.floor((start + kampalaOffset) / day) * day
  const lastDay = Math.floor((end + kampalaOffset) / day) * day
  const buckets = new Map<string, ProductChartRow>()
  for (let date = firstDay; date <= lastDay; date += day) {
    const key = new Date(date).toISOString().slice(0, 10)
    buckets.set(key, {
      date: key,
      uht: 0,
      "flavored-milk": 0,
      ghee: 0,
      total: 0,
    })
  }
  let total = 0
  for (const sample of samples) {
    const registeredAt = sampleRegistrationTime(sample)
    const product = sample.registration.productType
    if (!registeredAt || !product) continue
    const time = Date.parse(registeredAt)
    if (time <= start || time > end) continue
    const key = new Date(time + kampalaOffset).toISOString().slice(0, 10)
    const row = buckets.get(key)
    if (!row) continue
    row[product]++
    row.total++
    total++
  }
  return { rows: [...buckets.values()], total }
}
