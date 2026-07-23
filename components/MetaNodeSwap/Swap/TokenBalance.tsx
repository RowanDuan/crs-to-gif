"use client"

import { memo, useCallback, useEffect, useState } from "react"

import { formatEther } from "ethers"
import { RotateCw } from "lucide-react"
import { useMiniWallet } from "miniwallet"
import { toast } from "sonner"
import { useConfig } from "wagmi"
import { readContract } from "wagmi/actions"

import { Spinner } from "@/components/ui/spinner"
import { MN_TOKEN_ABI } from "@/lib/contracts/metaNodeSwap/mnTokenAbi"
import { Address } from "@/lib/contracts/metaNodeSwap/types"

function TokenBalance({ tokenAddress }: { tokenAddress?: string }) {
  const config = useConfig()
  const { account } = useMiniWallet()
  const [balance, setBalance] = useState<string>("0.00000")
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!tokenAddress || !account) {
      setBalance("0.00000")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const raw = (await readContract(config, {
        address: tokenAddress as Address,
        abi: MN_TOKEN_ABI,
        functionName: "balanceOf",
        args: [account as Address],
      })) as bigint
      setBalance(Number(formatEther(raw)).toFixed(5))
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Load balance failed")
      setBalance("0.00000")
    } finally {
      setLoading(false)
    }
  }, [account, config, tokenAddress])

  useEffect(() => {
    void fetchBalance()
  }, [fetchBalance])

  return (
    <span
      className={`inline-flex items-center justify-end gap-1 ${
        !tokenAddress ? "opacity-0" : ""
      }`}
    >
      Balance: {balance}
      {loading ? (
        <Spinner className="inline size-4" />
      ) : (
        <RotateCw
          className="size-4 cursor-pointer"
          onClick={() => void fetchBalance()}
        />
      )}
    </span>
  )
}

export default memo(TokenBalance)
