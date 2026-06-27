import Link from 'next/link';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <article>
      <h1>文章：{slug}</h1>
      <p>这里是 {slug} 的正文内容……</p>
      <hr />
      <p>
        切换文章：
        <Link href="/posts/next">下一篇</Link>
        {' '}
        ·
        {' '}
        <Link href="/posts/prev">上一篇</Link>
      </p>
    </article>
  );
}
