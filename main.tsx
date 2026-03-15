// @ts-ignore
import README from './README.md?raw'
import markdownit from 'markdown-it'
import React from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live'
import { Prism, themes } from 'prism-react-renderer'
import './main.css'

type CodeBlockProps = { code: string; language: string }

const CodeBlock = ({ code, language }: CodeBlockProps) => (
        <LiveProvider code={code} language={language} theme={themes.vsLight}>
                <LiveEditor className="prism-code" />
        </LiveProvider>
)

const LiveBlock = ({ code, language }: CodeBlockProps) => (
        <LiveProvider code={code} language={language} theme={themes.vsLight} scope={{ React }}>
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

const html = md.render(README)

const App = () => {
        const [blocks, setBlocks] = React.useState<HTMLElement[]>([])
        const ref = React.useRef((root: HTMLElement | null) => {
                if (!root) return
                root.innerHTML = html
                setBlocks(Array.from(root.querySelectorAll<HTMLElement>('.code-block')))
        }).current
        return (
                <>
                        <div ref={ref} className="markdown-body" />
                        {blocks.map((el, i) => {
                                const { code = '', lang = 'text', live = '0', id } = el.dataset
                                const Component = live === '1' ? LiveBlock : CodeBlock
                                return createPortal(<Component code={decodeURIComponent(code)} language={lang} />, el, id || `code-${i}`)
                        })}
                </>
        )
}

createRoot(document.getElementById('app')!).render(<App />)
