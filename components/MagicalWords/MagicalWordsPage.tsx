"use client"

import * as React from "react"
import { toast } from "sonner"

function formatWord(word: string): string {
  if (word.length < 2) return word
  if (word.length === 2) return word[0] + "x"
  return word[0] + "x".repeat(word.length - 2) + word[word.length - 1]
}

function formatText(text: string): string {
  return text
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : formatWord(part)))
    .join("")
}

export default function MagicalWordsPage() {
  const [input, setInput] = React.useState("")
  const formatted = formatText(input)

  const handleCopy = async () => {
    if (!formatted) {
      toast.error("暂无内容可复制")
      return
    }
    try {
      await navigator.clipboard.writeText(formatted)
      toast.success("复制成功")
    } catch {
      toast.error("复制失败")
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center to-white p-6 pt-50">
      <div className="w-full max-w-lg rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/60">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Magical Words</h2>
          <div>
            <label
              htmlFor="magical-words-input-a"
              className="mb-2 block text-sm font-bold text-gray-800"
            ></label>
            <input
              id="magical-words-input-a"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Abcdefg"
              className="h-14 w-full rounded-full border border-transparent bg-gray-50 px-6 text-base text-gray-800 transition outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label
              htmlFor="magical-words-input-b"
              className="mb-2 block text-sm font-bold text-gray-800"
            ></label>
            <div className="flex h-14 items-center rounded-full border border-transparent bg-gray-50/60 px-6 transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200">
              <input
                id="magical-words-input-b"
                type="text"
                readOnly
                value={formatted}
                placeholder="Axxxxxg"
                className="min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="ml-3 shrink-0 cursor-pointer text-sm font-medium text-gray-700 transition hover:text-blue-600"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
