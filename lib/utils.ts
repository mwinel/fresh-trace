export { cn } from "cn"

const sampleDateFormat = new Intl.DateTimeFormat("en-GB", {
  year: "2-digit",
  day: "2-digit",
  month: "numeric",
  timeZone: "Africa/Kampala",
})

export function formatSampleNumber(registeredAt: string, suffix: number) {
  if (!Number.isInteger(suffix) || suffix < 0 || suffix > 999) {
    throw new Error("Sample suffix must be between 000 and 999.")
  }

  const parts = sampleDateFormat.formatToParts(new Date(registeredAt))
  const year = parts.find((part) => part.type === "year")!.value
  const day = parts.find((part) => part.type === "day")!.value
  const month = parts.find((part) => part.type === "month")!.value

  return `C${year}${day}${month}-${String(suffix).padStart(3, "0")}`
}
