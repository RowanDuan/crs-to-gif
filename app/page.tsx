import TransformCrs from "@/components/TransformCrs/TransformCrs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-5xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {/* min-h-[366px]  */}
        <TransformCrs />
      </div>
    </main>
  );
}
