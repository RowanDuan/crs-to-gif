import EthersDemo from "@/components/Ethers/EthersDemo"
import EthersPage from "@/components/Ethers/EthersPage"

export const metadata = {
  title: "Ethers",
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function Page() {
  await sleep(1000)

  return (
    <main className="mx-auto w-full max-w-[800px] p-20">
      {/*<EthersDemo />*/}
      <EthersPage />
    </main>
  )
}
