"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import * as React from "react"

import { getContractEvents } from "viem/actions"
import type { Abi } from "viem"
import { formatEther, parseEther } from "ethers"
import { RefreshCw, RotateCw } from "lucide-react"
import { toast } from "sonner"
import {
  useConfig,
  useAccount,
  useConnect,
  useWatchContractEvent,
  useBlockNumber,
  useBlock,
} from "wagmi"
import {
  getBalance,
  sendTransaction,
  readContract,
  readContracts,
  writeContract,
  waitForTransactionReceipt,
  getPublicClient,
} from "wagmi/actions"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SpinnerOverlay } from "@/components/ui/spinner-overlay"
import MyERC20 from "@/lib/contracts/MyERC20.json"
import { stakeAbi } from "@/lib/contracts/stakeAbi"
import { isValidNumberValue } from "@/lib/utils"

// const ACCOUNT1_ADDRESS =
//   "0x738a73250D686F6A79200a8A9a64e32ed9A9CEda" as `0x${string}`
// const ACCOUNT2_ADDRESS =
//   "0xBAFdb5801EA302aA7d28704c4db470217D321593" as `0x${string}`
const STAKE_CONTRACT_ADDRESS =
  "0x56682aa855226f3228b374a69aF5017D174372Fe" as `0x${string}`
const POOL_ID = BigInt(0)

const erc20Abi = MyERC20.abi as Abi

const stakeContractQuery = {
  address: STAKE_CONTRACT_ADDRESS,
  abi: stakeAbi,
}

export default function StakePage() {
  const config = useConfig()
  const { data: currentBlockNumber } = useBlockNumber({
    watch: true,
  })
  const { address: walletAddress } = useAccount()

  const [loading, setLoading] = useState(true)
  const [metaNodeConteactAddress, setMetaNodeConteactAddress] = useState("")
  const [metaNodeInfo, setMetaNodeInfo] = useState({
    address: "",
    name: "",
    symbol: "",
    balance: "0",
  })
  const [stakeValue, setStakeValue] = useState("0.001")
  const [stakedAmount, setStakedAmount] = useState("0")
  const [pendingToken, setPendingToken] = useState("0")
  const [unstakeValue, setUnstakeValue] = useState("0.00")
  const [withdrawInfo, setWithdrawInfo] = useState({
    availableWithdrawAmount: "0.00",
    pendingWithdrawAmount: "0.00",
  })
  const [stakeContractInfo, setStakeContractInfo] = useState({
    minDepositAmount: "0",
    unstakeLockedBlocks: 0,
  })
  const [readyWithdrawList, setReadyWithdrawList] = useState<any[]>([])

  // 监听stake合约事件
  // useWatchContractEvent({
  //   ...watchContractEventQuery,
  //   enabled: true,
  //   eventName: "UpdatePool",
  //   onLogs(logs) {
  //     console.log("New UpdatePool logs!", logs)
  //     console.log((logs?.[0]?.args?.lastRewardBlock ?? "0").toString())
  //   },
  //   onError(error) {
  //     console.error("Watch UpdatePool error: ", error)
  //   },
  // })

  const REC20ContractQuery = useMemo(() => {
    return {
      address: metaNodeConteactAddress as `0x${string}`,
      abi: erc20Abi,
    }
  }, [metaNodeConteactAddress])

  const handleCallback = useCallback(async (fn: () => void) => {
    try {
      setLoading(true)
      await fn?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const initContractInfo = useCallback(async () => {
    try {
      if (!walletAddress) {
        return
      }
      setLoading(true)
      const [metaNodeRes, userRes, poolRes] = await readContracts(config, {
        contracts: [
          {
            ...stakeContractQuery,
            functionName: "MetaNode", // 获取 MetaNode 代币地址
          },
          {
            ...stakeContractQuery,
            functionName: "user",
            args: [POOL_ID, walletAddress],
          },
          {
            ...stakeContractQuery,
            functionName: "pool",
            args: [POOL_ID],
          },
        ],
      })
      const userResult = (userRes?.result ?? []) as readonly [
        bigint,
        bigint,
        bigint,
      ]
      const [stAmount, finishedMetaNode, storedPendingMetaNode] = userResult
      setStakedAmount(formatEther(stAmount))
      if (poolRes?.result) {
        const [
          stTokenAddress,
          poolWeight,
          lastRewardBlockValue,
          accMetaNodePerST,
          stTokenAmount,
          minDepositAmount,
          unstakeLockedBlocks,
        ] = poolRes.result as readonly [
          `0x${string}`,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
        ]
        setStakeContractInfo({
          minDepositAmount: formatEther(minDepositAmount),
          unstakeLockedBlocks: Number(unstakeLockedBlocks),
        })
        // 质押代币地址: ${stTokenAddress}
        // 池子权重: ${poolWeight}
        // 上次奖励区块: ${lastRewardBlockValue}
        // 累计奖励: ${accMetaNodePerST}
        // 质押总量: ${formatEther(stTokenAmount || 0, 18)} ST
        // console.log(`
        //   最小质押: ${formatEther(minDepositAmount)}
        //   解锁区块数: ${unstakeLockedBlocks}
        // `)
      }
      const noteAddress = (metaNodeRes?.result ?? "") as `0x${string}`
      setMetaNodeConteactAddress(noteAddress)
      const noteREC20ContractQuery = {
        address: noteAddress,
        abi: erc20Abi,
      }
      // 获取 MetaNodeToken 代币合约信息
      const [nameRes, symbolRes, myBalance] = await readContracts(config, {
        contracts: [
          {
            ...noteREC20ContractQuery,
            functionName: "name",
          },
          {
            ...noteREC20ContractQuery,
            functionName: "symbol",
          },
          {
            ...noteREC20ContractQuery,
            functionName: "balanceOf",
            args: [walletAddress],
          },
        ],
      })
      setMetaNodeInfo({
        address: noteAddress,
        name: String(nameRes?.result ?? ""),
        symbol: String(symbolRes?.result ?? ""),
        balance: formatEther((myBalance?.result ?? 0) as bigint),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [config, walletAddress])

  const getStakingInfo = useCallback(async () => {
    try {
      if (!walletAddress) {
        return
      }
      const [res] = await readContracts(config, {
        contracts: [
          {
            ...stakeContractQuery,
            functionName: "stakingBalance", //
            args: [POOL_ID, walletAddress],
          },
        ],
      })
      console.log("getStakingInfo res: ", res)
      setStakedAmount(formatEther((res?.result ?? 0) as bigint))
    } catch (e) {
      console.error(e)
    }
  }, [config, walletAddress])

  const handleStakeETH = useCallback(() => {
    if (!isValidNumberValue(stakeValue)) {
      toast.error(`Invalid value!`)
      return
    }
    const value = parseEther(stakeValue)
    const minValue = stakeContractInfo.minDepositAmount
    if (value < parseEther(minValue)) {
      toast.error(`Cannot be lower than ${minValue}`)
      return
    }
    handleCallback(async () => {
      // depositETH
      const hash = await writeContract(config, {
        ...stakeContractQuery,
        functionName: "depositETH",
        value,
      })
      console.log("depositETH tx hash: ", hash)
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      })
      console.log("depositETH receipt: ", receipt)
      if (receipt?.status === "success") {
        toast.success("Stake Successfully!")
        getStakingInfo()
      } else {
        toast.error("Stake Failed!")
      }
    })
  }, [
    config,
    getStakingInfo,
    handleCallback,
    stakeContractInfo.minDepositAmount,
    stakeValue,
  ])

  const handleGetMyMetaNodeToken = useCallback(() => {
    handleCallback(async () => {
      const res = await readContract(config, {
        ...REC20ContractQuery,
        functionName: "balanceOf",
        args: [walletAddress],
      })
      console.log("getMyMetaNodeToken res: ", res)
      setMetaNodeInfo((cur) => {
        return {
          ...cur,
          balance: formatEther(res as bigint),
        }
      })
    })
  }, [REC20ContractQuery, config, handleCallback, walletAddress])

  const getPendingMetaNode = useCallback(async () => {
    try {
      if (!walletAddress) {
        return
      }
      const res = await readContract(config, {
        ...stakeContractQuery,
        functionName: "pendingMetaNode", // 实时计算函数
        args: [POOL_ID, walletAddress],
      })
      console.log("getPendingMetaNode res: ", res)
      setPendingToken(formatEther(res as bigint))
    } catch (e) {
      console.error(e)
    }
  }, [config, walletAddress])

  const handleClaim = useCallback(() => {
    if (!isValidNumberValue(pendingToken)) {
      toast.error("Available amount is 0!")
      return
    }
    handleCallback(async () => {
      const hash = await writeContract(config, {
        ...stakeContractQuery,
        functionName: "claim",
        args: [POOL_ID],
      })
      console.log("claim tx hash: ", hash)
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      })
      console.log("claim receipt: ", receipt)
      if (receipt?.status === "success") {
        toast.success("Claim Successfully!")
        getPendingMetaNode()
        handleGetMyMetaNodeToken()
      } else {
        toast.error("Claim Failed!")
      }
    })
  }, [
    config,
    getPendingMetaNode,
    handleCallback,
    handleGetMyMetaNodeToken,
    pendingToken,
  ])

  const getWithdrawInfo = useCallback(async () => {
    try {
      if (!walletAddress) {
        return
      }
      const res = await readContract(config, {
        ...stakeContractQuery,
        functionName: "withdrawAmount",
        args: [POOL_ID, walletAddress],
      })
      console.log("getWithdrawInfo res: ", res)
      const requestAmount = res?.[0] ?? 0
      const pendingAmount = res?.[1] ?? 0
      const needWaitAmount = requestAmount - pendingAmount
      setWithdrawInfo({
        availableWithdrawAmount: formatEther(pendingAmount),
        pendingWithdrawAmount: formatEther(needWaitAmount),
      })
      // if (!isValidNumberValue(needWaitAmount)) {
      //   setReadyWithdrawList([])
      // }
    } catch (e) {
      console.error(e)
    }
  }, [config, walletAddress])

  const getUnstakeRequests = useCallback(
    async (curBlockNumber: bigint) => {
      try {
        const unstakeLockedVal = stakeContractInfo.unstakeLockedBlocks
        if (!isValidNumberValue(unstakeLockedVal)) {
          console.log("unstakeLockedBlocks is 0")
          return
        }
        const publicClient = getPublicClient(config)
        if (!publicClient) {
          return
        }
        console.log("fromBlock: ", curBlockNumber)
        console.log("toBlock: ", curBlockNumber - BigInt(unstakeLockedVal))
        const res = await getContractEvents(publicClient, {
          ...stakeContractQuery,
          eventName: "RequestUnstake",
          fromBlock: curBlockNumber - BigInt(unstakeLockedVal),
          toBlock: curBlockNumber,
          args: {
            user: walletAddress,
            poolId: POOL_ID,
          },
        })
        console.log("RequestUnstake res: ", res)

        const readyList = res.map((item) => {
          return {
            amount: formatEther(item?.args?.amount ?? 0),
            blockNumber: Number(item.blockNumber),
            blockNumberRest: Number(
              BigInt(unstakeLockedVal) + item.blockNumber - curBlockNumber
            ),
          }
        })
        console.log("readyList: ", readyList)
        setReadyWithdrawList(readyList)
      } catch (e) {
        console.error(e)
      }
    },
    [config, stakeContractInfo.unstakeLockedBlocks, walletAddress]
  )

  const handleUnstake = useCallback(() => {
    if (!isValidNumberValue(unstakeValue)) {
      toast.error(`Invalid value!`)
      return
    }
    handleCallback(async () => {
      const hash = await writeContract(config, {
        ...stakeContractQuery,
        functionName: "unstake",
        args: [POOL_ID, parseEther(unstakeValue)],
      })
      console.log("unstake tx hash: ", hash)
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      })
      console.log("unstake receipt: ", receipt)
      if (receipt?.status === "success") {
        toast.success("Unstake Successfully!")
        getStakingInfo()
        getWithdrawInfo()
      } else {
        toast.error("Unstake Failed!")
      }
    })
  }, [config, getStakingInfo, getWithdrawInfo, handleCallback, unstakeValue])

  const handleWithdraw = useCallback(() => {
    if (!isValidNumberValue(withdrawInfo.availableWithdrawAmount)) {
      toast.error(`Available amount is 0!`)
      return
    }
    handleCallback(async () => {
      const hash = await writeContract(config, {
        ...stakeContractQuery,
        functionName: "withdraw",
        args: [POOL_ID],
      })
      console.log("withdraw hash: ", hash)
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      })
      console.log("withdraw receipt: ", receipt)
      if (receipt?.status === "success") {
        toast.success("Withdraw Successfully!")
        getWithdrawInfo()
      } else {
        toast.error("Withdraw Failed!")
      }
    })
  }, [
    config,
    getWithdrawInfo,
    handleCallback,
    withdrawInfo.availableWithdrawAmount,
  ])

  // 查询基础信息
  useEffect(() => {
    initContractInfo()
    getWithdrawInfo()
  }, [initContractInfo, getWithdrawInfo])

  // 查询奖励
  useEffect(() => {
    if (currentBlockNumber) {
      console.log("currentBlockNumber: ", currentBlockNumber)
      getPendingMetaNode()
    }
  }, [currentBlockNumber, getPendingMetaNode])

  // 查询 UnstakeRequests
  useEffect(() => {
    if (
      isValidNumberValue(withdrawInfo.pendingWithdrawAmount) &&
      currentBlockNumber
    ) {
      getUnstakeRequests(currentBlockNumber)
      getWithdrawInfo()
    }
  }, [
    currentBlockNumber,
    getUnstakeRequests,
    getWithdrawInfo,
    withdrawInfo.pendingWithdrawAmount,
  ])

  return (
    <div>
      <div>
        <SpinnerOverlay loading={loading} className="h-10 w-10">
          <div />
        </SpinnerOverlay>
        {/*<Button onClick={initContractInfo} disabled={loading}>
          查询Contract
        </Button>*/}
      </div>
      <div className="mt-6 grid w-full grid-cols-[240px_1fr_240px] gap-6 text-center">
        <div>
          <div>
            <div className="text-xl font-bold">Stake</div>
            <div className="text-xs">Stake ETH to earn tokens</div>
          </div>
          <Card className="mt-3 text-center">
            <CardContent className="space-y-4">
              <div>
                <div>Staked Amount</div>
                <div className="text-base font-bold text-blue-500">
                  {stakedAmount} ETH
                </div>
              </div>
              <div className="space-y-1 text-left">
                <p>Amount to Stake</p>
                <div className="flex items-center justify-end">
                  <Input
                    value={stakeValue}
                    onChange={(e) => setStakeValue(e.target.value)}
                  />
                  <span className="ml-2">ETH</span>
                </div>
                <div className="text-xs">
                  min: {stakeContractInfo.minDepositAmount} ETH
                </div>
                <Button onClick={handleStakeETH} disabled={loading}>
                  Stake ETH
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <div>
            <div className="text-xl font-bold">Withdrawal</div>
            <div className="text-xs">Unstake and withdraw your ETH</div>
          </div>
          <Card className="mt-3 text-center">
            {/*<CardHeader>
              <div className="text-xl font-bold">Withdrawal</div>
              Unstake and withdraw your ETH
            </CardHeader>*/}
            <CardContent className="grid grid-cols-3 gap-6">
              <div>
                Staked Amount
                <div className="font-bold text-blue-500">
                  {stakedAmount} ETH
                </div>
              </div>
              <div>
                Available to Withdraw
                <div className="font-bold text-blue-500">
                  {withdrawInfo.availableWithdrawAmount} ETH
                </div>
              </div>
              <div>
                Pending Withdraw
                <div className="font-bold text-blue-500">
                  {withdrawInfo.pendingWithdrawAmount} ETH
                </div>
              </div>
            </CardContent>
            <CardContent className="mt-2 text-left">
              <div className="space-y-1">
                <div className="text-base">Unstake</div>
                <div className="text-xs text-gray-600">Amount to Unstake</div>
                <div className="flex items-center justify-end">
                  <Input
                    value={unstakeValue}
                    onChange={(e) => {
                      setUnstakeValue(e.target.value)
                    }}
                  />
                  <span className="ml-2">ETH</span>
                </div>
                <Button onClick={handleUnstake} disabled={loading}>
                  Unstake ETH
                </Button>
              </div>
              <div className="space-y-1">
                <div className="mt-6 text-base">Withdraw</div>
                <Card>
                  <CardContent>
                    <div className="text-xs">Ready to Withdraw</div>
                    {readyWithdrawList.map((item) => (
                      <div
                        key={item.blockNumber}
                        className="mt-1 flex items-center justify-between font-bold text-blue-500"
                      >
                        <span>{item.amount} ETH</span>
                        <span className="mx-2 mt-0.5 h-[1px] flex-1 border-t border-dashed border-[#666]" />
                        <span className="">
                          {item.blockNumberRest} blocks cooldown
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 mb-1">
                After unstaking, you need to wait{" "}
                {stakeContractInfo.unstakeLockedBlocks} blocks to withdraw.
              </div>
              <Button onClick={handleWithdraw} disabled={loading}>
                Withdraw ETH
              </Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <div>
            <div className="text-xl font-bold">Claim</div>
            <div className="text-xs">Claim rewards</div>
          </div>
          <Card className="mt-3 text-center">
            <CardContent className="space-y-4">
              <div>
                <div>Claim Amount</div>
                <div className="font-bold text-blue-500">
                  {pendingToken} Token
                </div>
              </div>
              <div className="space-y-1">
                {/*<p>Amount to Stake</p>*/}

                <div>Claim MetaNode Token</div>
                {/*<div className="flex items-center justify-end">
                  <Input
                    value={claimValue}
                    onChange={(e) => {
                      setClaimValue(e.target.value)
                    }}
                  />
                  <span className="ml-2">Token</span>
                </div>*/}
                <Button onClick={handleClaim} disabled={loading}>
                  Claim
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-6 text-center">
            <CardContent className="space-y-4">
              <div>
                <div>My {metaNodeInfo.name}</div>
              </div>
              <div className="mt-3 space-y-1">
                <div>Balance</div>
                <div className="font-bold text-blue-500">
                  {metaNodeInfo.balance} {metaNodeInfo.symbol}
                </div>
                <Button
                  onClick={handleGetMyMetaNodeToken}
                  disabled={loading}
                  className="mt-2"
                >
                  <RotateCw className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
