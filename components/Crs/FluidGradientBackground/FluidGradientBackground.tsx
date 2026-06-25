import "./FluidGradientBackground.css"

export default function FluidGradientBackground() {
  return (
    <div className="fluid-bg pointer-events-none absolute inset-0" aria-hidden>
      <div className="fluid-bg__blob fluid-bg__blob--purple" />
      <div className="fluid-bg__blob fluid-bg__blob--cyan" />
      <div className="fluid-bg__blob fluid-bg__blob--pink" />
      <div className="fluid-bg__blob fluid-bg__blob--orange" />
      <div className="fluid-bg__blob fluid-bg__blob--lavender" />
      <div className="fluid-bg__overlay" />
    </div>
  )
}
