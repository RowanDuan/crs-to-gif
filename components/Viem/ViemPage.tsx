"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import * as React from "react"

import {
  parseEther,
  // formatEther
} from "ethers"
import { toast } from "sonner"
import {
  createPublicClient,
  createWalletClient,
  custom,
  // http,
  formatEther,
  getContract,
} from "viem"
import {
  // mainnet,
  sepolia,
} from "viem/chains"

// import { fetchBlockNumber } from "@/app/viem/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import MyERC20 from "@/lib/contracts/MyERC20.json"
import { formatTime } from "@/lib/formatTime"

// const ALCHEMY_SEPOLIA_URL = "" // alchemy sepolia
const ACCOUNT2_ADDRESS = "0xBAFdb5801EA302aA7d28704c4db470217D321593"
const MY_ERC20_ADDRESS = "0xc6f1c35b7764916bfb8c89c001f06cb02b1e7721"

export default function ViemPage() {
  // 链接 Sepolia 测试网, 通过 Alchemy API Key
  // const clientSepolia = useMemo(() => {
  //   return createPublicClient({
  //     chain: sepolia,
  //     // transport: custom(window.ethereum), // 通过 MetaMask 的 RPC
  //     transport: http(ALCHEMY_SEPOLIA_URL), // 通过 Alchemy API Key
  //   })
  // }, [])

  const [publicClientSepolia, setPublicClientSepolia] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  // const [blockNumber, setBlockNumber] = useState<string | null>(null)
  const [walletClient, setWalletClient] = useState<any>(null)
  const [walletMsg, setWalletMsg] = useState<any>({
    address: "",
    balance: 0,
  })
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
  const unwatchTransferRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      unwatchTransferRef.current?.()
    }
  }, [])

  // const handleGetBalance = useCallback(async () => {
  //   try {
  //     setLoading(true)
  //     setBlockNumber(null)
  //     // 使用测试网 provider 查询各种信息
  //     // 查询区块
  //     const res = await clientSepolia.getBlockNumber()
  //     // 查询测试网余额
  //     const balance = await clientSepolia.getBalance({
  //       address: ACCOUNT2_ADDRESS,
  //     })
  //     setBlockNumber(res.toString())
  //     console.log("balance: ", formatEther(balance))
  //
  //     // 服务端
  //     // const result = await fetchBlockNumber()
  //     // setBlockNumber(result)
  //     // console.log("blockNumber: ", result)
  //   } catch (e) {
  //     console.error(e)
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [clientSepolia])

  // const handleLinkWallet2 = useCallback(async () => {
  //   try {
  //     if (typeof window === "undefined" || !window.ethereum) {
  //       toast("请安装 MetaMask")
  //       return
  //     }
  //     setLoading(true)
  //
  //     // 链接钱包 方式1
  //     // 等价于 new BrowserProvider(window.ethereum)
  //     const wallet = createWalletClient({
  //       chain: sepolia,
  //       transport: custom(window.ethereum),
  //     })
  //     // 等价于 provider.send("eth_requestAccounts", [])
  //     const add2 = await wallet.requestAddresses()
  //     const addresses = await wallet.getAddresses()
  //     console.log("add2: ", add2)
  //     console.log("addresses: ", addresses)
  //   } catch (e) {
  //     console.error(e)
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [])

  const handleLinkWallet = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        toast("请安装 MetaMask")
        return
      }
      setLoading(true)

      // 链接 Sepolia Provider
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: custom(window.ethereum), // 通过 MetaMask 的 RPC
      })
      setPublicClientSepolia(publicClient)

      // 链接钱包 方式2
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      console.log("account: ", account)
      const wallet = createWalletClient({
        account,
        chain: sepolia,
        transport: custom(window.ethereum),
      })
      const [address] = await wallet.getAddresses()
      const [address2] = await wallet.requestAddresses()
      // const balance = await wallet.getBalance({
      //   address,
      // }) // 错误，viem中的钱包没有查询余额功能，需要通过 client 查询
      console.log("address: ", address)
      console.log("address2: ", address2)

      // 查询钱包余额
      const balance = await publicClient.getBalance({
        address,
      })
      console.log("balance: ", balance)
      setWalletMsg({
        address,
        balance: formatEther(balance),
      })
      setWalletClient(wallet)
      setSearchAddress(address)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearchBalance = useCallback(async () => {
    try {
      if (!searchAddress) {
        return
      }
      setLoading(true)
      const balance = await publicClientSepolia.getBalance({
        address: searchAddress,
      })
      setSearchRes(`Balance: ${formatEther(balance)} SepoliaETH`)
    } catch (e) {
      console.error(e)
      setSearchRes("Search failed!")
    } finally {
      setLoading(false)
    }
  }, [publicClientSepolia, searchAddress])

  const handleSendSepoliaETH = useCallback(async () => {
    try {
      if (!sendETHAddress || !sendETHAmount) {
        return
      }
      setLoading(true)
      setsendETHMsg("")
      const hash = await walletClient.sendTransaction({
        // const receipt = await walletClient.sendTransactionSync({
        // account: "",
        to: sendETHAddress,
        value: parseEther(sendETHAmount),
      })
      console.log("hash: ", hash)
      // console.log("receipt: ", receipt)
      setsendETHMsg(`Transaction successfully, hash: ${hash}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [sendETHAddress, sendETHAmount, walletClient])

  const handleLinkToContract = useCallback(async () => {
    try {
      setLoading(true)
      const myContract: any = getContract({
        address: searchERC20ContractAddress as `0x${string}`,
        abi: MyERC20.abi,
        client: {
          public: publicClientSepolia,
          wallet: walletClient,
        },
      })
      // const name = await myContract.read.name()
      // const symbol = await myContract.read.symbol()
      // const totalSupply = await myContract.read.totalSupply()
      const [name, symbol, totalSupply] = await Promise.all([
        myContract.read.name(),
        myContract.read.symbol(),
        myContract.read.totalSupply(),
      ])
      console.log("totalSupply: ", totalSupply)
      console.log("symbol: ", symbol)
      console.log("name: ", name)
      setMyERC20(myContract)
      setContractMsg({
        name,
        symbol,
        totalSupply: `${formatEther(totalSupply)} ${symbol}`,
      })

      unwatchTransferRef.current?.()
      setMyERC20Events([])

      // watchEvent 需要两个参数：事件过滤条件 + 监听选项
      unwatchTransferRef.current = myContract.watchEvent.Transfer(
        {},
        {
          onLogs: (logs: any[]) => {
            console.log("logs: ", logs)
            setMyERC20Events((cur) => [
              ...cur,
              ...logs.map((log: any) => ({
                date: formatTime(new Date()),
                msg: `${log.args.from} 转账给 ${log.args.to} ${formatEther(log.args.amount)} ${symbol}`,
              })),
            ])
          },
          onError: (error: Error) => {
            console.error("watch Transfer error: ", error)
          },
        }
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [publicClientSepolia, searchERC20ContractAddress, walletClient])

  const handleSearchERC20Balance = useCallback(async () => {
    try {
      if (!searchERC20UserAddress) {
        return
      }
      setLoading(true)
      const balance = await myERC20.read.balanceOf([searchERC20UserAddress])
      console.log("balance: ", formatEther(balance))
      setSearchERC20Res(
        `Balance: ${formatEther(balance)} ${contractMsg.symbol}`
      )
    } catch (e) {
      console.error(e)
      setSearchERC20Res("Search failed!")
    } finally {
      setLoading(false)
    }
  }, [myERC20, searchERC20UserAddress, contractMsg.symbol])

  const handleSendERC20TOken = useCallback(async () => {
    try {
      if (!sendERC20Address || !sendERC20Amount || !myERC20) {
        return
      }
      setLoading(true)
      setSendERC20Msg("")

      // 等价于 ethers:
      // const tx = await myERC20.transfer(to, amount)
      // await tx.wait()
      const hash = await myERC20.write.transfer([
        sendERC20Address as `0x${string}`,
        parseEther(sendERC20Amount),
      ])
      console.log("hash: ", hash)

      const receipt = await publicClientSepolia.waitForTransactionReceipt({
        hash,
      })
      console.log("receipt: ", receipt)
      setSendERC20Msg(
        `Transfer successfully! Block: ${receipt.blockNumber}, Hash: ${hash}`
      )
    } catch (e) {
      console.error(e)
      setSendERC20Msg("Transaction failed!")
    } finally {
      setLoading(false)
    }
  }, [myERC20, sendERC20Address, sendERC20Amount, publicClientSepolia])

  return (
    <div className="w-full max-w-[800px]">
      <div className="mb-2 h-6 w-6">
        {loading && <Spinner className="size-6" />}
      </div>
      {/*<Button onClick={handleGetBalance} disabled={loading}>
        Get Balance
      </Button>
      {blockNumber && (
        <p className="text-muted-foreground mt-4 text-sm">
          Block Number: {blockNumber}
        </p>
      )}*/}
      {!walletClient ? (
        <Button onClick={handleLinkWallet} disabled={loading}>
          Link Wallet
        </Button>
      ) : (
        <>
          <div className="mt-2">
            <div>Link to wallet successfully！</div>
            <div>Address: {walletMsg.address}</div>
            <div>Balance: {walletMsg.balance} SepoliaETH</div>
          </div>

          {/* Search Sepolia Balance */}
          <Card className="mt-4 w-full">
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
          <Card className="mt-4 w-full">
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

          {/* Contract */}
          <Card className="mt-8 w-full">
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
              <Button
                className="mt-2"
                onClick={handleLinkToContract}
                disabled={loading}
              >
                Link to Contract
              </Button>

              {myERC20 && (
                <>
                  <div className="mt-2">Link to contract successfully!</div>
                  <div>Contract: {contractMsg.name}</div>
                  <div>
                    Total Supply: {contractMsg.totalSupply} $
                    {contractMsg.symbol}
                  </div>
                  <div>The Transfer event is listening...</div>
                  {myERC20Events.length > 0 && (
                    <div className="pl-4">
                      <p className="font-bold">Transfer Events:</p>
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
                    </div>
                  )}

                  <hr className="mt-2" />
                  <Input
                    className="mt-6"
                    value={searchERC20UserAddress}
                    onChange={(e) => setSearchERC20UserAddress(e.target.value)}
                    placeholder="User Address"
                  />
                  <Button
                    className="mt-2"
                    onClick={handleSearchERC20Balance}
                    disabled={loading}
                  >
                    Get ERC20 Balance
                  </Button>
                  {searchERC20Res && (
                    <div className="mt-2 font-bold">{searchERC20Res}</div>
                  )}
                  <div className="mt-6 mb-2">User Address</div>

                  {/* Send ERC20 Token */}
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
                    Send ERC20 Token
                  </Button>
                  {sendERC20Msg && (
                    <div className="mt-2 font-bold">{sendERC20Msg}</div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
