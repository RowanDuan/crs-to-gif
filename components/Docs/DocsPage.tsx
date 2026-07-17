import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type DocsPageProps = {
  content: string
  slug: string
}

export default function DocsPage({ content, slug }: DocsPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <article className="mx-auto w-full max-w-3xl px-6 py-12">
        <p className="mb-8 text-sm text-slate-500">/docs/{slug}</p>
        <div className="docs-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 mb-4 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-900">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-3 text-xl font-semibold text-slate-800">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="mt-6 mb-2 text-lg font-semibold text-slate-800">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-7 text-slate-700">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-700">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-7">{children}</li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="font-medium text-blue-600 underline-offset-2 hover:underline"
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mb-4 border-l-4 border-slate-300 pl-4 text-slate-600 italic">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-8 border-slate-200" />,
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">{children}</strong>
              ),
              code: ({ className, children }) => {
                const isBlock = Boolean(className)
                if (isBlock) {
                  return <code className={className}>{children}</code>
                }
                return (
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-6 text-slate-100">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-slate-200 bg-slate-50">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 font-semibold text-slate-800">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border-t border-slate-100 px-3 py-2 text-slate-700">
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
