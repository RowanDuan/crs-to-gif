"use client"

import { memo, useCallback, useState } from "react"

import { toast } from "sonner"
import { useConfig } from "wagmi"
import { waitForTransactionReceipt, writeContract } from "wagmi/actions"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { POSITION_MANAGER_CONTRACT_QUERY } from "@/lib/contracts/metaNodeSwap/contractsInfo"

const RemovePosition = ({
  positionId,
  getMyPositionsAgain,
}: {
  positionId: string
  getMyPositionsAgain: () => void
}) => {
  const config = useConfig()
  const [loading, setLoading] = useState(false)

  const handleRemove = useCallback(async () => {
    try {
      setLoading(true)
      const hash = await writeContract(config, {
        ...POSITION_MANAGER_CONTRACT_QUERY,
        functionName: "burn",
        args: [BigInt(positionId)],
      })
      const receipt = await waitForTransactionReceipt(config, {
        hash,
      })
      toast("Remove successfully!")
      console.log("receipt: ", receipt)
      getMyPositionsAgain()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [config, positionId, getMyPositionsAgain])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer p-4"
          disabled={loading}
        >
          Remove
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader className="p-2 text-center">
          <PopoverTitle>Are you sure you want to remove it?</PopoverTitle>
          <PopoverDescription className="pt-3">
            <Button
              size="sm"
              className="cursor-pointer p-4"
              onClick={handleRemove}
              disabled={loading}
            >
              Confirm
              {loading && <Spinner className="ml-1" />}
            </Button>
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

export default memo(RemovePosition)
