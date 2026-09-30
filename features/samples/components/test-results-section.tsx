"use client"

import { useRef } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox"
import { testParameters } from "../data"
import type { LabTestResult } from "../types"

function resultColor(value: string) {
  if (value === "positive" || value === "pass" || value === "Normal")
    return "var(--success)"
  if (value === "negative" || value === "fail" || value === "Not normal")
    return "var(--destructive)"
  return undefined
}

const organolepticOptions = [
  { value: "Normal", label: "Normal" },
  { value: "Not normal", label: "Not normal" },
]
const positiveNegativeOptions = [
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
]

function resultOptions(parameter: string) {
  if (parameter === "Organoleptic test") return organolepticOptions
  if (
    [
      "80% Alcohol Test",
      "Clot on boiling",
      "Adulterants & Antibiotics",
    ].includes(parameter)
  )
    return positiveNegativeOptions
  return []
}

function compatibleResult(parameter: string, value: string) {
  const options = resultOptions(parameter)
  return !options.length || options.some((option) => option.value === value)
    ? value
    : ""
}

const columns: { key: keyof Omit<LabTestResult, "id">; label: string }[] = [
  { key: "parameter", label: "Parameter" },
  { key: "fSilo", label: "F/SILO" },
  { key: "mSilo", label: "M/SILO" },
  { key: "bSilo", label: "B/SILO" },
  { key: "lSilo", label: "L/SILO" },
  { key: "status", label: "Status" },
]

export function createTestResult(parameter: string): LabTestResult {
  return {
    id: crypto.randomUUID(),
    parameter,
    fSilo: "",
    mSilo: "",
    bSilo: "",
    lSilo: "",
    status: "",
  }
}

export function TestResultsSection({
  rows,
  onChange,
}: {
  rows: LabTestResult[]
  onChange: (rows: LabTestResult[]) => void
}) {
  const focusRow = useRef<string | null>(null)
  const nextParameter = testParameters.find(
    (parameter) => !rows.some((row) => row.parameter === parameter)
  )

  return (
    <section
      aria-labelledby="test-results-heading"
      className="flex min-w-0 flex-col gap-2 border-t pt-6"
    >
      <div className="flex flex-col gap-1">
        <h3 id="test-results-heading" className="text-sm font-medium">
          Test results
        </h3>
        <p className="text-sm text-muted-foreground">
          Use Add line to record another parameter.
        </p>
      </div>
      <div className="-mx-1 min-w-0 [&>[data-slot=table-container]]:px-1">
        <Table className="min-w-[700px] table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  scope="col"
                  className={
                    column.key === "parameter"
                      ? "w-[26%] pr-1 pl-0"
                      : column.key === "status"
                        ? "w-[16%] px-1"
                        : "w-[13%] px-1"
                  }
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead scope="col" className="w-[4%] pr-0 pl-1">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="px-1 first:pl-0 last:pr-0"
                  >
                    {column.key === "parameter" ? (
                      <Combobox
                        items={testParameters.filter(
                          (parameter) =>
                            !rows.some(
                              (other) =>
                                other.id !== row.id &&
                                other.parameter === parameter
                            )
                        )}
                        value={row.parameter || null}
                        onValueChange={(parameter) =>
                          onChange(
                            rows.map((current) =>
                              current.id === row.id
                                ? {
                                    ...current,
                                    parameter: parameter ?? "",
                                    fSilo: compatibleResult(
                                      parameter ?? "",
                                      current.fSilo
                                    ),
                                    mSilo: compatibleResult(
                                      parameter ?? "",
                                      current.mSilo
                                    ),
                                    bSilo: compatibleResult(
                                      parameter ?? "",
                                      current.bSilo
                                    ),
                                    lSilo: compatibleResult(
                                      parameter ?? "",
                                      current.lSilo
                                    ),
                                  }
                                : current
                            )
                          )
                        }
                      >
                        <ComboboxInput
                          aria-label={`Parameter, row ${index + 1}`}
                          placeholder="Select parameter…"
                          ref={(element) => {
                            if (element && focusRow.current === row.id) {
                              element.focus()
                              focusRow.current = null
                            }
                          }}
                        />
                        <ComboboxContent className="w-max min-w-(--anchor-width)">
                          <ComboboxEmpty>No matching parameters.</ComboboxEmpty>
                          <ComboboxList>
                            {(parameter: string) => (
                              <ComboboxItem
                                key={parameter}
                                value={parameter}
                                className="whitespace-nowrap"
                              >
                                {parameter}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    ) : column.key === "status" ? (
                      <Select
                        items={[
                          { value: "fail", label: "Fail" },
                          { value: "pass", label: "Pass" },
                        ]}
                        value={row.status || null}
                        onValueChange={(status) => {
                          if (status !== "pass" && status !== "fail") return
                          onChange(
                            rows.map((current) =>
                              current.id === row.id
                                ? { ...current, status }
                                : current
                            )
                          )
                        }}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`Status, row ${index + 1}`}
                        >
                          <SelectValue
                            placeholder="Select status"
                            style={{ color: resultColor(row.status) }}
                          />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            <SelectItem value="fail">
                              <span style={{ color: resultColor("fail") }}>
                                Fail
                              </span>
                            </SelectItem>
                            <SelectItem value="pass">
                              <span style={{ color: resultColor("pass") }}>
                                Pass
                              </span>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : resultOptions(row.parameter).length > 0 ? (
                      <Select
                        items={resultOptions(row.parameter)}
                        value={row[column.key] || null}
                        onValueChange={(value) => {
                          if (!value) return
                          onChange(
                            rows.map((current) =>
                              current.id === row.id
                                ? { ...current, [column.key]: value }
                                : current
                            )
                          )
                        }}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`${column.label}, row ${index + 1}`}
                        >
                          <SelectValue
                            placeholder="Select"
                            style={{ color: resultColor(row[column.key]) }}
                          />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {resultOptions(row.parameter).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <span
                                  style={{ color: resultColor(option.value) }}
                                >
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        aria-label={`${column.label}, row ${index + 1}`}
                        value={row[column.key]}
                        onChange={(event) =>
                          onChange(
                            rows.map((current) =>
                              current.id === row.id
                                ? {
                                    ...current,
                                    [column.key]: event.target.value,
                                  }
                                : current
                            )
                          )
                        }
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-righ pr-0 pl-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Delete ${row.parameter || "test result"}, row ${index + 1}`}
                    onClick={() =>
                      onChange(rows.filter((current) => current.id !== row.id))
                    }
                  >
                    <Trash2Icon
                      className="text-destructive"
                      aria-hidden="true"
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        variant="link"
        className="self-start px-0"
        disabled={!nextParameter}
        onClick={() => {
          if (!nextParameter) return
          const row = createTestResult(nextParameter)
          focusRow.current = row.id
          onChange([...rows, row])
        }}
      >
        <PlusIcon aria-hidden="true" />
        Add line
      </Button>
      {!nextParameter && (
        <p className="text-sm text-muted-foreground">
          All parameters have been added.
        </p>
      )}
    </section>
  )
}
