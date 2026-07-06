"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { custom, type Config } from "wagmi"
import { sepolia } from "wagmi/chains"

export function createWagmiConfig(): Config {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("请安装 MetaMask")
  }

  // 链接钱包, 等价于 ethers 的 BrowserProvider(window.ethereum)
  return getDefaultConfig({
    appName: "Stake Demo",
    projectId: "Project Id",
    chains: [sepolia],
    ssr: false,
    transports: {
      [sepolia.id]: custom(window.ethereum),
    },
  })
}
