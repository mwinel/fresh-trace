export const demoUser = {
  name: "Nelson Murungi",
  email: "nelsonmurungi5@gmail.com",
  avatar: "https://images.pexels.com/photos/9164725/pexels-photo-9164725.jpeg",
}

export type DemoUser = typeof demoUser

// Client-side demo credentials only; this is not production authentication.
export function matchesDemoCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === demoUser.email && password === "admin123"
  )
}

export const demoSessionKey = "fresh-trace.session"

export function readDemoSession(): DemoUser | null {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(demoSessionKey) ?? "null"
    )
    return stored !== null &&
      typeof stored === "object" &&
      "email" in stored &&
      stored.email === demoUser.email
      ? demoUser
      : null
  } catch {
    return null
  }
}
