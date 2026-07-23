"use client"

import { memo, useMemo, useState } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PAGE_SIZES = [10, 20, 50, 100] as const

type PaginationBoxProps = {
  total: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

function getVisiblePages(
  page: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages]
  }
  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages]
}

function PaginationBox({
  total,
  page: pageProp,
  pageSize: pageSizeProp,
  onPageChange,
  onPageSizeChange,
}: PaginationBoxProps) {
  const [innerPage, setInnerPage] = useState(1)
  const [innerPageSize, setInnerPageSize] = useState<number>(PAGE_SIZES[0])

  const page = pageProp ?? innerPage
  const pageSize = pageSizeProp ?? innerPageSize
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const setPage = (next: number) => {
    const safe = Math.min(Math.max(1, next), totalPages)
    onPageChange?.(safe)
    if (pageProp === undefined) setInnerPage(safe)
  }

  const setPageSize = (next: number) => {
    onPageSizeChange?.(next)
    if (pageSizeProp === undefined) setInnerPageSize(next)
    // 改每页条数后回到第一页
    onPageChange?.(1)
    if (pageProp === undefined) setInnerPage(1)
  }

  const pages = useMemo(
    () => getVisiblePages(page, totalPages),
    [page, totalPages]
  )

  return (
    <div className="flex items-center justify-end gap-3">
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              className={cn(
                "cursor-pointer",
                page <= 1 && "pointer-events-none opacity-50"
              )}
              onClick={(e) => {
                e.preventDefault()
                setPage(page - 1)
              }}
            />
          </PaginationItem>

          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(item)
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              className={cn(
                "cursor-pointer",
                page >= totalPages && "pointer-events-none opacity-50"
              )}
              onClick={(e) => {
                e.preventDefault()
                setPage(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Select
        value={String(pageSize)}
        onValueChange={(value) => setPageSize(Number(value))}
      >
        <SelectTrigger className="w-[120px] cursor-pointer py-4">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default memo(PaginationBox)
