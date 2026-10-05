"use client"

import { useSamples } from "./sample-provider"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { sampleSteps } from "../data/registration-data"
import { stageDotClasses } from "../stage-styles"
import { useSampleSearch } from "./sample-search-provider"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  ArrowUpDownIcon,
  EllipsisIcon,
  ArchiveIcon,
  ListFilterIcon,
  GripVerticalIcon,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import {
  type SampleListItem,
  sampleStatusLabels,
  sampleStageLabel,
} from "../data/latest-samples"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  sampleColumns as columns,
  type SampleColumnId as ColumnId,
} from "./sample-table-columns"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

const stageOptions = [
  { value: "all", label: "All stages", dotClass: "bg-muted-foreground" },
  ...sampleSteps.map((step) => ({
    value: step.id,
    label: step.label,
    dotClass: stageDotClasses[step.id],
  })),
]
const pageSizeOptions = [10, 20, 30, 40, 50]
const sortOptions = [
  { value: "date-desc", label: "Date: Newest first" },
  { value: "date-asc", label: "Date: Oldest first" },
  { value: "number-asc", label: "Sample No: Asc" },
  { value: "number-desc", label: "Sample No: Desc" },
] as const
type SampleSort = (typeof sortOptions)[number]["value"]
const pageSizeStorageKey = "fresh-trace:samples:rows-per-page"
const columnsStorageKey = "fresh-trace:samples:hidden-columns"
const statusFilters = [
  { value: "all", label: "All samples" },
  ...Object.entries(sampleStatusLabels).map(([value, label]) => ({
    value,
    label,
  })),
]

function SortableSampleRow({
  sample,
  selected,
  onSelect,
  hiddenColumns,
}: {
  hiddenColumns: Set<ColumnId>
  sample: SampleListItem
  selected: boolean
  onSelect: (checked: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sample.id })
  return (
    <TableRow
      ref={setNodeRef}
      data-state={selected ? "selected" : undefined}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <TableCell className="w-10">
        <Button
          ref={setActivatorNodeRef}
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Reorder sample ${sample.id}`}
        >
          <GripVerticalIcon aria-hidden="true" />
        </Button>
      </TableCell>
      <TableCell className="w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select sample ${sample.id}`}
        />
      </TableCell>
      {columns
        .filter((column) => !hiddenColumns.has(column.id))
        .map((column) => (
          <TableCell key={column.id} className={column.className}>
            {column.cell(sample)}
          </TableCell>
        ))}
    </TableRow>
  )
}

export function LatestSamplesTable({
  showRowsPerPage = true,
  showHeading = true,
  showDescription = true,
  showStageFilter = false,
  enableSearch = false,
}: {
  showRowsPerPage?: boolean
  showHeading?: boolean
  showDescription?: boolean
  showStageFilter?: boolean
  enableSearch?: boolean
}) {
  const { query, setQuery } = useSampleSearch()
  const search = enableSearch ? query.trim().toLowerCase() : ""
  const dndId = useId()
  const {
    samples: allSamples,
    setSamples,
    sources,
    archiveSamples,
  } = useSamples()
  const samples = useMemo(
    () => allSamples.filter((sample) => !sample.archivedAt),
    [allSamples]
  )
  const [sort, setSort] = useState<SampleSort | null>("date-desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [previousSamples, setPreviousSamples] = useState(samples)
  if (previousSamples !== samples) {
    setPreviousSamples(samples)
    if (
      [...selectedIds].some((id) => !samples.some((sample) => sample.id === id))
    ) {
      setSelectedIds(
        new Set(
          [...selectedIds].filter((id) =>
            samples.some((sample) => sample.id === id)
          )
        )
      )
    }
  }
  const [archiveOpen, setArchiveOpen] = useState(false)
  const sortButtonRef = useRef<HTMLButtonElement>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const [filter, setFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const selectedStage =
    stageOptions.find((option) => option.value === stageFilter) ??
    stageOptions[0]
  const stageFilterId = useId()
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnId>>(
    () => new Set()
  )

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(columnsStorageKey) ?? "null"
      )
      if (!Array.isArray(saved)) return
      const restored = new Set(
        columns
          .filter((column) => saved.includes(column.id))
          .map((column) => column.id)
      )
      if (restored.size < columns.length) setHiddenColumns(restored)
    } catch {
      // Keep all columns visible if the saved preference cannot be read.
    }
  }, [])

  function changeColumnVisibility(id: ColumnId, visible: boolean) {
    const next = new Set(hiddenColumns)
    if (visible) next.delete(id)
    else next.add(id)
    if (next.size === columns.length) return
    setHiddenColumns(next)
    try {
      localStorage.setItem(columnsStorageKey, JSON.stringify([...next]))
    } catch {
      // Column customization still works when browser storage is unavailable.
    }
  }

  const visibleColumns = columns.filter(
    (column) => !hiddenColumns.has(column.id)
  )
  const stageSamples = samples.filter(
    (sample) =>
      (!showStageFilter ||
        stageFilter === "all" ||
        sample.stage === stageFilter) &&
      (!search ||
        [
          sample.id,
          sources.find((source) => source.id === sample.registration.sourceId)
            ?.name ?? "Unknown source",
          sampleStageLabel(sample.stage),
          sampleStatusLabels[sample.status],
        ].some((value) => value.toLowerCase().includes(search)))
  )
  const filteredSamples = stageSamples.filter(
    (sample) => filter === "all" || sample.status === filter
  )
  const selectedSamples = filteredSamples.filter((sample) =>
    selectedIds.has(sample.id)
  )
  const [pageSize, setPageSize] = useState(10)
  const pageSizeId = useId()
  const [page, setPage] = useState(0)
  const [previousSearch, setPreviousSearch] = useState(search)
  if (previousSearch !== search) {
    setPreviousSearch(search)
    setPage(0)
  }

  useEffect(() => {
    if (!showRowsPerPage) return
    try {
      const savedSize = Number(localStorage.getItem(pageSizeStorageKey))
      if (pageSizeOptions.includes(savedSize)) setPageSize(savedSize)
    } catch {
      // Use the default if browser storage is unavailable.
    }
  }, [showRowsPerPage])

  const pageCount = Math.max(1, Math.ceil(filteredSamples.length / pageSize))
  if (page >= pageCount) setPage(pageCount - 1)
  const currentPage = Math.min(page, pageCount - 1)
  const rows = filteredSamples.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  const allPageSelected =
    rows.length > 0 && rows.every((sample) => selectedIds.has(sample.id))
  const somePageSelected = rows.some((sample) => selectedIds.has(sample.id))

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setSort(null)
    setSamples((current) => {
      const from = rows.findIndex((sample) => sample.id === active.id)
      const to = rows.findIndex((sample) => sample.id === over.id)
      if (from < 0 || to < 0) return current
      const reordered = arrayMove(rows, from, to)
      const visibleIds = new Set(rows.map((sample) => sample.id))
      let index = 0
      return current.map((sample) =>
        visibleIds.has(sample.id) ? reordered[index++] : sample
      )
    })
  }

  return (
    <section
      aria-labelledby={showHeading ? "latest-samples-heading" : undefined}
      aria-label={showHeading ? undefined : "Samples"}
      className="flex min-w-0 flex-col gap-4"
    >
      {showHeading && (
        <div className="flex flex-col gap-1">
          <h2 id="latest-samples-heading" className="text-base font-medium">
            Latest samples
          </h2>
          <p className="text-sm text-muted-foreground">
            Track recent samples, their current stage, and status.
          </p>
        </div>
      )}
      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(String(value))
          setPage(0)
        }}
        className="gap-4"
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
            <div className="max-w-full min-w-0 overflow-x-auto">
              <TabsList aria-label="Filter samples by status">
                {statusFilters.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                    <Badge variant="secondary" className="rounded-full">
                      {item.value === "all"
                        ? stageSamples.length
                        : stageSamples.filter(
                            (sample) => sample.status === item.value
                          ).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {showStageFilter && (
              <div className="flex items-center gap-2">
                <Label htmlFor={stageFilterId} className="sr-only">
                  Stage
                </Label>
                <Select
                  value={stageFilter}
                  items={stageOptions}
                  onValueChange={(value) => {
                    if (!value) return
                    setStageFilter(value)
                    setPage(0)
                  }}
                >
                  <SelectTrigger
                    id={stageFilterId}
                    aria-label={`Filter by stage: ${selectedStage.label}`}
                    title={`Filter by stage: ${selectedStage.label}`}
                    className="relative size-9 justify-center p-0 [&>svg]:hidden"
                  >
                    <span className="flex items-center justify-center">
                      <ListFilterIcon aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-background ${selectedStage.dotClass}`}
                    />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    className="w-64 max-w-[calc(100vw-2rem)]"
                  >
                    <SelectGroup>
                      {stageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span
                            aria-hidden="true"
                            className={`my-auto size-2 shrink-0 rounded-full ${option.dotClass}`}
                          />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Sort samples: ${sortOptions.find((option) => option.value === sort)?.label ?? "custom order"}`}
                        ref={sortButtonRef}
                        title="Sort samples"
                      />
                    }
                  >
                    <ArrowUpDownIcon aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuRadioGroup
                      value={sort ?? ""}
                      onValueChange={(value) => {
                        const option = sortOptions.find(
                          (item) => item.value === value
                        )
                        if (!option) return
                        setSort(option.value)
                        setSamples((current) =>
                          [...current].sort((a, b) => {
                            const comparison = option.value.startsWith("date")
                              ? Date.parse(a.createdAt) -
                                Date.parse(b.createdAt)
                              : a.id.localeCompare(b.id, "en", {
                                  numeric: true,
                                })
                            return option.value.endsWith("asc")
                              ? comparison
                              : -comparison
                          })
                        )
                        setPage(0)
                      }}
                    >
                      {sortOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {selectedSamples.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Actions for ${selectedSamples.length} selected samples`}
                          title="Selected sample actions"
                        />
                      }
                    >
                      <EllipsisIcon aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                          <ArchiveIcon aria-hidden="true" />
                          Archive all
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <Columns3Icon aria-hidden="true" /> Columns{" "}
              <ChevronDownIcon aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={!hiddenColumns.has(column.id)}
                    disabled={
                      visibleColumns.length === 1 &&
                      !hiddenColumns.has(column.id)
                    }
                    closeOnClick={false}
                    onCheckedChange={(checked) =>
                      changeColumnVisibility(column.id, checked)
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsContent value={filter} className="flex min-w-0 flex-col gap-4">
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <div className="min-w-0 overflow-hidden rounded-xl border">
              <Table
                className={
                  visibleColumns.length > 4 ? "min-w-[850px]" : "min-w-[500px]"
                }
              >
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead scope="col" className="w-10">
                      <span className="sr-only">Reorder</span>
                    </TableHead>
                    <TableHead scope="col" className="w-10">
                      <Checkbox
                        aria-label="Select all samples on this page"
                        checked={allPageSelected}
                        indeterminate={somePageSelected && !allPageSelected}
                        onCheckedChange={(checked) =>
                          setSelectedIds((current) => {
                            const next = new Set(current)
                            rows.forEach((sample) => {
                              if (checked) next.add(sample.id)
                              else next.delete(sample.id)
                            })
                            return next
                          })
                        }
                      />
                    </TableHead>
                    {visibleColumns.map((column) => (
                      <TableHead key={column.id} scope="col">
                        {column.hideHeader ? (
                          <span className="sr-only">{column.label}</span>
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumns.length + 2}
                        className="h-24 text-center"
                      >
                        No samples match your search or filters.
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setFilter("all")
                            setStageFilter("all")
                            if (enableSearch) setQuery("")
                            setPage(0)
                          }}
                        >
                          Clear filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                  <SortableContext
                    items={rows.map((sample) => sample.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rows.map((sample) => {
                      return (
                        <SortableSampleRow
                          key={sample.id}
                          sample={sample}
                          hiddenColumns={hiddenColumns}
                          selected={selectedIds.has(sample.id)}
                          onSelect={(checked) =>
                            setSelectedIds((current) => {
                              const next = new Set(current)
                              if (checked) next.add(sample.id)
                              else next.delete(sample.id)
                              return next
                            })
                          }
                        />
                      )
                    })}
                  </SortableContext>
                </TableBody>
              </Table>
            </div>
          </DndContext>
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {
                filteredSamples.filter((sample) => selectedIds.has(sample.id))
                  .length
              }{" "}
              of {filteredSamples.length} row(s) selected.
            </p>
            <nav
              aria-label="Sample table pagination"
              className="flex flex-wrap items-center gap-4 lg:gap-8"
            >
              {showRowsPerPage && (
                <div className="flex items-center gap-2">
                  <Label htmlFor={pageSizeId} className="whitespace-nowrap">
                    Rows per page
                  </Label>
                  <Select
                    value={String(pageSize)}
                    items={pageSizeOptions.map((size) => ({
                      label: String(size),
                      value: String(size),
                    }))}
                    onValueChange={(value) => {
                      if (!value) return
                      const nextSize = Number(value)
                      if (!pageSizeOptions.includes(nextSize)) return
                      setPageSize(nextSize)
                      setPage(0)
                      try {
                        localStorage.setItem(
                          pageSizeStorageKey,
                          String(nextSize)
                        )
                      } catch {
                        // Keep the selector usable if browser storage is unavailable.
                      }
                    }}
                  >
                    <SelectTrigger id={pageSizeId} size="sm" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top" alignItemWithTrigger={false}>
                      <SelectGroup>
                        {pageSizeOptions.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <span
                className="text-sm font-medium whitespace-nowrap"
                aria-live="polite"
              >
                Page {page + 1} of {pageCount}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to first page"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                >
                  <ChevronsLeftIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to previous page"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to next page"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to last page"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage(pageCount - 1)}
                >
                  <ChevronsRightIcon aria-hidden="true" />
                </Button>
              </div>
            </nav>
          </div>
          {showDescription && (
            <p className="px-2 text-xs text-muted-foreground italic">
              Track registered samples, their sources, and their progress
              through each stage of the quality testing workflow.
            </p>
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent finalFocus={sortButtonRef}>
          <DialogHeader>
            <DialogTitle>
              Archive {selectedSamples.length} selected samples?
            </DialogTitle>
            <DialogDescription>
              The selected samples matching your current filters will be removed
              from this table for this demo session. Their history stays in the
              overview trends. They will return when you reload.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={selectedSamples.length === 0}
              onClick={() => {
                const archivedIds = new Set(
                  selectedSamples.map((sample) => sample.id)
                )
                archiveSamples([...archivedIds])
                setSelectedIds(
                  (current) =>
                    new Set([...current].filter((id) => !archivedIds.has(id)))
                )
                setPage(0)
                setArchiveOpen(false)
                toast.success(
                  `${archivedIds.size} samples archived in this demo. Changes reset on refresh.`
                )
              }}
            >
              Archive all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
