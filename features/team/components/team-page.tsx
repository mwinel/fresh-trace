"use client"

import { useState } from "react"
import { EllipsisVerticalIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import {
  formatTeamActivity,
  teamRoles,
  type TeamMember,
  type TeamRole,
} from "../data"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function TeamSelect({
  label,
  value,
  options,
  onChange,
  className = "w-full sm:w-40",
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next)
      }}
    >
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function TeamPageContent({
  initialMembers,
}: {
  initialMembers: TeamMember[]
}) {
  const [members, setMembers] = useState(initialMembers)
  const [tab, setTab] = useState("members")
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("Role")
  const [status, setStatus] = useState("Status")
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<TeamMember | "invite" | null>(null)
  const [resent, setResent] = useState<string[]>([])
  const visible = members.filter(
    (member) =>
      (tab !== "invitations" || member.status === "invited") &&
      (role === "Role" || member.role === role) &&
      (status === "Status" || member.status === status.toLowerCase()) &&
      `${member.name} ${member.email}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  )
  const selectedCount = visible.filter((member) =>
    selected.includes(member.id)
  ).length

  function resend(member: TeamMember) {
    setResent((current) => [...current, member.id])
    toast.info(
      `Demo invitation renewed for ${member.name}. No email was sent; this resets on refresh.`
    )
  }

  return (
    <section
      aria-label="Team management"
      className="team-page flex min-w-0 flex-1 flex-col gap-5 px-4 py-6 lg:px-6"
    >
      <form
        id="team-invite-launch"
        hidden
        onSubmit={(event) => {
          event.preventDefault()
          setEditing("invite")
        }}
      />
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(String(value))
          setQuery("")
          setRole("Role")
          setStatus("Status")
        }}
      >
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles &amp; permissions</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        {(["members", "invitations"] as const).map((panel) => (
          <TabsContent key={panel} value={panel}>
            <div className="mt-1 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <InputGroup className="w-full sm:w-80">
                  <InputGroupAddon>
                    <SearchIcon aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="search"
                    aria-label="Search name or email"
                    placeholder="Search name or email"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </InputGroup>
                <TeamSelect
                  label="Filter by role"
                  value={role}
                  options={["Role", ...teamRoles]}
                  onChange={setRole}
                />
                <TeamSelect
                  label="Filter by status"
                  value={status}
                  options={
                    panel === "invitations"
                      ? ["Status", "Invited"]
                      : ["Status", "Active", "Inactive", "Invited"]
                  }
                  onChange={setStatus}
                />
              </div>
              <div className="min-w-0 overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 px-6">
                        <Checkbox
                          aria-label="Select all visible members"
                          checked={
                            visible.length > 0 &&
                            selectedCount === visible.length
                          }
                          indeterminate={
                            selectedCount > 0 && selectedCount < visible.length
                          }
                          disabled={visible.length === 0}
                          onCheckedChange={(checked) =>
                            setSelected((current) =>
                              checked
                                ? [
                                    ...new Set([
                                      ...current,
                                      ...visible.map((member) => member.id),
                                    ]),
                                  ]
                                : current.filter(
                                    (id) =>
                                      !visible.some(
                                        (member) => member.id === id
                                      )
                                  )
                            )
                          }
                        />
                      </TableHead>
                      <TableHead className="w-[28%]">Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last active</TableHead>
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((member) => (
                      <TableRow
                        key={member.id}
                        data-state={
                          selected.includes(member.id) ? "selected" : undefined
                        }
                      >
                        <TableCell className="px-6">
                          <Checkbox
                            aria-label={`Select ${member.name}`}
                            checked={selected.includes(member.id)}
                            onCheckedChange={(checked) =>
                              setSelected((current) =>
                                checked
                                  ? [...current, member.id]
                                  : current.filter((id) => id !== member.id)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.name
                                  .trim()
                                  .split(/\s+/)
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{member.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              member.status === "active"
                                ? "team-active"
                                : undefined
                            }
                          >
                            <span
                              aria-hidden="true"
                              className="size-1.5 rounded-full bg-current"
                            />
                            {member.status === "active"
                              ? "Active"
                              : member.status === "inactive"
                                ? "Inactive"
                                : "Invited"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatTeamActivity(member.lastActive)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Actions for ${member.name}`}
                                />
                              }
                            >
                              <EllipsisVerticalIcon aria-hidden="true" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() => setEditing(member)}
                                >
                                  Manage member
                                </DropdownMenuItem>
                                {member.status === "invited" && (
                                  <DropdownMenuItem
                                    disabled={resent.includes(member.id)}
                                    onClick={() => resend(member)}
                                  >
                                    {resent.includes(member.id)
                                      ? "Invite renewed"
                                      : "Resend invite"}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!visible.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <p>
                            No{" "}
                            {panel === "invitations"
                              ? "invitations"
                              : "members"}{" "}
                            match your filters.
                          </p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setQuery("")
                              setRole("Role")
                              setStatus("Status")
                            }}
                          >
                            Clear filters
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        ))}
        <TabsContent value="roles">
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Role assignments in this demo. Access permissions have not been
            configured.
          </p>
          <div className="min-w-0 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6">Role</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="pr-6">Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamRoles.map((item) => (
                  <TableRow key={item}>
                    <TableCell className="px-6">{item}</TableCell>
                    <TableCell>
                      {members.filter((member) => member.role === item).length}
                    </TableCell>
                    <TableCell className="pr-6">Not configured</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          {editing !== null && (
            <MemberForm
              key={typeof editing === "string" ? editing : editing.id}
              member={editing === "invite" ? null : editing}
              members={members}
              onCancel={() => setEditing(null)}
              onSave={(member) => {
                setMembers((current) =>
                  editing === "invite"
                    ? [...current, member]
                    : current.map((item) =>
                        item.id === member.id ? member : item
                      )
                )
                toast.success(
                  editing === "invite"
                    ? "Member added for this session. No email was sent; changes reset on refresh."
                    : "Member updated for this session."
                )
                setEditing(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function MemberForm({
  member,
  members,
  onSave,
  onCancel,
}: {
  member: TeamMember | null
  members: TeamMember[]
  onSave: (member: TeamMember) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(member?.name ?? "")
  const [email, setEmail] = useState(member?.email ?? "")
  const [role, setRole] = useState<TeamRole>(member?.role ?? "Lab analyst")
  const [status, setStatus] = useState<TeamMember["status"]>(
    member?.status ?? "active"
  )
  const [error, setError] = useState("")
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) {
          setError("Enter a name.")
          return
        }
        if (
          members.some(
            (item) =>
              item.id !== member?.id &&
              item.email.toLowerCase() === email.trim().toLowerCase()
          )
        ) {
          setError("A member with this email already exists.")
          return
        }
        onSave({
          id: member?.id ?? crypto.randomUUID(),
          name: name.trim(),
          email: email.trim(),
          role,
          status,
          lastActive: member?.lastActive ?? null,
        })
      }}
    >
      <DialogHeader>
        <DialogTitle>{member ? "Manage member" : "Invite member"}</DialogTitle>
        <DialogDescription>
          {member
            ? "Update this member’s name, email address, role, and status."
            : "Enter the new member’s name, email address, role, and status."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="member-name">Name</FieldLabel>
          <Input
            id="member-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError("")
            }}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="member-email">Email</FieldLabel>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError("")
            }}
            required
            aria-invalid={!!error}
            aria-describedby={error ? "member-error" : undefined}
          />
        </Field>
        <FieldGroup className="grid gap-2 sm:grid-cols-2">
          <Field>
            <FieldLabel>Role</FieldLabel>
            <TeamSelect
              label="Member role"
              className="w-full"
              value={role}
              options={teamRoles}
              onChange={(value) => {
                const match = teamRoles.find((item) => item === value)
                if (match) setRole(match)
              }}
            />
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <TeamSelect
              label="Member status"
              className="w-full"
              value={
                status === "active"
                  ? "Active"
                  : status === "inactive"
                    ? "Inactive"
                    : "Invited"
              }
              options={
                member?.status === "invited"
                  ? ["Active", "Inactive", "Invited"]
                  : ["Active", "Inactive"]
              }
              onChange={(value) => {
                if (value === "Active") setStatus("active")
                else if (value === "Inactive") setStatus("inactive")
                else if (value === "Invited") setStatus("invited")
              }}
            />
          </Field>
        </FieldGroup>
      </FieldGroup>
      {error && (
        <p id="member-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {member ? "Save changes" : "Add invitation"}
        </Button>
      </DialogFooter>
    </form>
  )
}
