import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"

import DocsPage from "@/components/Docs/DocsPage"

const DOCS_DIR = path.join(process.cwd(), "public", "docs")

function getDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return []
  return fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
}

function getDocContent(slug: string): string | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, "utf-8")
}

export function generateStaticParams() {
  return getDocSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = getDocContent(slug)
  const titleMatch = content?.match(/^#\s+(.+)$/m)
  return {
    title: titleMatch?.[1] ?? slug,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const content = getDocContent(slug)

  if (!content) {
    notFound()
  }

  return <DocsPage content={content} slug={slug} />
}
