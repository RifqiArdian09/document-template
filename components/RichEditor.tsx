'use client'

import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

interface RichEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const onTextChangeRef = useRef(onChange)

  // Keep onChange updated without re-triggering useEffect
  useEffect(() => {
    onTextChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    )

    const quill = new Quill(editorContainer, {
      theme: 'snow',
      placeholder: placeholder || 'Ketik di sini...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'align': [] }], // Tambahkan tombol alignment
          ['clean']
        ],
      },
    })

    quillRef.current = quill

    if (value) {
      quill.setContents(quill.clipboard.convert({ html: value }))
    }

    quill.on('text-change', () => {
      const html = quill.root.innerHTML
      // Handle empty state in Quill (it returns <p><br></p> when empty)
      if (html === '<p><br></p>') {
        onTextChangeRef.current('')
      } else {
        onTextChangeRef.current(html)
      }
    })

    return () => {
      quillRef.current = null
      if (container) {
        container.innerHTML = ''
      }
    }
  }, []) // Initialize once

  // Update value if it changes from outside (e.g. from props)
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      if (value === '' && quillRef.current.root.innerHTML === '<p><br></p>') return
      
      const selection = quillRef.current.getSelection()
      quillRef.current.setContents(quillRef.current.clipboard.convert({ html: value }))
      if (selection) {
        quillRef.current.setSelection(selection.index, selection.length)
      }
    }
  }, [value])

  return (
    <div className="rich-editor rounded-xl overflow-hidden border-none bg-muted focus-within:ring-1 focus-within:ring-primary transition-all">
      <div ref={containerRef} />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          background: rgba(0,0,0,0.02);
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.05) !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          font-size: 14px;
          min-height: 150px;
        }
        .ql-editor {
          padding: 20px;
          line-height: 1.7;
          min-height: 150px;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 20px;
          right: 20px;
        }
        
        /* Handling Alignment classes from Quill */
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }

        /* Dark mode styles */
        .dark .ql-toolbar.ql-snow {
           background: rgba(255,255,255,0.05);
           border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .dark .ql-stroke { stroke: #e2e8f0; }
        .dark .ql-fill { fill: #e2e8f0; }
        .dark .ql-picker { color: #e2e8f0; }
      `}</style>
    </div>
  )
}
