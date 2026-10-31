'use client'

import 'katex/dist/katex.min.css'
import clsx from 'clsx'
import ReactMarkdown, { Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

// Links gerados pela IA abrem em nova aba e sem acesso à janela de origem.
const componentes: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const componentesInline: Components = {
  ...componentes,
  p: ({ children }) => <>{children}</>
}

interface MarkdownProps {
  conteudo: string
  /** Renderiza sem parágrafos, para trechos dentro de uma linha (ex.: lacunas). */
  inline?: boolean
  className?: string
}

/** Markdown com tabelas (GFM) e fórmulas LaTeX ($...$ e $$...$$). */
export default function Markdown({
  conteudo,
  inline = false,
  className
}: MarkdownProps) {
  const elemento = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={inline ? componentesInline : componentes}
    >
      {conteudo}
    </ReactMarkdown>
  )

  return inline ? (
    <span className={clsx('conteudo-markdown', className)}>{elemento}</span>
  ) : (
    <div className={clsx('conteudo-markdown', className)}>{elemento}</div>
  )
}
