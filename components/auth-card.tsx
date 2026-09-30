import { Card, CardContent } from "@/components/ui/card"

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="min-h-[420px] overflow-hidden p-0">
      <CardContent className="grid flex-1 items-center p-0 md:grid-cols-2">
        {children}
        <div className="relative hidden self-stretch bg-muted md:block">
          <img
            src="https://images.pexels.com/photos/27594597/pexels-photo-27594597.jpeg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  )
}
