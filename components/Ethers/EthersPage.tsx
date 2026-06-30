"use client"

import { useState, useCallback, ReactNode } from "react"
import * as React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { ethers, BrowserProvider, parseEther, formatEther } from "ethers"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { SpinnerOverlay } from "@/components/ui/spinner-overlay"
import { formatTime } from "@/lib/formatTime"

const formSchema = z.object({
  address: z.string().min(1, "请输入地址"),
  amount: z.string().min(1, "请输入金额"),
})

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider
  }
}
type TransferFormValues = z.infer<typeof formSchema>

import MyERC20 from "./MyERC20.json"
const ACCOUNT1_ADDRESS = "0x738a73250D686F6A79200a8A9a64e32ed9A9CEda"
const ACCOUNT2_ADDRESS = "0xBAFdb5801EA302aA7d28704c4db470217D321593"
const MY_ERC20_ADDRESS = "0xc6f1c35b7764916bfb8c89c001f06cb02b1e7721"

const transferFields: {
  name: keyof TransferFormValues
  label: string
  placeholder: string
}[] = [
  { name: "address", label: "To Address", placeholder: "" },
  { name: "amount", label: "Amount", placeholder: "" },
]

const EthersPage = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [provider, setProvider] = useState<any>(null)
  const [walletSigner, setWalletSigner] = useState<any>(null)
  const [walletMsg, setWalletMsg] = useState({
    address: "",
    balance: "",
    transactionCount: 0,
  })
  const [searchAddress, setSearchAddress] = useState("")
  const [searchRes, setSearchRes] = useState("")
  const [searchERC20Res, setSearchERC20Res] = useState<ReactNode>("")
  const [searchERC20ContractAddress, setSearchERC20ContractAddress] =
    useState(MY_ERC20_ADDRESS)
  const [searchERC20UserAddress, setSearchERC20UserAddress] =
    useState(ACCOUNT2_ADDRESS) // Account 2
  const [isERC20Listening, setIsERC20Listening] = useState(false)
  const [myERC20Events, setMyERC20Events] = useState<any[]>([])
  const [myERC20, setMyERC20] = useState<any>(null)
  const [myERC20Msg, setMyERC20Msg] = useState({
    name: "",
    symbol: "",
    totalSupply: "",
  })
  const [sendERC20Address, setSendERC20Address] = useState(ACCOUNT2_ADDRESS)
  const [sendERC20Amount, setSendERC20Amount] = useState("1")

  const form = useForm<TransferFormValues>({
    // @hookform/resolvers 类型尚未完全适配 zod v4，运行时正常
    resolver: zodResolver(formSchema as never),
    defaultValues: {
      address: ACCOUNT2_ADDRESS, // Account 2
      amount: "0.1",
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const handleLinkWallet = useCallback(async () => {
    // const providerSepolia = await new ethers.JsonRpcProvider(
    //   ALCHEMY_SEPOLIA_URL
    // )
    if (typeof window === "undefined" || !window.ethereum) {
      toast("请安装 MetaMask")
      return
    }
    setLoading(true)
    const provider = new BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const balance = await provider.getBalance(address)
    const transactionCount = await provider.getTransactionCount(address)
    setProvider(provider)
    setWalletSigner(signer)
    setWalletMsg({
      address,
      balance: formatEther(balance),
      transactionCount,
    })
    setSearchAddress(address)
    setLoading(false)
  }, [])

  const handleSearchBalance = useCallback(async () => {
    try {
      setLoading(true)
      if (provider && searchAddress) {
        const balance = await provider.getBalance(searchAddress)
        console.log("balance: ", balance)
        setSearchRes(`Balance: ${formatEther(balance)} Sepolia ETH`)
      }
    } catch (e) {
      console.error(e)
      setSearchRes("Search failed!")
    } finally {
      setLoading(false)
    }
  }, [provider, searchAddress])

  const onSubmit = useCallback(
    async (data: TransferFormValues) => {
      try {
        console.log("data: ", data)
        setLoading(true)
        const { address, amount } = data
        const tx = await walletSigner.sendTransaction({
          to: address,
          value: parseEther(amount),
        })
        console.log("tx: ", tx)
        await tx.wait()
        toast("Successfully!")
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
      // toast("You submitted the following values:", {
      //   description: (
      //     <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
      //       <code>{JSON.stringify(data, null, 2)}</code>
      //     </pre>
      //   ),
      //   position: "bottom-right",
      //   classNames: {
      //     content: "flex flex-col gap-2",
      //   },
      //   style: {
      //     "--border-radius": "calc(var(--radius)  + 4px)",
      //   } as React.CSSProperties,
      // })
    },
    [walletSigner]
  )

  const handleLinkToContract = useCallback(async () => {
    try {
      if (!searchERC20ContractAddress) {
        return
      }
      setLoading(true)
      // Link to contract
      const contract = new ethers.Contract(
        searchERC20ContractAddress,
        MyERC20.abi,
        walletSigner
      )
      const name = await contract.name()
      const symbol = await contract.symbol()
      const totalSupply = await contract.totalSupply()
      await contract.on("Transfer", (from, to, amount) => {
        console.log("from: ", from)
        console.log("to: ", to)
        console.log("amount: ", amount)
        setMyERC20Events((cur) => {
          return [
            ...cur,
            {
              date: formatTime(new Date()),
              msg: `${from} 转账给 ${to} ${formatEther(amount)} ${symbol}`,
            },
          ]
        })
      })
      // Save contract information
      setMyERC20(contract)
      setMyERC20Msg({
        name,
        symbol,
        totalSupply: formatEther(totalSupply),
      })
      setIsERC20Listening(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [searchERC20ContractAddress, walletSigner])

  const handleSearchERC20Balance = useCallback(async () => {
    try {
      if (!searchERC20UserAddress) {
        return
      }
      setLoading(true)
      const balance = await myERC20.balanceOf(searchERC20UserAddress)
      setSearchERC20Res(`Balance: ${formatEther(balance)} ${myERC20Msg.symbol}`)
    } catch (e) {
      console.error(e)
      setSearchERC20Res("Search failed!")
    } finally {
      setLoading(false)
    }
  }, [myERC20, myERC20Msg.symbol, searchERC20UserAddress])

  const handleSendERC20TOken = useCallback(async () => {
    try {
      if (!sendERC20Address || !sendERC20Amount) {
        return
      }
      setLoading(true)
      const tx = await myERC20.transfer(
        sendERC20Address,
        parseEther(sendERC20Amount)
      )
      console.log("tx: ", tx)
      await tx.wait()
      setLoading(true)
      toast("Transfer Successfully!")
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [myERC20, sendERC20Address, sendERC20Amount])

  return (
    <div className="w-full max-w-[800px]">
      <SpinnerOverlay loading={loading} className="h-10 w-10">
        <div>{` `}</div>
      </SpinnerOverlay>
      {/* <Button>链接钱包（ETH Sepolia 测试网）</Button> */}
      {!walletSigner ? (
        <Button onClick={handleLinkWallet} disabled={loading}>
          Link to Wallet
        </Button>
      ) : (
        <div>
          <div>Link to wallet successfully!</div>
          <div className="mt-2">Address: {walletMsg.address}</div>
          <div>Balance: {walletMsg.balance} Sepolia ETH</div>
          <div>Transaction Count: {walletMsg.transactionCount}</div>

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

          {/* Transfer */}
          <Card className="mt-4 w-full">
            <CardHeader>
              <CardTitle>Transfer Sepolia ETH</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="form-rhf-demo" onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  {transferFields.map(({ name, label, placeholder }) => (
                    <Field key={name} data-invalid={!!errors[name]}>
                      <FieldLabel htmlFor={name}>{label}</FieldLabel>
                      <Input
                        id={name}
                        placeholder={placeholder}
                        autoComplete="off"
                        aria-invalid={!!errors[name]}
                        {...register(name)}
                      />
                      <FieldError errors={[errors[name]]} />
                    </Field>
                  ))}
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter>
              <Field orientation="horizontal">
                {/*<Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>*/}
                <Button type="submit" form="form-rhf-demo" disabled={loading}>
                  Send Sepolia ETH
                </Button>
              </Field>
            </CardFooter>
          </Card>

          {/* Search ERC20 Balance */}
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

              {isERC20Listening && myERC20 && (
                <>
                  <div className="mt-2">Link to contract successfully!</div>
                  <div>Contract: {myERC20Msg.name}</div>
                  <div>
                    Total Supply: {myERC20Msg.totalSupply} ${myERC20Msg.symbol}
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
                  <div className="mt-2 font-bold">{searchERC20Res}</div>

                  <div className="mt-6 mb-2">User Address</div>
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
                    Send ERC20 Tokent
                  </Button>
                </>
              )}
            </CardContent>
            {/*<CardFooter>
              <Button onClick={handleSearchERC20Balance} disabled={loading}>
                Search
              </Button>
            </CardFooter>*/}
          </Card>
        </div>
      )}
    </div>
  )
}

export default EthersPage
