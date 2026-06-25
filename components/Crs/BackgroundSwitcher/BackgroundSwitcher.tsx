"use client"

import { useEffect, useState } from "react"
import { BgColorsOutlined, ColumnWidthOutlined } from "@ant-design/icons"
import clsx from "clsx"

import FluidGradientBackground from "@/components/Crs/FluidGradientBackground/FluidGradientBackground"
import "@/components/Crs/LiquidGlassButton/LiquidGlassButton.css"
import { VIDEO_BG_SRC } from "@/components/Crs/VideoRasterBackground/constants"
import VideoRasterBackground from "@/components/Crs/VideoRasterBackground/VideoRasterBackground"

import "./BackgroundSwitcher.css"

type BackgroundMode = "raster" | "fluid"

const MODE_TOGGLE_FADE_MS = 500

function triggerJelly(setJelly: (value: boolean) => void) {
  setJelly(false)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setJelly(true)
    })
  })
}

function createJellyAnimationEndHandler(setJelly: (value: boolean) => void) {
  return (event: React.AnimationEvent<HTMLButtonElement>) => {
    if (event.target !== event.currentTarget) return
    if (!event.animationName.includes("bg-switcher-jelly-bounce")) return
    setJelly(false)
  }
}

type BackgroundSwitcherProps = {
  isWhiteBackground: boolean
  onWhiteBackgroundChange: (value: boolean) => void
}

export default function BackgroundSwitcher({
  isWhiteBackground,
  onWhiteBackgroundChange,
}: BackgroundSwitcherProps) {
  const [mode, setMode] = useState<BackgroundMode>("fluid")
  const [isWhiteToggleJelly, setIsWhiteToggleJelly] = useState(false)
  const [isModeToggleJelly, setIsModeToggleJelly] = useState(false)
  const [modeToggleMounted, setModeToggleMounted] = useState(false)
  const [modeToggleVisible, setModeToggleVisible] = useState(false)

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

  useEffect(() => {
    if (!isWhiteBackground) {
      setModeToggleMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setModeToggleVisible(true)
        })
      })
      return
    }

    setModeToggleVisible(false)
    const timer = window.setTimeout(() => {
      setModeToggleMounted(false)
    }, MODE_TOGGLE_FADE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isWhiteBackground])

  const toggleMode = () => {
    triggerJelly(setIsModeToggleJelly)
    setMode((current) => (current === "raster" ? "fluid" : "raster"))
  }

  const toggleWhiteBackground = () => {
    triggerJelly(setIsWhiteToggleJelly)
    onWhiteBackgroundChange(!isWhiteBackground)
  }

  const isRaster = mode === "raster"

  return (
    <>
      <div className="bg-switcher__layers">
        <div
          className={clsx("bg-switcher__layer", {
            "bg-switcher__layer--active": isRaster,
          })}
        >
          <VideoRasterBackground active={isRaster} />
        </div>
        <div
          className={clsx("bg-switcher__layer", {
            "bg-switcher__layer--active": !isRaster,
          })}
        >
          <FluidGradientBackground />
        </div>
        <div
          className={clsx("bg-switcher__layer", "bg-switcher__layer--white", {
            "bg-switcher__layer--active": isWhiteBackground,
          })}
        />
      </div>

      <div className="bg-switcher__controls">
        <button
          type="button"
          className={clsx("liquid-glass-btn", "bg-switcher__white-toggle", {
            "bg-switcher__white-toggle--rainbow": isWhiteBackground,
            "bg-switcher__jelly": isWhiteToggleJelly,
          })}
          aria-label={isWhiteBackground ? "恢复彩色背景" : "切换到白色背景"}
          title={isWhiteBackground ? "恢复彩色背景" : "切换到白色背景"}
          onClick={toggleWhiteBackground}
          onAnimationEnd={createJellyAnimationEndHandler(setIsWhiteToggleJelly)}
        >
          <span className="liquid-glass-btn__content">
            {isWhiteBackground ? "Rainbow" : "White Moon"}
          </span>
        </button>

        {modeToggleMounted && (
          <button
            type="button"
            className={clsx(
              "liquid-glass-btn",
              "liquid-glass-btn--icon",
              "bg-switcher__toggle",
              {
                "bg-switcher__toggle--visible": modeToggleVisible,
                "bg-switcher__jelly": isModeToggleJelly,
              }
            )}
            aria-label={isRaster ? "切换到流体渐变背景" : "切换到竖条视频背景"}
            title={isRaster ? "切换到流体渐变背景" : "切换到竖条视频背景"}
            onClick={toggleMode}
            onAnimationEnd={createJellyAnimationEndHandler(setIsModeToggleJelly)}
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
