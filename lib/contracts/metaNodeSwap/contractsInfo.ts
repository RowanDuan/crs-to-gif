import { Address } from "@/lib/contracts/metaNodeSwap/types"
import { formatFee } from "@/lib/contracts/metaNodeSwap/utils"

import { MN_TOKEN_ABI } from "./mnTokenAbi"
import { POOL_ABI } from "./poolAbi"
import { POSITION_MANAGER_ABI } from "./positionManagerAbi"
import { SWAP_ROUTER_ABI } from "./swapRouterAbi"

const ACCOUNT1_ADDRESS = "0x738a73250D686F6A79200a8A9a64e32ed9A9CEda"
export const MN_TOKEN_A_ADDRESS =
  "0x4798388e3adE569570Df626040F07DF71135C48E" as Address
export const MN_TOKEN_B_ADDRESS =
  "0x5a4ea3a013d42cfd1b1609d19f6ea998eee06d30" as Address
export const MN_TOKEN_C_ADDRESS =
  "0x86b5df6ff459854ca91318274e47f4eee245cf28" as Address
export const MN_TOKEN_D_ADDRESS =
  "0x7af86b1034ac4c925ef5c3f637d1092310d83f03" as Address
export const POOL_MANAGER_ADDRESS =
  "0xddC12b3F9F7C91C79DA7433D8d212FB78d609f7B" as Address
export const POSITION_MANAGER_ADDRESS =
  "0xbe766Bf20eFfe431829C5d5a2744865974A0B610" as Address
export const SWAP_ROUTER_ADDRESS =
  "0xD2c220143F5784b3bD84ae12747d97C8A36CeCB2" as Address

export const MN_TOKEN_A_CONTRACT_QUERY = {
  address: MN_TOKEN_A_ADDRESS as Address,
  abi: MN_TOKEN_ABI,
}

export const MN_TOKEN_B_CONTRACT_QUERY = {
  address: MN_TOKEN_B_ADDRESS,
  abi: MN_TOKEN_ABI,
}

export const MN_TOKEN_C_CONTRACT_QUERY = {
  address: MN_TOKEN_C_ADDRESS,
  abi: MN_TOKEN_ABI,
}

export const MN_TOKEN_D_CONTRACT_QUERY = {
  address: MN_TOKEN_D_ADDRESS,
  abi: MN_TOKEN_ABI,
}

export const POOL_CONTRACT_QUERY = {
  address: POOL_MANAGER_ADDRESS,
  abi: POOL_ABI,
}

export const POSITION_MANAGER_CONTRACT_QUERY = {
  address: POSITION_MANAGER_ADDRESS,
  abi: POSITION_MANAGER_ABI,
}

export const SWAP_ROUTER_CONTRACT_QUERY = {
  address: SWAP_ROUTER_ADDRESS,
  abi: SWAP_ROUTER_ABI,
}

export const MN_TOKEN_LIST = [
  {
    label: "MNTA",
    value: MN_TOKEN_A_ADDRESS,
  },
  {
    label: "MNTB",
    value: MN_TOKEN_B_ADDRESS,
  },
  {
    label: "MNTC",
    value: MN_TOKEN_C_ADDRESS,
  },
  {
    label: "MNTD",
    value: MN_TOKEN_D_ADDRESS,
  },
]

export const FEE_LIST = [
  {
    label: formatFee(100),
    value: "100",
    description: "常用于高度稳定的交易对",
  },
  {
    label: formatFee(500),
    value: "500",
    description: "常用于稳定交易对",
  },
  {
    label: formatFee(3000),
    value: "3000",
    description: "常用于稳定交易对",
  },
  {
    label: formatFee(10000),
    value: "10000",
    description: "常用于非标准交易对",
  },
]

export const getTokenSymbol = (address: Address): string => {
  return (
    MN_TOKEN_LIST.find((add) => {
      return add.value.toLowerCase() === address.toLowerCase()
    })?.label || ""
  )
}
