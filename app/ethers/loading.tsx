import { Spinner } from "@/components/ui/spinner"

export default async function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[800px] p-20">
      <div className="flex h-auto items-center justify-center p-1">
        <Spinner className="mr-2" />
        Loading...
      </div>
    </main>
  )
}
