export default function ContactPage() {
  return (
    <section>
      <h1>联系我们</h1>
      <p>
        本页路径是 <code>/mkt/contact</code>，与 (marketing) 组下的{" "}
        <code>/mkt/pricing</code> 同级，互不影响。
      </p>
      <ul>
        <li>(marketing) 管：/mkt、/mkt/pricing</li>
        <li>(marketing2) 管：/mkt/about、/mkt/contact</li>
      </ul>
    </section>
  )
}
