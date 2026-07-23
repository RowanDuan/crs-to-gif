import { useState, useCallback, memo } from "react"
import * as React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { parseEther, formatEther } from "ethers"
import { XIcon } from "lucide-react"
import { useMiniWallet } from "miniwallet"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { useConfig } from "wagmi"
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getAccount,
} from "wagmi/actions"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import {
  POSITION_MANAGER_ADDRESS,
  POSITION_MANAGER_CONTRACT_QUERY,
} from "@/lib/contracts/metaNodeSwap/contractsInfo"
import { MN_TOKEN_ABI } from "@/lib/contracts/metaNodeSwap/mnTokenAbi"
import { Address, PoolItem } from "@/lib/contracts/metaNodeSwap/types"
import { getPairedAmountByPosition } from "@/lib/contracts/metaNodeSwap/utils"

const formSchema = z.object({
  token0Amount: z.string().min(1, "Please input"),
  token1Amount: z.string().min(1, "Please input"),
})
type FormValues = z.infer<typeof formSchema>

function PositionModal({
  closeModal,
  poolPosition,
}: {
  poolPosition: PoolItem
  closeModal: () => void
}) {
  const config = useConfig()
  const { account } = useMiniWallet()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as never),
    defaultValues: {
      token0Amount: "0",
      token1Amount: "0",
    },
  })

  const {
    control,
    handleSubmit,
    setValue,
    // getValues,
    // formState: { errors },
  } = form
  console.log("poolPosition: ", poolPosition)

  const getPositionAmountParams = useCallback(() => {
    return {
      token0: poolPosition.token0,
      token1: poolPosition.token1,
      feeAmount: poolPosition.fee,
      currentPrice: poolPosition.currentPrice,
      liquidity: poolPosition.liquidity,
      tick: poolPosition.tick,
      tickLower: poolPosition.tickLower,
      tickUpper: poolPosition.tickUpper,
    }
  }, [poolPosition])

  const syncToken1FromToken0 = useCallback(
    (token0Amount: string) => {
      try {
        if (!token0Amount || Number(token0Amount) <= 0) {
          setValue("token1Amount", "0")
          return
        }
        const amount1Wei = getPairedAmountByPosition({
          ...getPositionAmountParams(),
          amount: parseEther(token0Amount).toString(),
          inputToken: 0,
        })
        setValue("token1Amount", formatEther(amount1Wei))
      } catch (e) {
        console.error(e)
        toast.error(e instanceof Error ? e.message : "Calculate amount failed")
        setValue("token1Amount", "0")
      }
    },
    [getPositionAmountParams, setValue]
  )

  const syncToken0FromToken1 = useCallback(
    (token1Amount: string) => {
      try {
        if (!token1Amount || Number(token1Amount) <= 0) {
          setValue("token0Amount", "0")
          return
        }
        const amount0Wei = getPairedAmountByPosition({
          ...getPositionAmountParams(),
          amount: parseEther(token1Amount).toString(),
          inputToken: 1,
        })
        setValue("token0Amount", formatEther(amount0Wei))
      } catch (e) {
        console.error(e)
        toast.error(e instanceof Error ? e.message : "Calculate amount failed")
        setValue("token0Amount", "0")
      }
    },
    [getPositionAmountParams, setValue]
  )

  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        console.log("data: ", data)
        setLoading(true)
        const { token0, token1, index } = poolPosition
        const amount0Desired = parseEther(data.token0Amount)
        const amount1Desired = parseEther(data.token1Amount)

        // MiniWallet 的 account 只用于 UI；真正扣款的是 wagmi 签名地址（msg.sender）
        const payer = account as Address
        const signer = getAccount(config).address
        console.log("miniWallet account:", payer)
        console.log("wagmi signer (msg.sender):", signer)

        if (!payer) {
          toast("请先连接 MiniWallet")
          return
        }
        if (!signer) {
          toast("Wagmi 未连接签名钱包，请刷新后重新连接")
          return
        }
        if (signer.toLowerCase() !== payer.toLowerCase()) {
          toast(
            `签名地址 ${signer.slice(0, 6)}...${signer.slice(-4)} 与当前账户不一致。请在钱包扩展中切换到 ${payer}`
          )
          return
        }

        // mintCallback 会 transferFrom(msg.sender)，需先授权 PositionManager
        for (const [token, amount] of [
          [token0, amount0Desired],
          [token1, amount1Desired],
        ] as const) {
          const allowance = (await readContract(config, {
            address: token as Address,
            abi: MN_TOKEN_ABI,
            functionName: "allowance",
            args: [payer, POSITION_MANAGER_ADDRESS],
          })) as bigint
          if (allowance < amount) {
            const approveHash = await writeContract(config, {
              address: token as Address,
              abi: MN_TOKEN_ABI,
              functionName: "approve",
              args: [POSITION_MANAGER_ADDRESS, amount],
              account: payer,
            })
            await waitForTransactionReceipt(config, { hash: approveHash })
          }
        }

        const query = {
          token0: token0 as Address,
          token1: token1 as Address,
          index,
          amount0Desired,
          amount1Desired,
          recipient: payer,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // Unix 时间戳，20分钟后
        }
        console.log("query: ", query)

        const hash = await writeContract(config, {
          ...POSITION_MANAGER_CONTRACT_QUERY,
          functionName: "mint",
          args: [query],
          account: payer,
        })
        console.log("hash: ", hash)
        const receipt = await waitForTransactionReceipt(config, {
          hash,
        })
        toast("Add position successfully!")
        console.log("receipt: ", receipt)
        closeModal()
      } catch (e) {
        console.error(e)
        toast.error(e instanceof Error ? e?.message : "Add position failed")
      } finally {
        setLoading(false)
      }
    },
    [account, config, poolPosition]
  )

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 z-20 bg-[rgba(0,0,0,0.5)]">
      <div
        // className="absolute top-0 left-0 flex h-auto w-[600px] flex-col gap-3 rounded-3xl bg-white p-6"
        className="absolute top-1/2 left-1/2 flex h-auto w-[580px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-3xl bg-white p-6"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xl font-bold">Add Position</span>
          <button
            type="button"
            aria-label="Close"
            className="cursor-pointer rounded-full p-1 hover:bg-gray-100"
            onClick={closeModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="relative w-full space-y-6">
          <form
            id="pool-form"
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit, (errs) => {
              console.log("form errors: ", errs)
            })}
          >
            <div>
              <p className="mb-2 text-lg font-medium text-black">
                Token Amount
              </p>
              <div className="space-y-2">
                <Controller
                  name="token0Amount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {/*<FieldLabel>Token0</FieldLabel>*/}
                      <InputGroup className="py-6">
                        <InputGroupAddon>
                          <div className="rounded-[6px] bg-blue-100 px-3 py-2">
                            {poolPosition.token0Symbol}
                          </div>
                        </InputGroupAddon>
                        <InputGroupInput
                          name={field.name}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e)
                            syncToken1FromToken0(e.target.value)
                          }}
                          placeholder="Token0"
                          className="!text-xl text-black"
                        />
                        {field.value && (
                          <InputGroupAddon align="inline-end">
                            {/*<CircleXIcon className="cursor-pointer" />*/}
                            <XIcon
                              className="cursor-pointer"
                              onClick={() => {
                                setValue("token0Amount", "")
                                setValue("token1Amount", "0")
                              }}
                            />
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="token1Amount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {/*<FieldLabel>Token1</FieldLabel>*/}
                      <InputGroup className="py-6">
                        <InputGroupAddon>
                          <div className="rounded-[6px] bg-blue-100 px-3 py-2">
                            {poolPosition.token1Symbol}
                          </div>
                        </InputGroupAddon>
                        <InputGroupInput
                          name={field.name}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e)
                            syncToken0FromToken1(e.target.value)
                          }}
                          placeholder="Token1"
                          className="!text-xl text-black"
                        />
                        {field.value && (
                          <InputGroupAddon align="inline-end">
                            {/*<CircleXIcon className="cursor-pointer" />*/}
                            <XIcon
                              className="cursor-pointer"
                              onClick={() => {
                                setValue("token1Amount", "")
                                setValue("token0Amount", "0")
                              }}
                            />
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Card className="mt-4">
                <CardContent className="space-y-3">
                  {/*<CardHeader>123</CardHeader>*/}
                  <div>
                    <CardTitle>Fee:</CardTitle>
                    <CardDescription className="pl-2">
                      {poolPosition.feeFormat}
                    </CardDescription>
                  </div>
                  <div>
                    <CardTitle>Current Price:</CardTitle>
                    <CardDescription className="pl-2">
                      {poolPosition.currentPrice}
                    </CardDescription>
                  </div>
                  <div>
                    <CardTitle>Price Range:</CardTitle>
                    <CardDescription className="pl-2">
                      {poolPosition.lowerPrice} - {poolPosition.upperPrice}
                    </CardDescription>
                  </div>
                  {/*CardFooter,*/}
                </CardContent>
              </Card>
            </div>
            <div className="text-center">
              <Button
                type="submit"
                // size="lg"
                className="text-md !bg-blue-500 px-6 py-5"
                disabled={loading}
              >
                {/*<CheckIcon />*/}
                Submit
                {loading && <Spinner className="ml-1" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default memo(PositionModal)
