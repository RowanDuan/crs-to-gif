"use server"

import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

const ETH_RPC_URL = process.env.ETH_RPC_URL ?? "https://ethereum.publicnode.com"

const client = createPublicClient({
  chain: mainnet,
  transport: http(ETH_RPC_URL, { timeout: 10_000 }),
})

export async function fetchBlockNumber() {
  const blockNumber = await client.getBlockNumber()
  return blockNumber.toString()
}
