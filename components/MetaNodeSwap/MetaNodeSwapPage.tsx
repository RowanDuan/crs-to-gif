"use client"

import { useCallback, useMemo, useState } from "react"
import * as React from "react"

import clsx from "clsx"
import { MiniWalletButton, useMiniWallet } from "miniwallet"
import { useConfig } from "wagmi"

import MyPositions from "@/components/MetaNodeSwap/MyPositions"
import Pool from "@/components/MetaNodeSwap/Pool"
import Swap from "@/components/MetaNodeSwap/Swap"

const TABS = [
  { id: "pool", label: "Pool" },
  { id: "positions", label: "My Positions" },
  { id: "swap", label: "Swap" },
] as const

export default function MetaNodeSwapPage() {
  const { isConnected, selectedChain } = useMiniWallet()

  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("pool")

  const isSepolia = useMemo(() => {
    return selectedChain?.id === 11155111
  }, [selectedChain?.id])

  const toMyPositionsTab = useCallback(() => {
    setActiveTab("positions")
  }, [])

  return (
    <main className="mx-auto min-h-[100vh] w-full bg-gray-50 px-12 py-6">
      <header className="relative flex min-h-[37px] items-center justify-center">
        <h1 className="absolute left-0 z-10 text-2xl font-bold">
          {/* Meta Node Swap */}
          Mxxa Nxxe Sxxp
        </h1>
        {isConnected && isSepolia && (
          <div className="flex items-center justify-center space-x-6 *:cursor-pointer">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className={clsx("border-b-3 border-b-transparent px-3 py-1", {
                  "!border-b-blue-600 font-bold text-blue-600":
                    activeTab === tab.id,
                })}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        )}
        {/*<Tabs value={activeTab}>
          <TabsList variant="line">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>*/}
        <div className="absolute right-0 z-10">
          <MiniWalletButton />
        </div>
      </header>
      {!isConnected ? (
        <div className="mt-20 flex justify-center">
          <div>- 钱包未连接 -</div>
        </div>
      ) : (
        <>
          {isSepolia ? (
            <>
              <div className={clsx({ hidden: activeTab !== "pool" })}>
                <Pool toMyPositionsTab={toMyPositionsTab} />
              </div>
              <div className={clsx({ hidden: activeTab !== "positions" })}>
                <MyPositions />
              </div>
              {activeTab === "swap" && (
                <div>
                  <Swap />
                </div>
              )}
            </>
          ) : (
            <div className="pt-20 text-center">- 请切换至Sepolia网络 -</div>
          )}
        </>
      )}
    </main>
  )
}
