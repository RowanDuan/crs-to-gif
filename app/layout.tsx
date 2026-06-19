import type { ReactNode } from "react"

import "./globals.css"

export const metadata = {
  title: "CRS Project",
  description: "Matrix keyboard CRS to GIF converter",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
