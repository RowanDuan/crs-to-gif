"use client"

import { useState } from "react"
import clsx from "clsx"

import BackgroundSwitcher from "@/components/Crs/BackgroundSwitcher/BackgroundSwitcher"
import TransformCrs from "@/components/Crs/TransformCrs/TransformCrs"

import "./CrsPage.css"

export default function CrsPage() {
  const [isWhiteBackground, setIsWhiteBackground] = useState(true)

  return (
    <main
      className={clsx("crs-page relative min-h-screen overflow-hidden", {
        "white-moon-mode": isWhiteBackground,
      })}
    >
      <BackgroundSwitcher
        isWhiteBackground={isWhiteBackground}
        onWhiteBackgroundChange={setIsWhiteBackground}
      />

      <div className="relative z-10 flex flex-col items-center px-6 pt-[150px] pb-8">
        <h1 className="breath-glow-title mb-10 text-center text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          <span className="breath-glow-title__glow" aria-hidden>
            Crs to Gif
          </span>
          <span className="breath-glow-title__text">Crs to Gif</span>
        </h1>

        <div className="liquid-glass w-full max-w-5xl p-6 md:p-8">
          <TransformCrs />
        </div>
      </div>
    </main>
  )
}
