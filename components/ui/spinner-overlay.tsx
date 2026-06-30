import * as React from "react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

function SpinnerOverlay({
  loading = false,
  tip,
  className,
  overlayClassName,
  children,
}: {
  loading?: boolean
  tip?: React.ReactNode
  className?: string
  overlayClassName?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("relative", className)}
      aria-busy={loading}
      data-loading={loading || undefined}
    >
      <div
        className={cn(
          loading &&
            "pointer-events-none opacity-50 transition-opacity select-none"
        )}
      >
        {children}
      </div>
      {loading && (
        <div
          className={cn(
            "bg-background/60 absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit]",
            overlayClassName
          )}
        >
          <Spinner className="text-primary size-6" />
          {tip && <span className="text-muted-foreground text-sm">{tip}</span>}
        </div>
      )}
    </div>
  )
}

export { SpinnerOverlay }
