"use client"

import { useEffect, useRef, useState } from "react"

import { VIDEO_BG_SRC } from "./constants"
import "./VideoRasterBackground.css"

const STRIP_WIDTH = 36

const STRIP_STYLE = {
  width: `${STRIP_WIDTH}px`,
  opacity: 1,
  backdropFilter: "blur(45px)",
  WebkitBackdropFilter: "blur(45px)",
  background:
    "linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.08) 100%)",
} as const

export default function VideoRasterBackground({ active = true }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stripCount, setStripCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const updateStripCount = () => {
      setStripCount(Math.ceil(window.innerWidth / STRIP_WIDTH) + 1)
    }

    updateStripCount()
    window.addEventListener("resize", updateStripCount)
    return () => window.removeEventListener("resize", updateStripCount)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.preload = "auto"

    const ensurePlaying = () => {
      void video.play().catch(() => {})
    }

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      ensurePlaying()
    } else {
      video.addEventListener("canplaythrough", ensurePlaying, { once: true })
      video.load()
    }

    return () => {
      video.removeEventListener("canplaythrough", ensurePlaying)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !active) return

    void video.play().catch(() => {})
  }, [active])

  return (
    <div className="video-raster-bg pointer-events-none absolute inset-0" aria-hidden>
      <video
        ref={videoRef}
        className="video-raster-bg__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={VIDEO_BG_SRC} type="video/mp4" />
      </video>

      <div className="video-raster-bg__raster">
        {mounted &&
          Array.from({ length: stripCount }, (_, index) => (
            <div
              key={index}
              className="video-raster-bg__strip"
              style={STRIP_STYLE}
            />
          ))}
      </div>
    </div>
  )
}
