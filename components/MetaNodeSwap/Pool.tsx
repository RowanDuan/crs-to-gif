import { useState, useMemo, useCallback, memo, useEffect } from "react"
import * as React from "react"

import { RotateCw, XIcon } from "lucide-react"
import { useMiniWallet } from "miniwallet"
import { toast } from "sonner"
import {
  useConfig,
  // useAccount,
  // useConnect,
  // useWatchContractEvent,
  // useBlock,
} from "wagmi"

import PaginationBox from "@/components/PaginationBox"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SpinnerOverlay } from "@/components/ui/spinner-overlay"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FEE_LIST,
  getTokenSymbol,
  MN_TOKEN_LIST,
} from "@/lib/contracts/metaNodeSwap/contractsInfo"
import { getAllPools } from "@/lib/contracts/metaNodeSwap/queries"
import { Address, PoolItem } from "@/lib/contracts/metaNodeSwap/types"

import PoolModal from "./PoolModal"
import PositionModal from "./PositionModal"

function Pool({ toMyPositionsTab }: { toMyPositionsTab: () => void }) {
  const config = useConfig()

  const [pools, setPools] = useState<PoolItem[]>([])
  const [loading, setLoading] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [filter, setFilter] = useState({
    token0: "",
    token1: "",
    fee: "",
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [poolPosition, setPoolPosition] = useState<PoolItem | null>(null)

  const poolList = useMemo(() => {
    const symbol0 = filter.token0
      ? getTokenSymbol(filter.token0 as Address)
      : ""
    const symbol1 = filter.token1
      ? getTokenSymbol(filter.token1 as Address)
      : ""

    return pools
      .filter((pool) => {
        if (symbol0 && symbol1) {
          // C/D 与 D/C 都显示
          const forward =
            pool.token0Symbol === symbol0 && pool.token1Symbol === symbol1
          const reverse =
            pool.token0Symbol === symbol1 && pool.token1Symbol === symbol0
          if (!forward && !reverse) return false
        } else if (symbol0) {
          if (pool.token0Symbol !== symbol0 && pool.token1Symbol !== symbol0) {
            return false
          }
        } else if (symbol1) {
          if (pool.token0Symbol !== symbol1 && pool.token1Symbol !== symbol1) {
            return false
          }
        }
        if (filter.fee) {
          if (pool.fee !== Number(filter.fee)) return false
        }
        return true
      })
      .slice()
      .sort((a, b) => b.index - a.index)
  }, [pools, filter])

  const pagedPoolList = useMemo(() => {
    const start = (page - 1) * pageSize
    return poolList.slice(start, start + pageSize)
  }, [poolList, page, pageSize])

  // 筛选变化时回到第一页
  useEffect(() => {
    setPage(1)
  }, [filter])

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false)
  }, [])

  const closePoolPositionModal = useCallback(() => {
    setPoolPosition(null)
  }, [])

  const fetchAllPools = useCallback(async () => {
    try {
      setLoading(true)
      const list = await getAllPools(config)
      setPools(list)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Load pools failed")
    } finally {
      setLoading(false)
    }
  }, [config])

  const handleAddPosition = useCallback((p: PoolItem) => {
    try {
      setPoolPosition(p)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Add position failed")
    }
  }, [])

  useEffect(() => {
    fetchAllPools()
  }, [fetchAllPools])

  return (
    <div className="mx-auto w-full max-w-[1200px] pt-8">
      <div className="flex items-center justify-between">
        <div className="flex h-9 items-center space-x-2 text-xl">
          <span className="text-2xl font-medium">Pool List</span>
          {loading ? (
            <SpinnerOverlay loading={loading} className="h-8 w-8">
              <div />
            </SpinnerOverlay>
          ) : (
            <Button
              onClick={fetchAllPools}
              variant="outline"
              size="icon"
              className="cursor-pointer"
            >
              <RotateCw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span>Filter:</span>
          <Select
            key={`token0_${filter.token0}`}
            value={filter.token0 || undefined}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, token0: value }))
            }
          >
            <SelectTrigger className="relative w-[160px] cursor-pointer py-4 text-right">
              <SelectValue placeholder="Token0" />
              {filter.token0 && (
                <div
                  className="absolute right-1 z-2 flex h-6 w-6 cursor-pointer items-center justify-center bg-gray-50"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, token0: "" }))
                  }}
                >
                  <XIcon />
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              {MN_TOKEN_LIST.map((token) => (
                <SelectItem key={token.value} value={token.value}>
                  {token.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span> / </span>
          <Select
            key={`token1_${filter.token1}`}
            value={filter.token1 || undefined}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, token1: value }))
            }
          >
            <SelectTrigger className="relative w-[160px] cursor-pointer py-4 text-right">
              <SelectValue placeholder="Token1" />
              {filter.token1 && (
                <div
                  className="absolute right-1 z-2 flex h-6 w-6 cursor-pointer items-center justify-center bg-gray-50"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, token1: "" }))
                  }}
                >
                  <XIcon />
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              {MN_TOKEN_LIST.map((token) => (
                <SelectItem key={token.value} value={token.value}>
                  {token.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="pl-3"></div>
          <Select
            key={filter.fee || "filter-fee-empty"}
            value={filter.fee || undefined}
            onValueChange={(value) =>
              setFilter((prev) => ({ ...prev, fee: value }))
            }
          >
            <SelectTrigger className="relative w-[120px] cursor-pointer py-4 text-right">
              <SelectValue placeholder="Fee" />
              {filter.fee && (
                <div
                  className="absolute right-1 z-2 flex h-6 w-6 cursor-pointer items-center justify-center bg-gray-50"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, fee: "" }))
                  }}
                >
                  <XIcon />
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              {FEE_LIST.map((token) => (
                <SelectItem key={token.value} value={token.value}>
                  {token.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            className="cursor-pointer p-5"
            variant="outline"
            onClick={toMyPositionsTab}
          >
            My Positions
          </Button>
          <Button
            className="!bg-blue-500 p-5"
            onClick={() => {
              setAddModalOpen(true)
            }}
          >
            + Add Pool
          </Button>
        </div>
      </div>
      <div className="mt-2 rounded-lg border bg-white p-3">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Index</TableHead>
              <TableHead
              // className="w-[100px]"
              >
                Token
              </TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Liquidity</TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-gray-700">
            {pagedPoolList.map((pool) => (
              <TableRow key={pool.pool} className="!p-12">
                <TableCell>{pool.index}</TableCell>
                <TableCell className="py-4 font-medium">
                  <div className="">
                    {pool.token0Symbol} / {pool.token1Symbol}
                  </div>
                </TableCell>
                <TableCell>{pool.feeFormat}</TableCell>
                <TableCell>
                  [{pool.lowerPrice} - {pool.upperPrice}]
                </TableCell>
                <TableCell>{pool.currentPrice}</TableCell>
                <TableCell>{pool.liquidity}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    // variant="outline"
                    className="cursor-pointer py-4"
                    onClick={() => handleAddPosition(pool)}
                  >
                    + Add Position
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-3 text-right">
          <PaginationBox
            total={poolList.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* Add pool modal */}
      {addModalOpen && <PoolModal closeAddModal={closeAddModal} />}

      {/* Add position modal */}
      {poolPosition && (
        <PositionModal
          closeModal={closePoolPositionModal}
          poolPosition={poolPosition}
        />
      )}
    </div>
  )
}

export default memo(Pool)
