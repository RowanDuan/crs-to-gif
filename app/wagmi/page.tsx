import WagmiPage from "@/components/Wagmi/WagmiPage";

export const metadata = {
  title: "Wagmi",
};

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <WagmiPage />
    </main>
  );
}
