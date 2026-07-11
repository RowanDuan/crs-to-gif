"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { useEffect, useState, type ReactNode } from "react"

// import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MiniWalletProvider } from "miniwallet"
import { WagmiProvider, type Config } from "wagmi"

// import { MiniWalletWagmiSync } from "@/components/Stake/MiniWalletWagmiSync"
// import { createWagmiConfig } from "@/lib/stake/config"
import { createSepoliaWagmiConfig } from "@/lib/stake/configSepolia"

const queryClient = new QueryClient()

export function StakeProviders({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    // setConfig(createWagmiConfig())
    setConfig(createSepoliaWagmiConfig()) // Wagmi链接Sepolia
  }, [])

  if (!config) {
    return null
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* <RainbowKitProvider>{children}</RainbowKitProvider> */}
        <MiniWalletProvider>
          {/*<MiniWalletWagmiSync />*/}
          {children}
        </MiniWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
