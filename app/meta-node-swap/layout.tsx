import type { ReactNode } from "react"

import { MetaNodeSwapProviders } from "@/components/MetaNodeSwap/providers"

export default function StakeLayout({ children }: { children: ReactNode }) {
  return <MetaNodeSwapProviders>{children}</MetaNodeSwapProviders>
}
