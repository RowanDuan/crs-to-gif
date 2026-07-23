import { useState, useMemo, useCallback, memo, useEffect } from "react"
import * as React from "react"

import Big from "big.js"
import { formatEther } from "ethers"
import { RotateCw, XIcon } from "lucide-react"
import { useMiniWallet } from "miniwallet"
import { toast } from "sonner"
import { useConfig } from "wagmi"
import { readContract } from "wagmi/actions"

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
  POSITION_MANAGER_CONTRACT_QUERY,
} from "@/lib/contracts/metaNodeSwap/contractsInfo"
import { Address, PositionItem } from "@/lib/contracts/metaNodeSwap/types"
import {
  getPriceFromTick,
  isTickInRange,
} from "@/lib/contracts/metaNodeSwap/utils"

import CollectPosition from "./CollectPosition"
import RemovePosition from "./RemovePosition"

function MyPositions() {
  const config = useConfig()
  const { account } = useMiniWallet()

  const [positions, setPositions] = useState<PositionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState({
    token0: "",
    token1: "",
    fee: "",
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const positionList = useMemo(() => {
    if (!account) {
      return []
    }
    return positions
      .filter((p) => {
        const symbol0 = filter.token0
          ? getTokenSymbol(filter.token0 as Address)
          : ""
        const symbol1 = filter.token1
          ? getTokenSymbol(filter.token1 as Address)
          : ""

        if (symbol0 && symbol1) {
          // C/D 与 D/C 都显示
          const forward =
            p.token0Symbol === symbol0 && p.token1Symbol === symbol1
          const reverse =
            p.token0Symbol === symbol1 && p.token1Symbol === symbol0
          if (!forward && !reverse) return false
        } else if (symbol0) {
          if (p.token0Symbol !== symbol0 && p.token1Symbol !== symbol0) {
            return false
          }
        } else if (symbol1) {
          if (p.token0Symbol !== symbol1 && p.token1Symbol !== symbol1) {
            return false
          }
        }
        if (filter.fee) {
          const feePct = Big(filter.fee).div(1_000_000).times(100).toFixed(4)
          if (p.fee !== feePct) return false
        }
        // return true
        return p.owner.toLowerCase() === account.toLowerCase()
      })
      .slice()
      .sort((a, b) => b.index - a.index)
  }, [account, positions, filter])
  console.log("positionList: ", positionList[0])

  const pagedPositionList = useMemo(() => {
    const start = (page - 1) * pageSize
    return positionList.slice(start, start + pageSize)
  }, [positionList, page, pageSize])
  console.log("pagedPositionList: ", pagedPositionList)

  // 筛选变化时回到第一页
  useEffect(() => {
    setPage(1)
  }, [filter])

  const getMyPositions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await readContract(config, {
        ...POSITION_MANAGER_CONTRACT_QUERY,
        functionName: "getAllPositions",
        account: account as Address,
      })
      console.log("res: ", res)
      const listFiltered = res?.filter((item) => {
        return (
          isTickInRange(Number(item.tickLower)) &&
          isTickInRange(Number(item.tickUpper))
        )
      })
      const list = listFiltered
        .filter((item) => {
          return getTokenSymbol(item.token0) && getTokenSymbol(item.token1)
        })
        .map((item) => {
          return {
            id: item.id.toString(),
            index: item.index,
            token0Symbol: getTokenSymbol(item.token0),
            token1Symbol: getTokenSymbol(item.token1),
            owner: item.owner,
            fee: Big(item.fee).div(1000000).times(100).toFixed(4),
            lowerPrice: getPriceFromTick(item.tickLower),
            upperPrice: getPriceFromTick(item.tickUpper),
            liquidity: item.liquidity.toString(),
            tokensOwed0: formatEther(item.tokensOwed0),
            tokensOwed1: formatEther(item.tokensOwed1),
          }
        })
      console.log("list: ", list)
      setPositions(list)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Load positions failed")
    } finally {
      setLoading(false)
    }
  }, [account, config])

  useEffect(() => {
    getMyPositions()
  }, [getMyPositions])

  return (
    <div className="mx-auto w-full max-w-[1200px] pt-8">
      <div className="flex items-center justify-between">
        <div className="flex h-9 items-center space-x-2 text-xl">
          <span className="text-2xl font-medium">My Positions</span>
          {loading ? (
            <SpinnerOverlay loading={loading} className="h-8 w-8">
              <div />
            </SpinnerOverlay>
          ) : (
            <Button
              onClick={getMyPositions}
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
        {/*<Button
          className="!bg-blue-500 p-5"
          onClick={() => {
            setAddModalOpen(true)
          }}
        >
          + Add Position
        </Button>*/}
      </div>
      <div className="mt-2 rounded-lg border bg-white p-3">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Index</TableHead>
              <TableHead
              // className="w-[100px]"
              >
                Token
              </TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Price Range</TableHead>
              {/*<TableHead>Owed0/Owed1</TableHead>*/}
              <TableHead className="text-right">Liquidity</TableHead>
              {/*<TableHead className="text-right">Index</TableHead>*/}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-gray-700">
            {pagedPositionList.map((p) => {
              const hasLiquidity = p.liquidity !== "0"
              const collectAvailable =
                hasLiquidity ||
                Number(p.tokensOwed0) > 0 ||
                Number(p.tokensOwed1) > 0
              return (
                <TableRow key={p.id} className="!p-12">
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.index}</TableCell>
                  <TableCell className="py-4 font-medium">
                    <div className="">
                      {p.token0Symbol} / {p.token1Symbol}
                    </div>
                  </TableCell>
                  <TableCell>{p.fee}%</TableCell>
                  <TableCell>
                    [{p.lowerPrice} - {p.upperPrice}]
                  </TableCell>
                  {/*<TableCell>
                    {Big(p.tokensOwed0).toFixed(5)}/
                    {Big(p.tokensOwed1).toFixed(5)}
                  </TableCell>*/}
                  <TableCell className="text-right">{p.liquidity}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hasLiquidity && (
                        <RemovePosition
                          positionId={p.id}
                          getMyPositionsAgain={getMyPositions}
                        />
                      )}
                      {collectAvailable && (
                        <CollectPosition
                          positionId={p.id}
                          getMyPositionsAgain={getMyPositions}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="mt-3 text-right">
          <PaginationBox
            total={positionList.length}
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

      {/* Add position modal */}
      {/*{addModalOpen && <PoolModal closeAddModal={closeAddModal} />}*/}
    </div>
  )
}

export default memo(MyPositions)
