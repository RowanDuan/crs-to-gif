import Link from "next/link"

export default function Page() {
  return (
    <section>
      <h1>产品列表</h1>
      <ul>
        <li>
          <Link href="/products/1">产品 1</Link>
        </li>
        <li>
          <Link href="/products/2">产品 2</Link>
        </li>
        <li>
          <Link href="/products/3">产品 3</Link>
        </li>
      </ul>
    </section>
  )
}
