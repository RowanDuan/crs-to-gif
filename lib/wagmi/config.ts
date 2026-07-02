"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { custom, type Config } from "wagmi"
import { sepolia } from "wagmi/chains"

// 等价于 ethers 的 BrowserProvider(window.ethereum)
// 仅在浏览器端调用，不要在模块顶层访问 window
export function createWagmiConfig(): Config {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("请安装 MetaMask")
  }

  return getDefaultConfig({
    appName: "Wagmi Demo",
    projectId: "Project Id",
    chains: [sepolia],
    ssr: false,
    transports: {
      [sepolia.id]: custom(window.ethereum),
    },
  })
}
