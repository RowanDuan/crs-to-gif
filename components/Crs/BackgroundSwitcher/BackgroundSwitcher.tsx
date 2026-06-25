"use client"

import { useEffect, useState } from "react"
import { BgColorsOutlined, ColumnWidthOutlined } from "@ant-design/icons"

import FluidGradientBackground from "@/components/Crs/FluidGradientBackground/FluidGradientBackground"
import "@/components/Crs/LiquidGlassButton/LiquidGlassButton.css"
import { VIDEO_BG_SRC } from "@/components/Crs/VideoRasterBackground/constants"
import VideoRasterBackground from "@/components/Crs/VideoRasterBackground/VideoRasterBackground"

import "./BackgroundSwitcher.css"

type BackgroundMode = "raster" | "fluid"

type BackgroundSwitcherProps = {
  isWhiteBackground: boolean
  onWhiteBackgroundChange: (value: boolean) => void
}

export default function BackgroundSwitcher({
  isWhiteBackground,
  onWhiteBackgroundChange,
}: BackgroundSwitcherProps) {
  const [mode, setMode] = useState<BackgroundMode>("fluid")
  const [isJellyBouncing, setIsJellyBouncing] = useState(false)

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

  const toggleWhiteBackground = () => {
    setIsJellyBouncing(false)
    requestAnimationFrame(() => {
      setIsJellyBouncing(true)
    })
    onWhiteBackgroundChange(!isWhiteBackground)
  }

  const handleJellyAnimationEnd = (
    event: React.AnimationEvent<HTMLButtonElement>
  ) => {
    if (event.animationName !== "bg-switcher-jelly-bounce") return
    setIsJellyBouncing(false)
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
        <div
          className={`bg-switcher__layer bg-switcher__layer--white ${isWhiteBackground ? "bg-switcher__layer--active" : ""}`}
        />
      </div>

      <div className="bg-switcher__controls">
        <button
          type="button"
          className={`liquid-glass-btn bg-switcher__white-toggle ${isWhiteBackground ? "bg-switcher__white-toggle--rainbow" : ""} ${isJellyBouncing ? "bg-switcher__white-toggle--jelly" : ""}`}
          aria-label={isWhiteBackground ? "恢复彩色背景" : "切换到白色背景"}
          title={isWhiteBackground ? "恢复彩色背景" : "切换到白色背景"}
          onClick={toggleWhiteBackground}
          onAnimationEnd={handleJellyAnimationEnd}
        >
          <span className="liquid-glass-btn__content">
            {isWhiteBackground ? "Rainbow" : "White Moon"}
          </span>
        </button>

        {!isWhiteBackground && (
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
        )}
      </div>
    </>
  )
}
