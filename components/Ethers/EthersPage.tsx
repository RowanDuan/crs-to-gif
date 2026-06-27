"use client"

import { memo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const EthersPage = () => {
  const router = useRouter()

  return (
    <div>
      <p>This is Ethers Page</p>
      {/* <hr /> */}
      {/* <Link href="/">HOME</Link> */}
    </div>
  )
}

export default memo(EthersPage)
