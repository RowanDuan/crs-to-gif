import { Button } from "@/components/ui/button"
import { Mail, Trash2 } from "lucide-react"

export const metadata = {
  title: "Shadcn Page",
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      {/* 基础按钮 */}
      <Button>Click me</Button>

      {/* 带图标的按钮 - 使用 variant 属性 */}
      <Button variant="secondary">
        <Mail className="mr-2 h-4 w-4" /> Login with Email
      </Button>

      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
    </main>
  )
}
