export const teamRoles = [
  "Lab analyst",
  "QA supervisor",
  "Sample handler",
  "QA manager",
] as const
export type TeamRole = (typeof teamRoles)[number]
export type TeamMember = {
  id: string
  name: string
  email: string
  role: TeamRole
  status: "active" | "inactive" | "invited"
  lastActive: string | null
}

export const teamMembers: TeamMember[] = [
  {
    id: "james",
    name: "James O.",
    email: "james@example.com",
    role: "Lab analyst",
    status: "inactive",
    lastActive: "2026-09-24T14:30:00+03:00",
  },
  {
    id: "ruth",
    name: "Ruth N.",
    email: "ruth@example.com",
    role: "Sample handler",
    status: "inactive",
    lastActive: "2026-09-28T11:15:00+03:00",
  },
  {
    id: "alex",
    name: "Alex K.",
    email: "alex@example.com",
    role: "Lab analyst",
    status: "active",
    lastActive: "2026-10-03T10:35:00+03:00",
  },
  {
    id: "sarah",
    name: "Sarah M.",
    email: "sarah@example.com",
    role: "QA supervisor",
    status: "active",
    lastActive: "2026-10-03T09:50:00+03:00",
  },
  {
    id: "david",
    name: "David N.",
    email: "david@example.com",
    role: "Sample handler",
    status: "active",
    lastActive: "2026-10-03T09:30:00+03:00",
  },
  {
    id: "grace",
    name: "Grace A.",
    email: "grace@example.com",
    role: "QA manager",
    status: "invited",
    lastActive: null,
  },
]

const activityFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Kampala",
})

export function formatTeamActivity(value: string | null) {
  if (!value) return "—"
  const parts = activityFormatter.formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ""
  const day = Number(part("day"))
  const suffix =
    day % 100 >= 11 && day % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th")

  return `${day}${suffix} ${part("month")} ${part("year")}, ${Number(part("hour"))}:${part("minute")} ${part("dayPeriod").toUpperCase()}`
}
