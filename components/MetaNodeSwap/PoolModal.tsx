import { useState, useCallback, memo, useEffect } from "react"
import * as React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { encodeSqrtRatioX96 } from "@uniswap/v3-sdk"
import Big from "big.js"
import { XIcon } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { useConfig } from "wagmi"
import { writeContract, waitForTransactionReceipt } from "wagmi/actions"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  FEE_LIST,
  MN_TOKEN_A_ADDRESS,
  MN_TOKEN_LIST,
  POOL_CONTRACT_QUERY,
} from "@/lib/contracts/metaNodeSwap/contractsInfo"
import { Address } from "@/lib/contracts/metaNodeSwap/types"
import {
  formatSqrt,
  getTickFromPrice,
  geyInvertedPrice,
  parseSqrt,
} from "@/lib/contracts/metaNodeSwap/utils"

const formSchema = z
  .object({
    token0: z.string().min(1, "Please select"),
    token1: z.string().min(1, "Please select"),
    fee: z.string().min(1, "Please select"),
    lowPrice: z.string().min(1, "Please input"),
    upperPrice: z.string().min(1, "Please input"),
    currentPrice: z.string().min(1, "Please input"),
  })
  .refine(
    (data) => {
      if (!data.upperPrice) return true
      if (!data.lowPrice) return true
      try {
        return new Big(data.upperPrice).gt(data.lowPrice)
      } catch {
        return false
      }
    },
    {
      message: "Must be greater than low price",
      path: ["upperPrice"],
    }
  )
type FormValues = z.infer<typeof formSchema>

function PoolModal({ closeAddModal }: { closeAddModal: () => void }) {
  const config = useConfig()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log(
      "encodeSqrtRatioX96(40000, 1): ",
      encodeSqrtRatioX96(1, 1).toString()
    )
    console.log(
      "encodeSqrtRatioX96(2, 1): ",
      encodeSqrtRatioX96(2, 1).toString()
    )
    console.log("formatSqrt: ", formatSqrt("112045541949572279837463876454"))
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as never),
    defaultValues: {
      token0: MN_TOKEN_A_ADDRESS,
      token1: "",
      fee: "",
      lowPrice: "",
      upperPrice: "",
      currentPrice: "",
    },
  })

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = form

  const handleToken0Change = useCallback(
    (value: string) => {
      setValue("token0", value, { shouldValidate: true, shouldDirty: true })
      const token1 = getValues("token1")
      if (token1 && token1.toLowerCase() === value.toLowerCase()) {
        setValue("token1", "", { shouldDirty: true })
      }
    },
    [getValues, setValue]
  )

  const handleToken1Change = useCallback(
    (value: string) => {
      setValue("token1", value, { shouldValidate: true, shouldDirty: true })
      const token0 = getValues("token0")
      if (token0 && token0.toLowerCase() === value.toLowerCase()) {
        setValue("token0", "", { shouldDirty: true })
      }
    },
    [getValues, setValue]
  )

  const onSubmit = useCallback(
    async (data: FormValues) => {
      try {
        setLoading(true)
        console.log("data: ", data)
        // token0 地址需 < token1
        const [token0, token1] =
          data.token0.toLowerCase() < data.token1.toLowerCase()
            ? [data.token0, data.token1]
            : [data.token1, data.token0]
        // 若交换了 token 顺序，价格要取倒数
        const inverted = token0.toLowerCase() !== data.token0.toLowerCase()
        // 价格取倒数, 再格式化
        const currentPrice = geyInvertedPrice(data.currentPrice, inverted)
        let tickLower = getTickFromPrice(
          geyInvertedPrice(data.lowPrice, inverted)
        )
        let tickUpper = getTickFromPrice(
          geyInvertedPrice(data.upperPrice, inverted)
        )
        // 取倒数后原 low/upper 对应 tick 会颠倒，必须保证 tickLower < tickUpper
        if (tickLower > tickUpper) {
          ;[tickLower, tickUpper] = [tickUpper, tickLower]
        }

        const query = {
          token0: token0 as Address,
          token1: token1 as Address,
          fee: Number(data.fee),
          tickLower,
          tickUpper,
          sqrtPriceX96: parseSqrt(currentPrice), // 转价格为 SqrtRatioX96
        }
        console.log("query: ", query)

        const hash = await writeContract(config, {
          ...POOL_CONTRACT_QUERY,
          functionName: "createAndInitializePoolIfNecessary",
          args: [query],
        })
        console.log("hash: ", hash)
        const receipt = await waitForTransactionReceipt(config, {
          hash,
        })
        toast("Add pool successfully!")
        console.log("receipt: ", receipt)
        closeAddModal()
      } catch (e) {
        console.error(e)
        toast.error(e instanceof Error ? e?.message : "Add pool failed")
      } finally {
        setLoading(false)
      }
    },
    [config]
  )

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 z-20 bg-[rgba(0,0,0,0.5)]">
      <div
        // className="absolute top-0 left-0 flex h-auto w-[600px] flex-col gap-3 rounded-3xl bg-white p-6"
        className="absolute top-1/2 left-1/2 flex h-auto w-[580px] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-3xl bg-white p-6"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xl font-bold">Add Pool</span>
          <button
            type="button"
            aria-label="Close"
            className="cursor-pointer rounded-full p-1 hover:bg-gray-100"
            onClick={closeAddModal}
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
              <p className="mb-2 text-lg font-medium text-black">Token</p>
              <div className="flex items-start space-x-4">
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
                          className="relative w-full py-5 text-right"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select" />
                          {field.value && (
                            <div
                              className="absolute right-1 z-2 flex h-6 w-6 cursor-pointer items-center justify-center bg-white"
                              onPointerDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onClick={() => {
                                setValue("token0", "")
                              }}
                            >
                              <XIcon />
                            </div>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {MN_TOKEN_LIST.map((token) => (
                            <SelectItem key={token.value} value={token.value}>
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
                <Controller
                  name="token1"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {/*<FieldLabel>Token1</FieldLabel>*/}
                      <Select
                        key={field.value || "token1-empty"}
                        name={field.name}
                        value={field.value || undefined}
                        onValueChange={handleToken1Change}
                      >
                        <SelectTrigger
                          className="w-full py-5"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select" />
                          {field.value && (
                            <div
                              className="absolute right-1 z-2 flex h-6 w-6 cursor-pointer items-center justify-center bg-white"
                              onPointerDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              onClick={() => {
                                setValue("token1", "")
                              }}
                            >
                              <XIcon />
                            </div>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {MN_TOKEN_LIST.map((token) => (
                            <SelectItem key={token.value} value={token.value}>
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
            </div>
            <Controller
              name="fee"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fee</FieldLabel>
                  <RadioGroup
                    // defaultValue=""
                    className="flex"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {/* 0.01% / 0.05% / 0.30% / 1.00% */}
                    {/* 100   / 500   / 3000  / 10000 */}
                    {FEE_LIST.map((fee) => (
                      <FieldLabel key={fee.value} className="cursor-pointer">
                        <Field orientation="horizontal">
                          <FieldContent className="mt-[-4px]">
                            <FieldLabel htmlFor={`fee-${fee.value}`}>
                              {fee.label}
                            </FieldLabel>
                          </FieldContent>
                          <RadioGroupItem
                            value={fee.value}
                            id={`fee-${fee.value}`}
                          />
                        </Field>
                        <FieldDescription className="p-2 pt-0">
                          {fee.description}
                        </FieldDescription>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div>
              <p className="mb-2 text-lg font-medium text-black">Price Range</p>
              <div className="flex items-start space-x-4">
                <Controller
                  name="lowPrice"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {/*<FieldLabel>Low Price</FieldLabel>*/}
                      <InputGroup className="py-5">
                        <InputGroupInput
                          name={field.name}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Low Price"
                        />
                        {field.value && (
                          <InputGroupAddon align="inline-end">
                            {/*<CircleXIcon className="cursor-pointer" />*/}
                            <XIcon
                              className="cursor-pointer"
                              onClick={() => {
                                setValue("lowPrice", "")
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
                  name="upperPrice"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {/*<FieldLabel>Upper Price</FieldLabel>*/}
                      <InputGroup className="py-5">
                        <InputGroupInput
                          name={field.name}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Upper Price"
                        />
                        {field.value && (
                          <InputGroupAddon align="inline-end">
                            {/*<CircleXIcon className="cursor-pointer" />*/}
                            <XIcon
                              className="cursor-pointer"
                              onClick={() => {
                                setValue("upperPrice", "")
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
            </div>
            <Controller
              name="currentPrice"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Current Price</FieldLabel>
                  <InputGroup className="py-5">
                    <InputGroupInput
                      name={field.name}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Current Price"
                    />
                    {field.value && (
                      <InputGroupAddon align="inline-end">
                        {/*<CircleXIcon className="cursor-pointer" />*/}
                        <XIcon
                          className="cursor-pointer"
                          onClick={() => {
                            setValue("currentPrice", "")
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

export default memo(PoolModal)
