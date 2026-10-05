"use client"

import { useState, useRef, useId, type ReactNode } from "react"
import Link from "next/link"
import {
  ArchiveIcon,
  GripVerticalIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  EllipsisVerticalIcon,
} from "lucide-react"
import { useSamples } from "@/features/samples/components/sample-provider"
import { useSampleSearch } from "@/features/samples/components/sample-search-provider"
import { productOptions } from "@/features/samples/products"
import type { Sample, ReportReviewStatus } from "@/features/samples/types"
import { hasLabReport, reportHref } from "@/features/samples/report-list"
import { reportStatusLabels } from "@/features/samples/report-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

function SortableReportRow({
  sample,
  selected,
  onSelect,
  children,
}: {
  sample: Sample
  selected: boolean
  onSelect: (checked: boolean) => void
  children: ReactNode
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
          aria-label={`Reorder report ${sample.laboratory.reportNumber}`}
        >
          <GripVerticalIcon aria-hidden="true" />
        </Button>
      </TableCell>
      <TableCell className="w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select report ${sample.laboratory.reportNumber}`}
        />
      </TableCell>
      {children}
    </TableRow>
  )
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Kampala",
})
const filters = [
  { value: "all", label: "All reports" },
  ...Object.entries(reportStatusLabels).map(([value, label]) => ({
    value,
    label,
  })),
]
const products = [
  { value: "all", label: "All products" },
  ...productOptions.map(({ value, chartLabel }) => ({
    value,
    label: chartLabel,
  })),
]
const sorts = [
  { value: "date-desc", label: "Issue date: Newest first" },
  { value: "date-asc", label: "Issue date: Oldest first" },
  { value: "number-asc", label: "Report No: Asc" },
  { value: "number-desc", label: "Report No: Desc" },
]
const statusIcons = {
  "awaiting-review": {
    Icon: ClockIcon,
    className: "text-status-awaiting-review",
  },
  approved: { Icon: CircleCheckIcon, className: "text-success" },
  rejected: { Icon: CircleXIcon, className: "text-destructive" },
}
function ReviewBadge({ status }: { status: ReportReviewStatus }) {
  const { Icon, className } = statusIcons[status]
  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      <Icon aria-hidden="true" className={className} />
      {reportStatusLabels[status]}
    </Badge>
  )
}

export function ReportsTable() {
  const { samples, sources, archivedReportIds, archiveReports } = useSamples()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [archiveIds, setArchiveIds] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>([])
  const sortRef = useRef<HTMLButtonElement>(null)
  const dndId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const { reportQuery, setReportQuery } = useSampleSearch()
  const [status, setStatus] = useState("all")
  const [product, setProduct] = useState("all")
  const [sort, setSort] = useState("date-desc")
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [previousQuery, setPreviousQuery] = useState(reportQuery)
  if (previousQuery !== reportQuery) {
    setPreviousQuery(reportQuery)
    setPage(0)
  }
  const reports = samples.filter(
    (sample) => hasLabReport(sample) && !archivedReportIds.has(sample.id)
  )
  const sourceName = (sample: Sample) =>
    sources.find((source) => source.id === sample.registration.sourceId)
      ?.name ?? "Unknown source"
  const productName = (sample: Sample) =>
    productOptions.find(
      (option) => option.value === sample.registration.productType
    )?.chartLabel ?? "Not selected"
  const search = reportQuery.trim().toLowerCase()
  const matching = reports.filter(
    (sample) =>
      (product === "all" || product === sample.registration.productType) &&
      (!search ||
        [
          sample.laboratory.reportNumber,
          sample.id,
          sourceName(sample),
          productName(sample),
          sample.laboratory.details.client,
          reportStatusLabels[sample.laboratory.review.status],
        ].some((value) => value.toLowerCase().includes(search)))
  )
  const filtered = matching
    .filter(
      (sample) => status === "all" || sample.laboratory.review.status === status
    )
    .sort((a, b) => {
      if (!sort)
        return (
          (order.indexOf(a.id) < 0 ? order.length : order.indexOf(a.id)) -
          (order.indexOf(b.id) < 0 ? order.length : order.indexOf(b.id))
        )
      const comparison = sort.startsWith("date")
        ? a.laboratory.details.reportIssueDate.localeCompare(
            b.laboratory.details.reportIssueDate
          )
        : a.laboratory.reportNumber.localeCompare(
            b.laboratory.reportNumber,
            "en",
            { numeric: true }
          )
      return (
        (sort.endsWith("asc") ? comparison : -comparison) ||
        a.id.localeCompare(b.id)
      )
    })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  if (page !== currentPage) setPage(currentPage)
  const rows = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )
  const selectedReports = filtered.filter((sample) =>
    selectedIds.has(sample.id)
  )
  const pendingReports = reports.filter((sample) =>
    archiveIds.includes(sample.id)
  )
  const allSelected =
    rows.length > 0 && rows.every((sample) => selectedIds.has(sample.id))
  const someSelected = rows.some((sample) => selectedIds.has(sample.id))
  function selectReport(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }
  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = rows.findIndex((sample) => sample.id === active.id)
    const to = rows.findIndex((sample) => sample.id === over.id)
    if (from < 0 || to < 0) return
    const reordered = arrayMove(rows, from, to)
    const pageIds = new Set(rows.map((sample) => sample.id))
    let index = 0
    setOrder(
      filtered
        .map((sample) =>
          pageIds.has(sample.id) ? reordered[index++].id : sample.id
        )
        .concat(
          reports
            .filter((sample) => !filtered.some((row) => row.id === sample.id))
            .map((sample) => sample.id)
        )
    )
    setSort("")
  }
  const columns: {
    id: string
    label: string
    cell: (sample: Sample) => ReactNode
  }[] = [
    {
      id: "number",
      label: "Report No.",
      cell: (sample) => (
        <Link
          className="font-medium underline-offset-4 hover:underline"
          href={reportHref(sample)}
        >
          {sample.laboratory.reportNumber}
        </Link>
      ),
    },
    {
      id: "sample",
      label: "Sample No.",
      cell: (sample) => (
        <Link
          className="underline-offset-4 hover:underline"
          href={`/samples/${sample.id}`}
        >
          {sample.id}
        </Link>
      ),
    },
    { id: "source", label: "Source", cell: sourceName },
    { id: "product", label: "Product", cell: productName },
    {
      id: "date",
      label: "Issue date",
      cell: (sample) =>
        sample.laboratory.details.reportIssueDate ? (
          <time dateTime={sample.laboratory.details.reportIssueDate}>
            {dateFormat.format(
              new Date(
                `${sample.laboratory.details.reportIssueDate}T00:00:00+03:00`
              )
            )}
          </time>
        ) : (
          "Not recorded"
        ),
    },
    {
      id: "status",
      label: "Status",
      cell: (sample) => (
        <ReviewBadge status={sample.laboratory.review.status} />
      ),
    },
  ]
  const visible = columns.filter((column) => !hidden.has(column.id))
  function resetFilters() {
    setReportQuery("")
    setProduct("all")
    setStatus("all")
    setPage(0)
  }
  return (
    <section
      aria-label="Laboratory test reports"
      className="flex min-w-0 flex-col gap-4"
    >
      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(String(value))
          setPage(0)
        }}
        className="gap-4"
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">
            <div className="max-w-full min-w-0 overflow-x-auto">
              <TabsList aria-label="Filter reports by status">
                {filters.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value}>
                    {filter.label}
                    <Badge variant="secondary" className="rounded-full">
                      {filter.value === "all"
                        ? matching.length
                        : matching.filter(
                            (sample) =>
                              sample.laboratory.review.status === filter.value
                          ).length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <Select
              value={product}
              items={products}
              onValueChange={(value) => {
                if (value) {
                  setProduct(value)
                  setPage(0)
                }
              }}
            >
              <SelectTrigger
                aria-label="Filter reports by product"
                className="w-36"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {products.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
                    ref={sortRef}
                    aria-label={`Sort reports: ${sorts.find((option) => option.value === sort)?.label ?? "Custom order"}`}
                  />
                }
              >
                <ArrowUpDownIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => {
                    setSort(value)
                    setPage(0)
                  }}
                >
                  {sorts.map((option) => (
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
            {selectedReports.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Actions for ${selectedReports.length} selected reports`}
                    />
                  }
                >
                  <EllipsisVerticalIcon aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() =>
                        setArchiveIds(
                          selectedReports.map((sample) => sample.id)
                        )
                      }
                    >
                      <ArchiveIcon aria-hidden="true" />
                      Archive all
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <Columns3Icon aria-hidden="true" />
              Columns
              <ChevronDownIcon aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={!hidden.has(column.id)}
                    disabled={visible.length === 1 && !hidden.has(column.id)}
                    closeOnClick={false}
                    onCheckedChange={(checked) =>
                      setHidden((current) => {
                        const next = new Set(current)
                        if (checked) next.delete(column.id)
                        else next.add(column.id)
                        return next
                      })
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsContent value={status} className="flex min-w-0 flex-col gap-4">
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
                  visible.length > 4 ? "min-w-[950px]" : "min-w-[500px]"
                }
              >
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead scope="col" className="w-10">
                      <span className="sr-only">Reorder</span>
                    </TableHead>
                    <TableHead scope="col" className="w-10">
                      <Checkbox
                        aria-label="Select all reports on this page"
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
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
                    {visible.map((column) => (
                      <TableHead scope="col" key={column.id}>
                        {column.label}
                      </TableHead>
                    ))}
                    <TableHead scope="col" className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={rows.map((sample) => sample.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rows.map((sample) => (
                      <SortableReportRow
                        key={sample.id}
                        sample={sample}
                        selected={selectedIds.has(sample.id)}
                        onSelect={(checked) => selectReport(sample.id, checked)}
                      >
                        {visible.map((column) => (
                          <TableCell key={column.id}>
                            {column.cell(sample)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Actions for report ${sample.laboratory.reportNumber}`}
                                />
                              }
                            >
                              <EllipsisVerticalIcon aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  render={<Link href={reportHref(sample)} />}
                                >
                                  View report
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  render={
                                    <Link href={`/samples/${sample.id}`} />
                                  }
                                >
                                  View sample
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setArchiveIds([sample.id])}
                                >
                                  <ArchiveIcon aria-hidden="true" />
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </SortableReportRow>
                    ))}
                  </SortableContext>
                  {!rows.length && (
                    <TableRow>
                      <TableCell
                        colSpan={visible.length + 3}
                        className="h-40 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <p>
                            {reports.length
                              ? "No reports match your filters."
                              : "No laboratory test reports yet."}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reports.length
                              ? "Try another search or clear your filters."
                              : "Reports appear when samples reach the laboratory report stage."}
                          </p>
                          {reports.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetFilters}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DndContext>
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {selectedReports.length} of {filtered.length} row(s) selected.{" "}
              {filtered.length ? currentPage * pageSize + 1 : 0}–
              {Math.min((currentPage + 1) * pageSize, filtered.length)} of{" "}
              {filtered.length} reports
            </p>
            <nav
              aria-label="Report table pagination"
              className="flex flex-wrap items-center gap-4 lg:gap-8"
            >
              <div className="flex items-center gap-2">
                <label
                  htmlFor="report-page-size"
                  className="text-sm font-medium"
                >
                  Rows per page
                </label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    if (value) {
                      setPageSize(Number(value))
                      setPage(0)
                    }
                  }}
                >
                  <SelectTrigger id="report-page-size" className="w-18">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {[10, 20, 30, 40, 50].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm font-medium">
                Page {currentPage + 1} of {pageCount}
              </span>
              <div className="flex items-center gap-2">
                {[
                  {
                    label: "First page",
                    Icon: ChevronsLeftIcon,
                    target: 0,
                    disabled: currentPage === 0,
                  },
                  {
                    label: "Previous page",
                    Icon: ChevronLeftIcon,
                    target: currentPage - 1,
                    disabled: currentPage === 0,
                  },
                  {
                    label: "Next page",
                    Icon: ChevronRightIcon,
                    target: currentPage + 1,
                    disabled: currentPage === pageCount - 1,
                  },
                  {
                    label: "Last page",
                    Icon: ChevronsRightIcon,
                    target: pageCount - 1,
                    disabled: currentPage === pageCount - 1,
                  },
                ].map(({ label, Icon, target, disabled }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="icon-sm"
                    aria-label={label}
                    disabled={disabled}
                    onClick={() => setPage(target)}
                  >
                    <Icon aria-hidden="true" />
                  </Button>
                ))}
              </div>
            </nav>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog
        open={archiveIds.length > 0}
        onOpenChange={(open) => {
          if (!open) setArchiveIds([])
        }}
      >
        <DialogContent finalFocus={sortRef}>
          <DialogHeader>
            <DialogTitle>
              Archive{" "}
              {pendingReports.length === 1
                ? pendingReports[0].laboratory.reportNumber
                : `${pendingReports.length} reports`}
              ?
            </DialogTitle>
            <DialogDescription>
              These reports will be hidden from the Reports table for this demo
              session. Their samples and laboratory data are retained. Changes
              reset on refresh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={!pendingReports.length}
              onClick={() => {
                const ids = pendingReports.map((sample) => sample.id)
                archiveReports(ids)
                setSelectedIds(
                  (current) =>
                    new Set([...current].filter((id) => !ids.includes(id)))
                )
                setArchiveIds([])
                toast.success(
                  `${ids.length === 1 ? "Report" : `${ids.length} reports`} archived for this demo session. Changes reset on refresh.`
                )
              }}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
