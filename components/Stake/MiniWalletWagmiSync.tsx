"use client"

import { useEffect, useRef } from "react"

import { useMiniWallet } from "miniwallet"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"

/**
 * MiniWallet 与 wagmi 是两套连接状态。
 * MiniWallet 负责 UI / eth_requestAccounts；
 * 本组件在 MiniWallet 连上后，把同一浏览器钱包同步进 wagmi，
 * 这样 useBlockNumber、writeContract 等 wagmi API 才能正常工作。
 */
export function MiniWalletWagmiSync() {
  const { isConnected: miniConnected, account, selectedChain } = useMiniWallet()
  const { isConnected: wagmiConnected, chainId: wagmiChainId } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const connectingRef = useRef(false)

  // MiniWallet 已连接 → 同步到 wagmi
  useEffect(() => {
    if (!miniConnected || !account || wagmiConnected || isPending) return
    if (connectingRef.current) return

    const connector =
      connectors.find((c) => c.type === "injected" || c.id === "injected") ??
      connectors[0]

    if (!connector) return

    connectingRef.current = true
    connect(
      { connector },
      {
        onSettled() {
          connectingRef.current = false
        },
      }
    )
  }, [miniConnected, account, wagmiConnected, isPending, connectors, connect])

  // MiniWallet 断开 → 同步断开 wagmi
  useEffect(() => {
    if (!miniConnected && wagmiConnected) {
      disconnect()
    }
  }, [miniConnected, wagmiConnected, disconnect])

  // 链切换同步
  useEffect(() => {
    if (!wagmiConnected || !selectedChain) return
    if (wagmiChainId === selectedChain.id) return
    switchChain?.({ chainId: selectedChain.id })
  }, [wagmiConnected, selectedChain, wagmiChainId, switchChain])

  useEffect(() => {
    if (error) {
      console.error("MiniWallet → wagmi sync failed:", error)
    }
  }, [error])

  return null
}
