"use client"

import * as React from "react"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useConfig, useAccount, useConnect } from "wagmi"

import StakePage from "@/components/Stake/StakePage"

// export const metadata = {
//   title: "Stake",
// }

export default function Page() {
  const { address, isConnected, isDisconnected, status, connector } =
    useAccount()

  // console.log("钱包地址:", address)
  // console.log("连接状态:", isConnected)
  // console.log("连接器:", connector) // 'MetaMask' | 'WalletConnect' 等
  // console.log("状态:", status) // 'connecting' | 'connected' | 'disconnected'
  // const isConnecting = status === "connecting"
  const isConnectedWallet = status === "connected"

  return (
    <main className="mx-auto w-full max-w-[1200px] p-6">
      <header className="mb-4 flex w-full items-center justify-between">
        <div className="text-xl font-bold">MetaNode Stake</div>
        <ConnectButton />
      </header>
      <hr />
      {!isConnectedWallet ? (
        <div className="mt-10 flex justify-center">
          <ConnectButton />
        </div>
      ) : (
        <StakePage />
      )}
    </main>
  )
}
