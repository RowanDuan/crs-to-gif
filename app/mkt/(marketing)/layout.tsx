import Link from "next/link"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="p-50">
      <nav>
        <Link href="/mkt">首页</Link>
        <Link href="/mkt/pricing">定价</Link>
      </nav>
      {children}
    </section>
  )
}
