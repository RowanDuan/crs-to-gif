"use client"

import { http, createConfig, type Config } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

/** wagmi连接sepolia, 供 MiniWallet 使用 */
export function createSepoliaWagmiConfig(): Config {
  return createConfig({
    chains: [sepolia],
    connectors: [injected()],
    // 读链数据走 HTTP RPC，不依赖钱包已连接
    transports: {
      [sepolia.id]: http(),
    },
    ssr: false,
  })
}
