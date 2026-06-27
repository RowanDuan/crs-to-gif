import Link from 'next/link';

export default function Marketing2Layout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ border: '2px dashed #6366f1', padding: 16, marginTop: 24 }}>
      <p style={{ margin: '0 0 12px', color: '#6366f1', fontSize: 14 }}>
        这是 (marketing2) 路由组的 layout —— URL 里没有 marketing2，但布局和 (marketing) 不同。
      </p>
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link href="/mkt/about">关于我们</Link>
        <Link href="/mkt/contact">联系我们</Link>
        <Link href="/mkt">← 回到 (marketing) 首页</Link>
      </nav>
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}
