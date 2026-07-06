import type { ReactNode } from "react"

import { StakeProviders } from "@/components/Stake/providers"

export default function StakeLayout({ children }: { children: ReactNode }) {
  return <StakeProviders>{children}</StakeProviders>
}
