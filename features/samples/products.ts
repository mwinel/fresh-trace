import type { FinalProductType } from "./types"

export const productOptions: {
  value: FinalProductType
  label: string
  chartLabel: string
  color: string
}[] = [
  {
    value: "uht",
    label: "UHT",
    chartLabel: "UHT",
    color: "var(--product-uht)",
  },
  {
    value: "flavored-milk",
    label: "Fresh Dairy Flavored Milk",
    chartLabel: "Flavored milk",
    color: "var(--product-flavored-milk)",
  },
  {
    value: "ghee",
    label: "Pure Natural Ghee",
    chartLabel: "Ghee",
    color: "var(--product-ghee)",
  },
]

export function isProductType(value: unknown): value is FinalProductType {
  return productOptions.some((option) => option.value === value)
}
