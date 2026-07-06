"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { useEffect, useState, type ReactNode } from "react"

import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, type Config } from "wagmi"

import { createWagmiConfig } from "@/lib/stake/config"

const queryClient = new QueryClient()

export function StakeProviders({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    setConfig(createWagmiConfig())
  }, [])

  if (!config) {
    return null
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
