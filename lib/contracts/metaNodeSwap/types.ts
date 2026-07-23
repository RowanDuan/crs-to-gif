export type Address = `0x${string}`

export type PoolItem = {
  index: number
  tick: number
  tickLower: number
  tickUpper: number
  pool: Address
  token0Symbol: string
  token1Symbol: string
  token0: string
  token1: string
  fee: number
  feeFormat: string
  currentPrice: string
  lowerPrice: string
  upperPrice: string
  liquidity: string
}

export type PositionItem = {
  id: string
  index: number
  token0Symbol: string
  token1Symbol: string
  owner: Address
  fee: string
  lowerPrice: string
  upperPrice: string
  liquidity: string
  tokensOwed0: string
  tokensOwed1: string
}

export type PositionAmountParams = {
  token0: string
  token1: string
  feeAmount: number
  currentPrice: string
  liquidity: string
  tick: number
  tickLower: number
  tickUpper: number
  chainId?: number
  decimals0?: number
  decimals1?: number
}

/** Swap / Quote 模式（优先 as const，不必用 enum） */
export const QuoteMode = {
  ExactInput: "exactInput",
  ExactOutput: "exactOutput",
} as const

export type QuoteMode = (typeof QuoteMode)[keyof typeof QuoteMode]
