export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <article>
      <h1>产品详情 {id}</h1>
      <p>这里是产品 {id} 的详情。</p>
    </article>
  )
}
