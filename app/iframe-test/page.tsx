"use client"

export default function IframeTestPage() {
  const handleClose = () => {
    window.postMessage({ action: "closeCPQ" }, "*")
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        type="button"
        onClick={handleClose}
        className="rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Close
      </button>
    </main>
  )
}
