"use client"
import { useState } from "react"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [query, setQuery] = useState("")
  return (
    <div className="p-50">
      <aside>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索产品..."
        />
      </aside>
      <main>{children}</main>
    </div>
  )
}
