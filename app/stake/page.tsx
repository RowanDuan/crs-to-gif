"use client"

import * as React from "react"

// import { ConnectButton } from "@rainbow-me/rainbowkit"
import { MiniWalletButton, useMiniWallet } from "miniwallet"
import {
  // useConfig,
  useAccount,
  // useConnect
} from "wagmi"

// import StakePage from "@/components/Stake/StakePage"
import StakePageMini from "@/components/Stake/StakePageMini"

// export const metadata = {
//   title: "Stake",
// }

export default function Page() {
  const {
    address: addressFromWagmi,
    // isConnected,
    // isDisconnected,
    // status,
    // connector,
  } = useAccount()

  // const addressFromWagmiLabel = useMemo(() => {
  //   return addressFromWagmi
  //     ? `Account: ${addressFromWagmi.slice(0, 6)}...${addressFromWagmi.slice(-4)}`
  //     : ""
  // }, [addressFromWagmi])

  // console.log("钱包地址:", address)
  // console.log("连接状态:", isConnected)
  // console.log("连接器:", connector) // 'MetaMask' | 'WalletConnect' 等
  // console.log("状态:", status) // 'connecting' | 'connected' | 'disconnected'
  // const isConnecting = status === "connecting"
  // const isConnectedWallet = status === "connected"

  const { isConnected, selectedChain } = useMiniWallet()

  return (
    <main className="mx-auto w-full max-w-[1200px] p-6">
      <header className="mb-4 flex w-full items-center justify-between">
        <div className="text-xl font-bold">
          MetaNode Stake
          {addressFromWagmi && (
            <div className="hidden text-sm text-gray-500">
              {addressFromWagmi}
            </div>
          )}
        </div>
        {/*<ConnectButton />*/}
        <MiniWalletButton />
      </header>
      <hr />
      {!isConnected ? (
        <div className="mt-20 flex justify-center">
          {/*<ConnectButton />*/}
          {/*<MiniWalletButton />*/}
          <div>- 钱包未连接 -</div>
        </div>
      ) : (
        <>
          {/* Rainbowkit + Wagmi */}
          {/*<StakePage />*/}

          {/* MiniWallet + Wagmi + Sepolia chain + Stake Contract */}
          {selectedChain?.id === 11155111 ? (
            <StakePageMini />
          ) : (
            <div className="pt-20 text-center">- 请切换至Sepolia网络 -</div>
          )}
        </>
      )}
    </main>
  )
}
