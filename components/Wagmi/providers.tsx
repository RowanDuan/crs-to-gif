"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider, type Config } from "wagmi"
import { useEffect, useState, type ReactNode } from "react"

import { createWagmiConfig } from "@/lib/wagmi/config"

const queryClient = new QueryClient()

export function WagmiProviders({ children }: { children: ReactNode }) {
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
