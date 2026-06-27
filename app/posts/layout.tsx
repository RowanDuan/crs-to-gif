"use client"
import { useState } from "react"

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [likes, setLikes] = useState(0)
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <aside>
        <button onClick={() => setLikes((n) => n + 1)}>点赞 {likes}</button>
        <p>切换文章时，这里的计数会保留（布局状态）。</p>
      </aside>
      <main>{children}</main>
    </div>
  )
}
