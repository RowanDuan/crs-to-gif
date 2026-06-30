import { Mail, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Shadcn Page",
}

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {/* 基础按钮 */}
      <Button>Click me</Button>
      <Button className="bg-blue-500 p-10 text-2xl font-bold text-white hover:bg-blue-600">
        Click me
      </Button>
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
