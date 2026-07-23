import type { Config } from "wagmi"
import { readContract } from "wagmi/actions"

import {
  getTokenSymbol,
  POOL_CONTRACT_QUERY,
} from "@/lib/contracts/metaNodeSwap/contractsInfo"
import { Address, PoolItem } from "@/lib/contracts/metaNodeSwap/types"
import {
  formatFee,
  formatSqrt,
  getPriceFromTick,
  isTickInRange,
} from "@/lib/contracts/metaNodeSwap/utils"

/** 读取全部池子并映射为 PoolItem[] */
export async function getAllPools(config: Config): Promise<PoolItem[]> {
  const res = await readContract(config, {
    ...POOL_CONTRACT_QUERY,
    functionName: "getAllPools",
  })

  const listFiltered = res.filter((item) => {
    return (
      isTickInRange(Number(item.tick)) &&
      isTickInRange(Number(item.tickLower)) &&
      isTickInRange(Number(item.tickUpper))
    )
  })

  return listFiltered.map((item) => {
    const fee = Number(item.fee)
    return {
      index: item.index,
      tick: item.tick,
      tickLower: Number(item.tickLower),
      tickUpper: Number(item.tickUpper),
      pool: item.pool as Address,
      token0: item.token0,
      token1: item.token1,
      token0Symbol: getTokenSymbol(item.token0 as Address),
      token1Symbol: getTokenSymbol(item.token1 as Address),
      fee,
      feeFormat: formatFee(fee),
      currentPrice: formatSqrt(item.sqrtPriceX96.toString()),
      lowerPrice: getPriceFromTick(item.tickLower),
      upperPrice: getPriceFromTick(item.tickUpper),
      liquidity: item.liquidity.toString(),
    }
  })
}
