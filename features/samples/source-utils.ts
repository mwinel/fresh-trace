import type { SampleSource } from "./types"

export const sourceTypes: { value: SampleSource["type"]; label: string }[] = [
  { value: "tanker", label: "Tanker" },
  { value: "truck", label: "Truck" },
  { value: "cooling-tank", label: "Cooling tank" },
  { value: "mixing-tank", label: "Mixing tank" },
  { value: "bag", label: "Bag" },
  { value: "evaporator", label: "Evaporator" },
]

export function sourceLabel(source: SampleSource) {
  return source.type === "truck"
    ? `Truck · ${source.numberPlate}`
    : (sourceTypes.find((option) => option.value === source.type)?.label ??
        source.name)
}
