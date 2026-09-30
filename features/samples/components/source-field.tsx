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
  sources,
  value,
  onChange,
  onAdd,
  error,
}: {
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
  const [numberPlate, setNumberPlate] = useState("")
  const [nameError, setNameError] = useState("")
  const filtered = sources.filter((source) =>
    `${sourceLabel(source)} ${source.name}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  )

  function startAdding() {
    setName(query.trim())
    setDescription("")
    setType("tanker")
    setNumberPlate("")
    setNameError("")
    setOpen(false)
    setDialogOpen(true)
  }

  return (
    <>
      <Combobox
        items={filtered}
        filter={null}
        value={sources.find((source) => source.id === value) ?? null}
        itemToStringLabel={sourceLabel}
        isItemEqualToValue={(a, b) => a.id === b.id}
        inputValue={query}
        onInputValueChange={setQuery}
        open={open}
        onOpenChange={setOpen}
        onValueChange={(source) => onChange(source?.id ?? "")}
      >
        <ComboboxInput
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
            {query.trim() && (
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
            {query.trim() && (
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
              if (
                !description.trim() ||
                (type === "truck" && !numberPlate.trim())
              ) {
                toast.error(
                  "Enter a description and, for trucks, a number plate containing more than spaces."
                )
                return
              }
              const source: SampleSource = {
                id: crypto.randomUUID(),
                name: trimmedName,
                description: description.trim(),
                type,
                numberPlate:
                  type === "truck" ? numberPlate.trim().toUpperCase() : "",
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
                  id="source-name"
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
                  id="source-description"
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="source-type">Source type</FieldLabel>
                <Select
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
              {type === "truck" && (
                <Field>
                  <FieldLabel htmlFor="source-number-plate">
                    Truck number plate
                  </FieldLabel>
                  <Input
                    id="source-number-plate"
                    required
                    value={numberPlate}
                    onChange={(event) => setNumberPlate(event.target.value)}
                    placeholder="e.g. UBA 123A"
                  />
                </Field>
              )}
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
