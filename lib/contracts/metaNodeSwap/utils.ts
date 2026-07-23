import { Token } from "@uniswap/sdk-core"
import {
  encodeSqrtRatioX96,
  TickMath,
  Pool,
  Position,
  FeeAmount,
  nearestUsableTick,
} from "@uniswap/v3-sdk"
import Big from "big.js"
// import { Q96 } from '@uniswap/v3-sdk';
import JSBI from "jsbi"

import {
  PositionAmountParams,
  PoolItem,
} from "@/lib/contracts/metaNodeSwap/types"

export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))

/**
 * 将可读价格（可含小数）转为 encodeSqrtRatioX96 可用的整数比例
 * 例：\"15.000000\" → [\"15000000\", \"1000000\"]
 */
const priceToAmountRatio = (price: string): [string, string] => {
  const normalized = new Big(price).toFixed()
  const [intPart, fracPart = ""] = normalized.split(".")
  if (!fracPart) {
    return [intPart || "0", "1"]
  }
  const amount1 = `${intPart}${fracPart}`.replace(/^(-?)0+(\d)/, "$1$2") || "0"
  const amount0 = `1${"0".repeat(fracPart.length)}`
  return [amount1, amount0]
}

// 转 SqrtRatioX96 为可读价格
export const formatSqrt = (sqrt: string) => {
  return new Big(sqrt).div(new Big(2).pow(96)).pow(2).toFixed(6)
}

// 转价格为 SqrtRatioX96（支持小数价格）
export const parseSqrt = (price: string) => {
  const [amount1, amount0] = priceToAmountRatio(price)
  return BigInt(encodeSqrtRatioX96(amount1, amount0).toString())
}

// 转价格为 tick（支持小数价格）
export const getTickFromPrice = (price: string) => {
  const [amount1, amount0] = priceToAmountRatio(price)
  return TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(amount1, amount0))
}

// 转 tick 为价格
export const getPriceFromTick = (tick: number) => {
  return formatSqrt(TickMath.getSqrtRatioAtTick(tick).toString())
}

// 价格取到数
export const geyInvertedPrice = (price: string, inverted: boolean) => {
  return inverted ? new Big(1).div(price).toString() : price
}

// 检测 tick 区间
export const isTickInRange = (tick: number) => {
  return tick >= -887220 && tick <= 887220
}

// 转百分比为数值: 比如 0.30% -> 3000
export const parseFee = (fee: string) => {
  return Number(new Big(fee).div(100).times(1_000_000).toFixed(0))
}

export const formatFee = (fee: number) => {
  return `${Big(fee).div(1000000).times(100).toFixed(2)}%`
}

/**
 * 从池子列表中筛选 token 对、校验价格/流动性，按当前价排序后返回 indexPath
 * tokenA < tokenB：价格从大到小；否则从小到大
 */
export function buildIndexPathFromPools(
  pools: PoolItem[],
  tokenA: string,
  tokenB: string
): number[] {
  const isSameAddress = (a: string, b: string) =>
    a.toLowerCase() === b.toLowerCase()

  const priceDesc = tokenA.toLowerCase() < tokenB.toLowerCase()
  console.log("priceDesc: ", priceDesc)
  const poolsSorted = pools
    .filter((pool) => {
      const matchForward =
        isSameAddress(pool.token0, tokenA) && isSameAddress(pool.token1, tokenB)
      const matchReverse =
        isSameAddress(pool.token0, tokenB) && isSameAddress(pool.token1, tokenA)
      if (!matchForward && !matchReverse) return false

      const hasPrices =
        Boolean(pool.currentPrice) &&
        Boolean(pool.lowerPrice) &&
        Boolean(pool.upperPrice)
      const hasLiquidity = Boolean(pool.liquidity) && pool.liquidity !== "0"
      return hasPrices && hasLiquidity
    })
    .sort((a, b) => {
      const diff = Number(a.currentPrice) - Number(b.currentPrice)
      return priceDesc ? -diff : diff
    })
  console.log("poolsSorted: ", poolsSorted)
  return poolsSorted.map((pool) => pool.index)
}

const buildPoolAndTicks = ({
  token0,
  token1,
  feeAmount,
  currentPrice,
  liquidity,
  tick,
  tickLower: tickLowerRaw,
  tickUpper: tickUpperRaw,
  chainId = 11155111,
  decimals0 = 18,
  decimals1 = 18,
}: PositionAmountParams) => {
  // 初始化代币
  const tokenA = new Token(
    chainId,
    token0,
    decimals0,
    undefined,
    undefined,
    true
  )
  const tokenB = new Token(
    chainId,
    token1,
    decimals1,
    undefined,
    undefined,
    true
  )

  const pool = new Pool(
    tokenA,
    tokenB,
    feeAmount as FeeAmount,
    parseSqrt(currentPrice).toString(), // SqrtRatioX96
    liquidity,
    tick
  )

  // Position 要求 tick 对齐 tickSpacing，否则会报 TICK_UPPER / TICK_LOWER
  const tickLower = nearestUsableTick(tickLowerRaw, pool.tickSpacing)
  let tickUpper = nearestUsableTick(tickUpperRaw, pool.tickSpacing)
  if (tickLower >= tickUpper) {
    tickUpper = tickLower + pool.tickSpacing
  }

  return { pool, tickLower, tickUpper }
}

/**
 * 使用 Uniswap Position 计算输入 amount0 时计算出 amount1
 * @param amount 输入侧数量（最小单位字符串）
 * @param inputToken 输入的是 token0 还是 token1
 * @returns 另一边数量（最小单位字符串）
 */
export function getPairedAmountByPosition({
  amount,
  inputToken,
  ...params
}: PositionAmountParams & {
  amount: string
  inputToken: 0 | 1
}): string {
  if (!amount || amount === "0") return "0"

  const { pool, tickLower, tickUpper } = buildPoolAndTicks(params) // 构建position

  if (inputToken === 0) {
    const position = Position.fromAmount0({
      pool,
      tickLower,
      tickUpper,
      amount0: amount,
      useFullPrecision: true,
    })
    return position.amount1.quotient.toString()
  }

  const position = Position.fromAmount1({
    pool,
    tickLower,
    tickUpper,
    amount1: amount,
  })
  return position.amount0.quotient.toString()
}
