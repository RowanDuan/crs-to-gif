import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useMiniWallet } from "miniwallet"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useConfig } from "wagmi"
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
  readContract,
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
import { SpinnerOverlay } from "@/components/ui/spinner-overlay"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getTokenSymbol,
  MN_TOKEN_D_ADDRESS,
  MN_TOKEN_LIST,
  SWAP_ROUTER_ADDRESS,
  SWAP_ROUTER_CONTRACT_QUERY,
} from "@/lib/contracts/metaNodeSwap/contractsInfo"
import { getAllPools } from "@/lib/contracts/metaNodeSwap/queries"
import {
  Address,
  PoolItem,
  QuoteMode,
} from "@/lib/contracts/metaNodeSwap/types"
import { formatEther, parseEther } from "ethers"
import { TickMath } from "@uniswap/v3-sdk"
import { buildIndexPathFromPools } from "@/lib/contracts/metaNodeSwap/utils"
import { MN_TOKEN_ABI } from "@/lib/contracts/metaNodeSwap/mnTokenAbi"
import { toast } from "sonner"
import TokenBalance from "./TokenBalance"

const formSchema = z.object({
  token0: z.string().min(1, "Please select"),
  token1: z.string().min(1, "Please select"),
  token0Amount: z.string().min(1, "Please input"),
  token1Amount: z.string().min(1, "Please input"),
})

type FormValues = z.infer<typeof formSchema>

function Swap() {
  const config = useConfig()
  const { account } = useMiniWallet()
  const [loading, setLoading] = useState(false)
  const [quotingMode, setQuotingMode] = useState<QuoteMode | null>(null)
  const [pools, setPools] = useState<PoolItem[]>([])
  const [swapParams, setSwapParams] = useState<{
    mode: QuoteMode
    indexPath: number[]
    amountOutMinimum: bigint
  }>({
    mode: QuoteMode.ExactInput,
    indexPath: [],
    amountOutMinimum: BigInt(0),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as never),
    defaultValues: {
      token0: "",
      token1: "",
      token0Amount: "0",
      token1Amount: "0",
    },
  })

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = form

  const token0 = useWatch({ control, name: "token0" })
  const token1 = useWatch({ control, name: "token1" })

  const token0Symbol = useMemo(() => {
    if (!token0) return ""
    return getTokenSymbol(token0 as Address)
  }, [token0])

  const token1Symbol = useMemo(() => {
    if (!token1) return ""
    return getTokenSymbol(token1 as Address)
  }, [token1])

  const isExactOutputMode = useMemo(
    () => swapParams.mode === QuoteMode.ExactOutput,
    [swapParams.mode]
  )

  const isExactInputMode = useMemo(
    () => swapParams.mode === QuoteMode.ExactInput,
    [swapParams.mode]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await getAllPools(config)
        if (!cancelled) setPools(list)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [config])

  const handleQuote = useCallback(
    async (amountRaw: string, mode: QuoteMode) => {
      try {
        const tokenIn = getValues("token0") as Address
        const tokenOut = getValues("token1") as Address
        if (!tokenIn || !tokenOut) return
        console.log("tokenIn: ", tokenIn)
        console.log("tokenOut: ", tokenOut)

        const indexPath = buildIndexPathFromPools(pools, tokenIn, tokenOut)
        if (!indexPath.length) {
          toast.error("No available pools for token pair")
          return "0"
        }

        const amount = parseEther(amountRaw)
        const zeroForOne = tokenIn.toLowerCase() < tokenOut.toLowerCase()
        const sqrtPriceLimitX96 = zeroForOne
          ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + BigInt(1)
          : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - BigInt(1)

        const res =
          mode === QuoteMode.ExactInput
            ? await simulateContract(config, {
                ...SWAP_ROUTER_CONTRACT_QUERY,
                functionName: "quoteExactInput",
                args: [
                  {
                    tokenIn,
                    tokenOut,
                    amountIn: amount,
                    indexPath,
                    sqrtPriceLimitX96,
                  },
                ],
              })
            : await simulateContract(config, {
                ...SWAP_ROUTER_CONTRACT_QUERY,
                functionName: "quoteExactOutput",
                args: [
                  {
                    tokenIn,
                    tokenOut,
                    amountOut: amount,
                    indexPath,
                    sqrtPriceLimitX96,
                  },
                ],
              })

        const quoted = (res?.result ?? BigInt(0)) as bigint
        // ExactInput：0.5% 滑点
        const amountOutMinimum =
          mode === QuoteMode.ExactInput
            ? (quoted * BigInt(9950)) / BigInt(10000)
            : BigInt(0)

        setSwapParams({
          mode,
          indexPath,
          amountOutMinimum,
        })
        return formatEther(quoted)
      } catch (e) {
        console.error(e)
        return "0"
      }
    },
    [config, getValues, pools]
  )

  const quoteTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const scheduleQuote = useCallback(
    (amountRaw: string, mode: QuoteMode) => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current)
      setQuotingMode(mode)
      quoteTimer.current = setTimeout(async () => {
        try {
          const target =
            mode === QuoteMode.ExactInput ? "token1Amount" : "token0Amount"
          if (!amountRaw || Number(amountRaw) <= 0) {
            setValue(target, "0")
            return
          }
          const quoted = await handleQuote(amountRaw, mode)
          if (quoted != null) setValue(target, quoted)
        } catch (e) {
          console.error(e)
        } finally {
          setQuotingMode(null)
        }
      }, 400)
    },
    [handleQuote, setValue]
  )

  const handleAmount0Change = useCallback(
    (value: string) => {
      if (token0 && token1) {
        scheduleQuote(value, QuoteMode.ExactInput)
      }
    },
    [scheduleQuote, token0, token1]
  )

  const handleAmount1Change = useCallback(
    (value: string) => {
      if (token0 && token1) {
        scheduleQuote(value, QuoteMode.ExactOutput)
      }
    },
    [scheduleQuote, token0, token1]
  )

  const handleCheckQuoteAmount = useCallback(() => {
    const token0Amount = getValues("token0Amount")
    const token1Amount = getValues("token1Amount")
    console.log("token0Amount: ", token0Amount)
    console.log("token1Amount: ", token1Amount)
    if (swapParams.mode === QuoteMode.ExactInput && Number(token0Amount) > 0) {
      scheduleQuote(token0Amount, QuoteMode.ExactInput)
      return
    }
    if (swapParams.mode === QuoteMode.ExactOutput && Number(token1Amount) > 0) {
      scheduleQuote(token1Amount, QuoteMode.ExactOutput)
    }
  }, [getValues, scheduleQuote, swapParams.mode])

  const handleToken0Change = useCallback(
    (value: string) => {
      setValue("token0", value, { shouldValidate: true, shouldDirty: true })
      const token1 = getValues("token1")
      if (token1) {
        if (token1.toLowerCase() === value.toLowerCase()) {
          setValue("token1", "", { shouldDirty: true })
          setValue("token1Amount", "0", { shouldDirty: true })
          return
        }
        handleCheckQuoteAmount()
      }
    },
    [getValues, handleCheckQuoteAmount, setValue]
  )

  const handleToken1Change = useCallback(
    (value: string) => {
      setValue("token1", value, { shouldValidate: true, shouldDirty: true })
      const token0 = getValues("token0")
      if (token0) {
        if (token0.toLowerCase() === value.toLowerCase()) {
          setValue("token0", "", { shouldDirty: true })
          setValue("token0Amount", "0", { shouldDirty: true })
          return
        }

        handleCheckQuoteAmount()
      }
    },
    [getValues, handleCheckQuoteAmount, setValue]
  )

  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        console.log("swapParams: ", swapParams)
        console.log("data: ", data)
        setLoading(true)
        const tokenIn = getValues("token0") as Address
        const tokenOut = getValues("token1") as Address
        const amountIn = parseEther(data.token0Amount)
        const recipient = account as Address
        if (isExactInputMode) {
          // Get allowance
          const allowance = await readContract(config, {
            address: tokenIn,
            abi: MN_TOKEN_ABI,
            functionName: "allowance",
            args: [recipient, SWAP_ROUTER_ADDRESS],
          })
          console.log("amountIn: ", amountIn)
          console.log("allowance: ", allowance)
          if (allowance < amountIn) {
            // Approve
            const approveHash = await writeContract(config, {
              address: tokenIn,
              abi: MN_TOKEN_ABI,
              functionName: "approve",
              args: [SWAP_ROUTER_ADDRESS, amountIn],
            })
            console.log("approveHash: ", approveHash)
            const approveReceipt = await waitForTransactionReceipt(config, {
              hash: approveHash,
            })
            console.log("approveReceipt: ", approveReceipt)
          }

          // zeroForOne：tokenIn < tokenOut 时价格下限用 MIN，否则用 MAX
          const zeroForOne = tokenIn.toLowerCase() < tokenOut.toLowerCase()
          const sqrtPriceLimitX96 = zeroForOne
            ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + BigInt(1)
            : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - BigInt(1)

          // Swap
          const query = {
            tokenIn,
            tokenOut,
            indexPath: swapParams.indexPath,
            recipient: recipient,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // Unix 时间戳，20分钟后
            amountIn,
            // 用 quote 结果做最小输出（已含滑点），切勿填 MAX_SQRT_RATIO
            amountOutMinimum: swapParams.amountOutMinimum, // TODO: 滑点
            sqrtPriceLimitX96,
          }
          console.log("exactInput query: ", query)
          const hash = await writeContract(config, {
            ...SWAP_ROUTER_CONTRACT_QUERY,
            functionName: "exactInput",
            args: [query],
          })
          const receipt = await waitForTransactionReceipt(config, { hash })
          console.log("receipt: ", receipt)
          toast.success("Swap successful")
        } else {
          // TODO
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [account, config, getValues, isExactInputMode, swapParams]
  )

  useEffect(() => {
    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current)
    }
  }, [])

  const handleMintMNT = useCallback(async () => {
    const hash = await writeContract(config, {
      address: MN_TOKEN_D_ADDRESS,
      abi: MN_TOKEN_ABI,
      functionName: "mint",
      args: [account as Address, parseEther("888888")],
      // value,
    })
    console.log("hash: ", hash)
    const receipt = await waitForTransactionReceipt(config, {
      hash,
    })
    console.log("receipt: ", receipt)
  }, [account, config])
  console.log(
    "888964798713646049502963: ",
    formatEther("888964798713646049502963")
  )

  return (
    <div className="mx-auto w-full max-w-[1200px] pt-8">
      <Button
        onClick={() => {
          handleQuote("0.1", QuoteMode.ExactInput)
        }}
      >
        handleQuoteExactInput
      </Button>
      <Button
        onClick={() => {
          handleQuote("0.001", QuoteMode.ExactOutput)
        }}
      >
        handleQuoteExactOutput
      </Button>
      <Button onClick={handleMintMNT}>handleMintMNT</Button>
      <h2 className="text-center text-3xl font-semibold">Swap</h2>
      <div className="mx-auto mt-4 flex h-auto w-[600px] flex-col gap-3 rounded-3xl bg-white px-8 py-12">
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
              <div className="space-y-4">
                <SpinnerOverlay loading={quotingMode === QuoteMode.ExactOutput}>
                  <div
                    className={`rounded-xl border border-gray-200 p-3 pl-1 ${
                      isExactOutputMode ? "bg-[#F7F8FA]" : "bg-white"
                    }`}
                  >
                    <div className="grid grid-cols-[1fr_100px] items-start gap-2">
                      <Controller
                        name="token0Amount"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            {/*<FieldLabel>Token0</FieldLabel>*/}
                            {/* SpinnerOverlay */}
                            <InputGroup className="border-none !ring-0">
                              {/*<InputGroupAddon className="px-0">
                              <div className="rounded-lg bg-blue-100 px-3 py-2">
                                {token0Symbol}
                              </div>
                            </InputGroupAddon>*/}
                              <InputGroupInput
                                name={field.name}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleAmount0Change(e.target.value)
                                }}
                                placeholder="Token0"
                                className="scale-y-120 !text-2xl font-semibold tracking-wide text-black"
                              />
                            </InputGroup>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name="token0"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            {/*<FieldLabel>Token0</FieldLabel>*/}
                            {/* key：清空时强制 remount，避免 Radix Select 受控/非受控切换警告 */}
                            <Select
                              key={field.value || "token0-empty"}
                              name={field.name}
                              value={field.value || undefined}
                              onValueChange={handleToken0Change}
                            >
                              <SelectTrigger
                                // className="relative w-full cursor-pointer p-1 !pl-2 text-right"
                                className="relative w-full cursor-pointer rounded-md border-none bg-blue-100 py-1 !pl-2 text-right"
                                aria-invalid={fieldState.invalid}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {MN_TOKEN_LIST.map((token) => (
                                  <SelectItem
                                    key={token.value}
                                    value={token.value}
                                  >
                                    {token.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    <div className="mt-4 text-right text-xs">
                      <TokenBalance tokenAddress={token0} />
                    </div>
                  </div>
                </SpinnerOverlay>

                <SpinnerOverlay loading={quotingMode === QuoteMode.ExactInput}>
                  <div
                    className={`rounded-xl border border-gray-200 p-3 pl-1 ${
                      isExactInputMode ? "bg-[#F7F8FA]" : "bg-white"
                    }`}
                  >
                    <div className="grid grid-cols-[1fr_100px] items-start gap-2">
                      <Controller
                        name="token1Amount"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            {/*<FieldLabel>Token1</FieldLabel>*/}
                            {/* SpinnerOverlay */}
                            <InputGroup className="border-none !ring-0">
                              {/*<InputGroupAddon className="px-0">
                              <div className="rounded-lg bg-blue-100 px-3 py-2">
                                {token1Symbol}
                              </div>
                            </InputGroupAddon>*/}
                              <InputGroupInput
                                name={field.name}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleAmount1Change(e.target.value)
                                }}
                                placeholder="Token1 Amount"
                                className="scale-y-120 !text-2xl font-semibold tracking-wide text-black"
                              />
                            </InputGroup>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name="token1"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Select
                              key={field.value || "token1-empty"}
                              name={field.name}
                              value={field.value || undefined}
                              onValueChange={handleToken1Change}
                            >
                              <SelectTrigger
                                className="relative w-full cursor-pointer rounded-md border-none bg-blue-100 py-1 !pl-2 text-right"
                                aria-invalid={fieldState.invalid}
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {MN_TOKEN_LIST.map((token) => (
                                  <SelectItem
                                    key={token.value}
                                    value={token.value}
                                  >
                                    {token.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="mt-4 text-right text-xs">
                      <TokenBalance tokenAddress={token1} />
                    </div>
                  </div>
                </SpinnerOverlay>
              </div>
            </div>
            <div className="text-center">
              <Button
                type="submit"
                // size="lg"
                className="text-md !bg-blue-500 px-6 py-5"
                disabled={loading || quotingMode != null}
              >
                Swap
                {loading && <Spinner className="ml-1" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default memo(Swap)
