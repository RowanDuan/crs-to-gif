import { applyPalette, GIFEncoder, quantize } from "gifenc"

const MIN_HDR_SIZE = 20

export interface CrsAnimHeader {
  magic: string
  hdrSize: number
  offset: number
  fileSize: number
  width: number
  height: number
  format: number
  frameCount: number
}

export interface CrsAnimInfo {
  magic: string
  width: number
  height: number
  frameCount: number
}

export interface CrsFrame {
  rgba: Uint8ClampedArray
  delayMs: number
}

function rgb565ToRgba(rgb565: number): [number, number, number, number] {
  const r = ((rgb565 >> 11) & 0x1f) << 3
  const g = ((rgb565 >> 5) & 0x3f) << 2
  const b = (rgb565 & 0x1f) << 3
  return [r, g, b, 255]
}

/** 解析 AMK 动画头：<4s2HI4H（与 Python struct 一致） */
export function parseCrsHeader(buffer: ArrayBuffer): CrsAnimHeader {
  const view = new DataView(buffer)
  if (buffer.byteLength < MIN_HDR_SIZE) {
    throw new Error("文件过小，不是有效的 CRS/AMK 动画文件")
  }

  const magicBytes = new Uint8Array(buffer, 0, 4)
  const magic = String.fromCharCode(...magicBytes)

  return {
    magic,
    hdrSize: view.getUint16(4, true),
    offset: view.getUint16(6, true),
    fileSize: view.getUint32(8, true),
    width: view.getUint16(12, true),
    height: view.getUint16(14, true),
    format: view.getUint16(16, true),
    frameCount: view.getUint16(18, true),
  }
}

export function parseCrs(buffer: ArrayBuffer): {
  info: CrsAnimInfo
  frames: CrsFrame[]
} {
  const view = new DataView(buffer)
  const header = parseCrsHeader(buffer)
  const { magic, hdrSize, offset, width, height, frameCount } = header

  if (magic !== "ANIM" && magic !== "AUXI" && magic !== "AMFT") {
    throw new Error(`不支持的 magic 标识: ${magic}`)
  }

  const frameSize = width * height * 2
  const expectedSize = hdrSize + frameCount * 2 + frameCount * frameSize
  if (buffer.byteLength < expectedSize) {
    throw new Error(
      `文件数据不完整（需要 ${expectedSize} 字节，实际 ${buffer.byteLength} 字节）`
    )
  }

  const frames: CrsFrame[] = []
  for (let i = 0; i < frameCount; i++) {
    const delayMs = view.getUint16(hdrSize + i * 2, true)
    const start = offset + frameSize * i
    const rgba = new Uint8ClampedArray(width * height * 4)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const rgb565 = view.getUint16(start + idx * 2, false)
        const [r, g, b, a] = rgb565ToRgba(rgb565)
        const px = idx * 4
        rgba[px] = r
        rgba[px + 1] = g
        rgba[px + 2] = b
        rgba[px + 3] = a
      }
    }

    frames.push({ rgba, delayMs: Math.max(delayMs, 10) })
  }

  return {
    info: { magic, width, height, frameCount },
    frames,
  }
}

export function crsToGifBlob(buffer: ArrayBuffer): Blob {
  const { info, frames } = parseCrs(buffer)
  const gif = GIFEncoder()

  for (const frame of frames) {
    const palette = quantize(frame.rgba, 256)
    const index = applyPalette(frame.rgba, palette)
    gif.writeFrame(index, info.width, info.height, {
      palette,
      delay: Math.max(Math.round(frame.delayMs / 10), 1),
    })
  }

  gif.finish()
  return new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
