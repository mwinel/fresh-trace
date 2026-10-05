import type { SampleSource } from "./types"

export const sourceTypes: { value: SampleSource["type"]; label: string }[] = [
  { value: "tanker", label: "Tanker" },
  { value: "truck", label: "Truck" },
  { value: "cooling-tank", label: "Cooling Tanker" },
  { value: "mixing-tank", label: "Mixing Tank" },
  { value: "bag", label: "Bag" },
  { value: "evaporator", label: "Evaporator" },
]

export function sourceLabel(source: SampleSource) {
  return source.name
}
