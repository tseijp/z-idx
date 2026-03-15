// @ts-ignore
import README from './README.md?raw'
import markdownit from 'markdown-it'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live'
import { Prism, themes } from 'prism-react-renderer'
import './main.css'

type CodeBlockProps = { code: string; language: string }

const CodeBlock = ({ code, language }: CodeBlockProps) => (
        <LiveProvider code={code} language={(language || 'tsx').toLowerCase()} theme={themes.vsLight}>
                <LiveEditor className="prism-code" disabled />
        </LiveProvider>
)

const LiveBlock = ({ code, language }: CodeBlockProps) => (
        <LiveProvider code={code} language={language || 'tsx'} theme={themes.vsLight} scope={{ React }}>
                <div className="live-block">
                        <LiveEditor className="prism-code" />
                        <div className="live-output">
                                <LivePreview />
                                <LiveError />
                        </div>
                </div>
        </LiveProvider>
)

const md = markdownit({ html: true, linkify: true, typographer: true })

md.renderer.rules.code_inline = (tokens, idx) => {
        const { content } = tokens[idx]
        const grammar = Prism.languages.typescript
        const html = grammar ? Prism.highlight(content, grammar, 'typescript') : content
        return `<code class="language-typescript prism-code-inline">${html}</code>`
}

md.renderer.rules.fence = (tokens, idx) => {
        const { info = '', content } = tokens[idx]
        const [lang = 'text', ...flags] = info.trim().split(/\s+/).filter(Boolean)
        const isLive = flags.includes('live') || flags.includes('react-live') || lang === 'tsx'
        return `<div class="code-block" data-lang="${lang}" data-live="${isLive ? '1' : '0'}" data-code="${encodeURIComponent(content)}"></div>`
}

document.body.innerHTML = `<main class="markdown-body">${md.render(README)}</main>`

document.querySelectorAll<HTMLElement>('.code-block').forEach((el) => {
        const code = decodeURIComponent(el.dataset.code || '')
        const language = el.dataset.lang || 'text'
        const Component = el.dataset.live === '1' ? LiveBlock : CodeBlock
        createRoot(el).render(<Component code={code} language={language} />)
})
