import type { ReactNode } from "react"

import { WagmiProviders } from "@/components/Wagmi/providers"

export default function WagmiLayout({ children }: { children: ReactNode }) {
  return <WagmiProviders>{children}</WagmiProviders>
}
