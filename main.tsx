// @ts-ignore
import README from './README.md?raw'
import markdownit from 'markdown-it'
import React from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live'
import { themes } from 'prism-react-renderer'
import './main.css'

type CodeBlockProps = { code: string; language: string; inline?: string }

const CodeBlock = ({ code, language, inline }: CodeBlockProps) => (
        <LiveProvider code={code} language={language} theme={themes.vsLight}>
                <LiveEditor style={inline === '1' ? { display: 'inline-block', margin: '-10px -4px' } : undefined} />
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

md.renderer.rules.code_inline = (tokens, idx) => `<code class="code-block" data-lang="ts" data-code="${encodeURIComponent(tokens[idx].content)}" data-inline="1"></code>`
md.renderer.rules.fence = (tokens, idx) => {
        const { info, content } = tokens[idx]
        return `<div class="code-block" data-lang="${info}" data-code="${encodeURIComponent(content)}"></div>`
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
                        <main ref={ref} />
                        {blocks.map((el, i) => {
                                const { code = '', lang = 'ts', inline = '0', id } = el.dataset
                                const Component = lang === 'tsx' && inline !== '1' ? LiveBlock : CodeBlock
                                return createPortal(<Component code={decodeURIComponent(code)} language={lang} inline={inline} />, el, id || `code-${i}`)
                        })}
                </>
        )
}

createRoot(document.getElementById('app')!).render(<App />)
