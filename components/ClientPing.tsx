"use client"

import { useEffect, useState } from "react"

import { formatTime } from "@/lib/formatTime"

export default function ClientPing() {
  const [on, setOn] = useState(false)
  const [browserTime, setBrowserTime] = useState<string | null>(null)

  useEffect(() => {
    setBrowserTime(formatTime(new Date()))
  }, [])

  return (
    <>
      <p className="mb-2">浏览器时间：{browserTime ?? "加载中..."}</p>
      <button
        type="button"
        className="rounded border px-3 py-2"
        onClick={() => setOn(!on)}
      >
        {on ? "1" : "2"}
      </button>
    </>
  )
}
