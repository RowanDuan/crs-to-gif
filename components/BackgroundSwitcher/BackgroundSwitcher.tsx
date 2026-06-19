"use client"

import { useEffect, useState } from "react"
import { BgColorsOutlined, ColumnWidthOutlined } from "@ant-design/icons"

import FluidGradientBackground from "@/components/FluidGradientBackground/FluidGradientBackground"
import { VIDEO_BG_SRC } from "@/components/VideoRasterBackground/constants"
import VideoRasterBackground from "@/components/VideoRasterBackground/VideoRasterBackground"

import "./BackgroundSwitcher.css"

type BackgroundMode = "raster" | "fluid"

export default function BackgroundSwitcher() {
  const [mode, setMode] = useState<BackgroundMode>("fluid")

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "video"
    link.href = VIDEO_BG_SRC
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const toggleMode = () => {
    setMode((current) => (current === "raster" ? "fluid" : "raster"))
  }

  const isRaster = mode === "raster"

  return (
    <>
      <div className="bg-switcher__layers">
        <div
          className={`bg-switcher__layer ${isRaster ? "bg-switcher__layer--active" : ""}`}
        >
          <VideoRasterBackground active={isRaster} />
        </div>
        <div
          className={`bg-switcher__layer ${!isRaster ? "bg-switcher__layer--active" : ""}`}
        >
          <FluidGradientBackground />
        </div>
      </div>

      <button
        type="button"
        className="liquid-glass-btn liquid-glass-btn--icon bg-switcher__toggle"
        aria-label={isRaster ? "切换到流体渐变背景" : "切换到竖条视频背景"}
        title={isRaster ? "切换到流体渐变背景" : "切换到竖条视频背景"}
        onClick={toggleMode}
      >
        <span className="liquid-glass-btn__content">
          {isRaster ? (
            <BgColorsOutlined className="liquid-glass-btn__icon" />
          ) : (
            <ColumnWidthOutlined className="liquid-glass-btn__icon" />
          )}
        </span>
      </button>
    </>
  )
}
