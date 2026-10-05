import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AnalysisSelect({
  label,
  value,
  options,
  onChange,
  prefix = true,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  prefix?: boolean
}) {
  return (
    <Select
      value={value}
      items={options}
      onValueChange={(value) => {
        if (value !== null) onChange(value)
      }}
    >
      <SelectTrigger
        aria-label={label}
        className="w-full min-w-0 sm:w-auto sm:min-w-36"
      >
        {prefix && <span className="text-muted-foreground">{label}:</span>}
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
