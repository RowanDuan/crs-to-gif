import BackgroundSwitcher from "@/components/BackgroundSwitcher/BackgroundSwitcher";
import TransformCrs from "@/components/TransformCrs/TransformCrs";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundSwitcher />

      <div className="relative z-10 flex flex-col items-center px-6 pt-[150px] pb-8">
        <h1 className="mb-10 text-center text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)] md:text-6xl lg:text-7xl">
          Crs to Gif
        </h1>

        <div className="liquid-glass w-full max-w-5xl p-6 md:p-8">
          <TransformCrs />
        </div>
      </div>
    </main>
  );
}
