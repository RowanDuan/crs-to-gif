import ClientPing from "@/components/ClientPing"
import { formatTime } from "@/lib/formatTime"

export default async function Compare() {
  // const now = new Date().toISOString()
  const now = formatTime(new Date())

  return (
    <main className="p-8">
      <p className="mb-2">服务器时间：{now}</p>
      <ClientPing />
    </main>
  )
}
