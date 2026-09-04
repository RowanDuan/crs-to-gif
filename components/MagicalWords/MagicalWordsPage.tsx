"use client"

import * as React from "react"
import { toast } from "sonner"

function formatWordKeepEnds(word: string): string {
  if (word.length < 2) return word
  if (word.length === 2) return word[0] + "x"
  return word[0] + "x".repeat(word.length - 2) + word[word.length - 1]
}

function formatWordKeepFirst(word: string): string {
  let seenFirstLetter = false
  return [...word]
    .map((ch) => {
      if (/[^A-Za-z]/.test(ch)) return ch
      if (/[A-Z]/.test(ch) || !seenFirstLetter) {
        seenFirstLetter = true
        return ch
      }
      return "x"
    })
    .join("")
}

function formatText(
  text: string,
  formatWord: (word: string) => string
): string {
  return text
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : formatWord(part)))
    .join("")
}

function MagicalSection({
  title,
  inputId,
  outputId,
  formatWord,
  placeholderIn,
  placeholderOut,
}: {
  title: string
  inputId: string
  outputId: string
  formatWord: (word: string) => string
  placeholderIn: string
  placeholderOut: string
}) {
  const [input, setInput] = React.useState("")
  const formatted = formatText(input, formatWord)

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
    <div className="w-full max-w-lg rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/60">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div>
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-bold text-gray-800"
          ></label>
          <input
            id={inputId}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderIn}
            className="h-14 w-full rounded-full border border-transparent bg-gray-50 px-6 text-base text-gray-800 transition outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label
            htmlFor={outputId}
            className="mb-2 block text-sm font-bold text-gray-800"
          ></label>
          <div className="flex h-14 items-center rounded-full border border-transparent bg-gray-50/60 px-6 transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-200">
            <input
              id={outputId}
              type="text"
              readOnly
              value={formatted}
              placeholder={placeholderOut}
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
  )
}

export default function MagicalWordsPage() {
  return (
    <div className="flex min-h-screen items-start justify-center to-white p-6 pt-50">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <MagicalSection
          title="Magical Words"
          inputId="magical-words-input-a"
          outputId="magical-words-input-b"
          formatWord={formatWordKeepEnds}
          placeholderIn="Abcdefg"
          placeholderOut="Axxxxxg"
        />
        <MagicalSection
          title="Magical X"
          inputId="magical-x-input-a"
          outputId="magical-x-input-b"
          formatWord={formatWordKeepFirst}
          placeholderIn={`Keep Alive`}
          placeholderOut={`Kxxx Axxxx`}
        />
      </div>
    </div>
  )
}
