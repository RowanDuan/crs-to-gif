import WagmiPage from "@/components/Wagmi/WagmiPage"

export const metadata = {
  title: "Wagmi",
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[800px] p-20">
      <WagmiPage />
    </main>
  )
}
