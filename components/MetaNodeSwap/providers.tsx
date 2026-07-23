"use client"

import { useEffect, useState, type ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MiniWalletProvider } from "miniwallet"
import { WagmiProvider, type Config } from "wagmi"

import { createSepoliaWagmiConfig } from "@/lib/metaNodeSwap/configSepolia"

const queryClient = new QueryClient()

export function MetaNodeSwapProviders({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    setConfig(createSepoliaWagmiConfig()) // Wagmi链接Sepolia
  }, [])

  if (!config) {
    return null
  }

  return (
    // Wagmi层
    <WagmiProvider config={config}>
      {/* Query层 */}
      <QueryClientProvider client={queryClient}>
        {/* 链接钱包的按钮层 */}
        <MiniWalletProvider>{children}</MiniWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
