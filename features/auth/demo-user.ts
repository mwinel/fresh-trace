export const demoUser = {
  name: "Nelson Murungi",
  email: "nelsonmurungi5@gmail.com",
  avatar: "https://images.pexels.com/photos/9164725/pexels-photo-9164725.jpeg",
}

export type DemoUser = typeof demoUser

const demoUsers: DemoUser[] = [
  demoUser,
  { name: "Admin", email: "admin@example.com", avatar: "" },
]

// Client-side demo credentials only; this is not production authentication.
export function authenticateDemoUser(
  email: string,
  password: string
): DemoUser | null {
  if (password !== "admin123") return null
  return (
    demoUsers.find((user) => user.email === email.trim().toLowerCase()) ?? null
  )
}

export const demoSessionKey = "fresh-trace.session"

export function readDemoSession(): DemoUser | null {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(demoSessionKey) ?? "null"
    )
    return stored !== null && typeof stored === "object" && "email" in stored
      ? (demoUsers.find((user) => user.email === stored.email) ?? null)
      : null
  } catch {
    return null
  }
}
