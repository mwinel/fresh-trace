"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

import { sourceTypes, sourceLabel } from "../source-utils"
import type { SampleSource } from "../types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

export function SourceField({
  readOnly = false,
  sources,
  value,
  onChange,
  onAdd,
  error,
}: {
  readOnly?: boolean
  sources: SampleSource[]
  value: string
  onChange: (id: string) => void
  onAdd: (source: SampleSource) => void
  error: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(() => {
    const selected = sources.find((source) => source.id === value)
    return selected ? sourceLabel(selected) : ""
  })
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<SampleSource["type"]>("tanker")
  const [nameError, setNameError] = useState("")
  const filtered = sources.filter((source) =>
    source.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  function startAdding() {
    if (readOnly) return
    setName(query.trim())
    setDescription("")
    setType("tanker")
    setNameError("")
    setOpen(false)
    setDialogOpen(true)
  }

  return (
    <>
      <Combobox
        disabled={readOnly}
        items={filtered}
        filter={null}
        value={sources.find((source) => source.id === value) ?? null}
        itemToStringLabel={sourceLabel}
        isItemEqualToValue={(a, b) => a.id === b.id}
        inputValue={query}
        onInputValueChange={setQuery}
        open={!readOnly && open}
        onOpenChange={setOpen}
        onValueChange={(source) => onChange(source?.id ?? "")}
      >
        <ComboboxInput
          disabled={readOnly}
          ref={inputRef}
          id="sample-source"
          placeholder="Search source or truck plate…"
          aria-invalid={Boolean(error)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              open &&
              query.trim() &&
              filtered.length === 0 &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              startAdding()
            }
          }}
        />
        <ComboboxContent>
          <ComboboxEmpty className="flex-col items-center gap-2 px-3 py-3">
            <span>No matching sources.</span>
            {!readOnly && query.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startAdding}
              >
                <PlusIcon aria-hidden="true" />
                Add source
              </Button>
            )}
            {!readOnly && query.trim() && (
              <span className="text-xs">Press Enter to add this source.</span>
            )}
          </ComboboxEmpty>
          <ComboboxList>
            {(source: SampleSource) => (
              <ComboboxItem key={source.id} value={source}>
                {sourceLabel(source)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          finalFocus={inputRef}
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (readOnly) return
              const trimmedName = name.trim()
              if (!trimmedName) {
                setNameError("Enter a source name.")
                toast.error("Enter a source name.")
                return
              }
              if (
                sources.some(
                  (source) =>
                    source.name.toLowerCase() === trimmedName.toLowerCase()
                )
              ) {
                setNameError("A source with this name already exists.")
                toast.error("A source with this name already exists.")
                return
              }
              if (!description.trim()) {
                toast.error("Enter a description containing more than spaces.")
                return
              }
              const source: SampleSource = {
                id: crypto.randomUUID(),
                name: trimmedName,
                description: description.trim(),
                type,
              }
              onAdd(source)
              onChange(source.id)
              setQuery(sourceLabel(source))
              setDialogOpen(false)
            }}
            className="flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle>Add source</DialogTitle>
              <DialogDescription>
                New sources are available for this registration only and reset
                on refresh.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field data-invalid={Boolean(nameError)}>
                <FieldLabel htmlFor="source-name">Name</FieldLabel>
                <Input
                  readOnly={readOnly}
                  id="source-name"
                  placeholder="e.g. Truck · UBQ 112S or Cooling Tanker"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setNameError("")
                  }}
                  aria-invalid={Boolean(nameError)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="source-description">
                  Description
                </FieldLabel>
                <Textarea
                  readOnly={readOnly}
                  id="source-description"
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="source-type">Source type</FieldLabel>
                <Select
                  disabled={readOnly}
                  items={sourceTypes}
                  value={type}
                  onValueChange={(value) => {
                    const selectedType = sourceTypes.find(
                      (option) => option.value === value
                    )
                    if (selectedType) setType(selectedType.value)
                  }}
                >
                  <SelectTrigger id="source-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {sourceTypes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add source</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
