"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import {
  useAccount,
  useBalance,
  useConfig,
  useWatchContractEvent,
  // useEnsName
  // useTransactionCount
} from "wagmi"
import { parseEther, formatEther } from "ethers"
import {
  getBalance,
  sendTransaction,
  readContract,
  readContracts,
  writeContract,
} from "wagmi/actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { useCallback, useState } from "react"
import { SpinnerOverlay } from "@/components/ui/spinner-overlay"
import { formatTime } from "@/lib/formatTime"
import MyERC20 from "@/lib/contracts/MyERC20.json"
// const ACCOUNT1_ADDRESS = "0x738a73250D686F6A79200a8A9a64e32ed9A9CEda"
const ACCOUNT2_ADDRESS = "0xBAFdb5801EA302aA7d28704c4db470217D321593"
const MY_ERC20_ADDRESS = "0xc6f1c35b7764916bfb8c89c001f06cb02b1e7721"

export default function WagmiPage() {
  const config = useConfig()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  // const { data: EnsName, error, status } = useEnsName({ address })

  const [loading, setLoading] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [searchRes, setSearchRes] = useState("")
  const [sendETHAddress, setSendETHAddress] = useState<string>(ACCOUNT2_ADDRESS)
  const [sendETHAmount, setSendETHAmount] = useState<string>("0.1")
  const [sendETHMsg, setsendETHMsg] = useState("")
  const [searchERC20ContractAddress, setSearchERC20ContractAddress] =
    useState(MY_ERC20_ADDRESS)
  const [myERC20, setMyERC20] = useState<any>(null)
  const [contractMsg, setContractMsg] = useState<any>({
    name: "",
    symbol: "",
    totalSupply: 0,
  })
  const [searchERC20UserAddress, setSearchERC20UserAddress] =
    useState(ACCOUNT2_ADDRESS)
  const [searchERC20Res, setSearchERC20Res] = useState("")
  const [sendERC20Address, setSendERC20Address] = useState(ACCOUNT2_ADDRESS)
  const [sendERC20Amount, setSendERC20Amount] = useState("0.1")
  const [sendERC20Msg, setSendERC20Msg] = useState("")
  const [myERC20Events, setMyERC20Events] = useState<
    { date: string; msg: string }[]
  >([])
  const [isListening, setIsListening] = useState(false)

  useWatchContractEvent({
    address: searchERC20ContractAddress as `0x${string}`,
    abi: MyERC20.abi,
    eventName: "Transfer",
    enabled: isListening && !!searchERC20ContractAddress,
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs) {
      console.log("New logs!", logs)
      setMyERC20Events((cur) => [
        ...cur,
        ...logs.map((log: any) => ({
          date: formatTime(new Date()),
          msg: `${log.args.from} 转账给 ${log.args.to} ${formatEther(log.args.amount)}`,
        })),
      ])
    },
    onError(error) {
      console.error("watch Transfer error: ", error)
    },
  })

  // Get SepoliaETH
  const handleSearchBalance = useCallback(async () => {
    try {
      if (!searchAddress) {
        return
      }
      setLoading(true)
      const res = await getBalance(config, {
        address: searchAddress as `0x${string}`,
      })
      console.log("res: ", res)
      setSearchRes(`Balance: ${formatEther(res.value)}${res.symbol}`)
    } catch (e) {
      console.error(e)
      setSearchRes("Get failed")
    } finally {
      setLoading(false)
    }
  }, [config, searchAddress])

  // Send SepoliaETH
  const handleSendSepoliaETH = useCallback(async () => {
    try {
      if (!sendETHAddress || !sendETHAmount) {
        return
      }
      setLoading(true)
      const hash = await sendTransaction(config, {
        to: sendETHAddress as `0x${string}`,
        value: parseEther(sendETHAmount),
      })
      setsendETHMsg(`Transaction successfully, hash: ${hash}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [config, sendETHAddress, sendETHAmount])

  const handleLinkToContract = useCallback(async () => {
    try {
      if (!searchERC20ContractAddress) {
        return
      }
      setLoading(true)
      const contractInfo = {
        address: MY_ERC20_ADDRESS,
        abi: MyERC20.abi,
      }
      const [nameRes, symbolRes, totalSupplyRes] = await readContracts(config, {
        contracts: [
          {
            ...contractInfo,
            functionName: "name",
          },
          {
            ...contractInfo,
            functionName: "symbol",
          },
          {
            ...contractInfo,
            functionName: "totalSupply",
          },
        ],
      })
      setContractMsg({
        name: nameRes?.result ?? "",
        symbol: symbolRes?.result ?? "",
        totalSupply: totalSupplyRes?.result
          ? formatEther(totalSupplyRes?.result ?? 0)
          : 0,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [config, searchERC20ContractAddress])

  // Get ERC20 balanceOf
  const handleSearchERC20Balance = useCallback(async () => {
    try {
      if (!searchERC20ContractAddress || !searchERC20UserAddress) {
        return
      }
      setLoading(true)
      const result = await readContract(config, {
        abi: MyERC20.abi,
        address: searchERC20ContractAddress as `0x${string}`,
        functionName: "balanceOf",
        args: [searchERC20UserAddress as `0x${string}`],
        // account: searchERC20UserAddress,
      })
      console.log("result: ", result)
      setSearchERC20Res(`Balance: ${formatEther(result as bigint)}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [config, searchERC20ContractAddress, searchERC20UserAddress])

  const handleListeningContractTransfer = useCallback(() => {
    if (!searchERC20ContractAddress) {
      return
    }
    setMyERC20Events([])
    setIsListening(true)
  }, [searchERC20ContractAddress])

  const handleUnwatch = useCallback(() => {
    setMyERC20Events([])
    setIsListening(false)
  }, [])

  // Send ERC20 transfer
  const handleSendERC20TOken = useCallback(async () => {
    try {
      if (
        !searchERC20ContractAddress ||
        !sendERC20Address ||
        !sendERC20Amount
      ) {
        return
      }
      setLoading(true)
      const hash = await writeContract(config, {
        abi: MyERC20.abi,
        address: searchERC20ContractAddress as `0x${string}`,
        functionName: "transfer",
        args: [sendERC20Address as `0x${string}`, parseEther(sendERC20Amount)],
        account: address,
      })
      console.log("hash: ", hash)
      setSendERC20Msg(
        `Submission successful. Please wait for it to be uploaded to the chain! Hash: ${hash}`
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [
    address,
    config,
    searchERC20ContractAddress,
    sendERC20Address,
    sendERC20Amount,
  ])

  return (
    <div className="">
      <SpinnerOverlay loading={loading} className="h-10 w-10">
        <div>{` `}</div>
      </SpinnerOverlay>
      <ConnectButton label="Connect" />
      {isConnected && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <p>Address: {address}</p>
            <p>
              Balance: {balance?.formatted} {balance?.symbol}
            </p>
            {/*<div>EnsName: {EnsName}</div>*/}
          </div>

          {/* Search */}
          <Card className="mt-4 w-full">
            {/*<CardHeader>
              <CardTitle>Search Sepolia ETH Balance</CardTitle>
            </CardHeader>*/}
            <CardContent>
              <Input
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Address"
              />
              <div className="mt-2 font-bold">{searchRes}</div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSearchBalance} disabled={loading}>
                Get Sepolia ETH Balance
              </Button>
            </CardFooter>
          </Card>

          {/* Send SepoliaETH */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Send SepoliaETH</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={sendETHAddress}
                onChange={(e) => setSendETHAddress(e.target.value)}
                placeholder="To Address"
              />
              <Input
                className="mt-2"
                value={sendETHAmount}
                onChange={(e) => setSendETHAmount(e.target.value)}
                placeholder="Amount"
              />
              {sendETHMsg && <div className="mt-2 font-bold">{sendETHMsg}</div>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendSepoliaETH} disabled={loading}>
                Send
              </Button>
            </CardFooter>
          </Card>

          {/* Search ERC20 Balance */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>ERC20</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">Contract Address</div>
              <Input
                value={searchERC20ContractAddress}
                onChange={(e) => setSearchERC20ContractAddress(e.target.value)}
                placeholder="Contract Address"
              />
              {contractMsg.name && (
                <>
                  <div className="mt-2">Contract: {contractMsg.name}</div>
                  <div>
                    Total Supply: {contractMsg.totalSupply} $
                    {contractMsg.symbol}
                  </div>
                </>
              )}
              <Button
                className="mt-2"
                onClick={handleLinkToContract}
                disabled={loading}
              >
                Get Contract Information
              </Button>

              <hr className="mt-8 mb-8" />
              <p>Get ERC20 Balance</p>
              <Input
                className="mt-2"
                value={searchERC20UserAddress}
                onChange={(e) => setSearchERC20UserAddress(e.target.value)}
                placeholder="User Address"
              />
              {searchERC20Res && (
                <div className="mt-2 font-bold">{searchERC20Res}</div>
              )}
              <Button
                className="mt-2"
                onClick={handleSearchERC20Balance}
                disabled={loading}
              >
                Search
              </Button>
              <hr className="mt-8 mb-8" />
              <p className="mb-2">Listening Contract Transfer Event</p>
              <Button onClick={handleListeningContractTransfer}>
                Listening
              </Button>
              <Button className="ml-2" onClick={handleUnwatch}>
                Cancel Listening
              </Button>
              {isListening && (
                <div className="mt-2">The Transfer event is listening...</div>
              )}
              <ul>
                {myERC20Events.map(({ date, msg }, index) => (
                  <li
                    key={`index_${index}`}
                    className="mb-1 flex text-orange-500"
                  >
                    <div className="pr-2 font-bold">{date}:</div>
                    <div className="flex-1">{msg}</div>
                  </li>
                ))}
              </ul>

              <hr className="mt-8 mb-8" />
              <p className="mb-2">Send ERC20 Token</p>
              <Input
                value={sendERC20Address}
                onChange={(e) => setSendERC20Address(e.target.value)}
                placeholder="To Address"
              />
              <div className="mt-2 mb-2">Amount</div>
              <Input
                value={sendERC20Amount}
                onChange={(e) => setSendERC20Amount(e.target.value)}
                placeholder="Amount"
              />
              <Button
                className="mt-2"
                onClick={handleSendERC20TOken}
                disabled={loading}
              >
                Send
              </Button>
              {sendERC20Msg && (
                <div className="mt-2 font-bold">{sendERC20Msg}</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
