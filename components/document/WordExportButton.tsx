'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WordExportButtonProps {
  state: any
  fields: { label: string; value: string }[]
  logo?: string | null
  stamp?: string | null
  signature?: string | null
  className?: string
}

export default function WordExportButton({ state, fields, logo, stamp, signature, className }: WordExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const fetchImageBuffer = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return await blob.arrayBuffer()
    } catch (e) {
      console.error('Failed to fetch image for Word:', e)
      return null
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const toastId = toast.loading("Generating Word document...")

    try {
      const children: any[] = []

      // 1. Header Section
      if (state.header_company) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: state.header_company.toUpperCase(),
                bold: true,
                size: 32,
                font: "Times New Roman"
              }),
            ],
          })
        )
      }

      if (state.header_subtext) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: state.header_subtext,
                size: 18,
                font: "Times New Roman"
              }),
            ],
          })
        )
      }

      // Border line
      children.push(new Paragraph({ children: [new TextRun({ text: "" })], border: { bottom: { color: "000000", space: 1, style: BorderStyle.DOUBLE, size: 6 } } }))
      children.push(new Paragraph({ spacing: { before: 200 } }))

      // 2. Title & Number
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: (state.title || "DOCUMENT TITLE").toUpperCase(),
              bold: true,
              underline: {},
              size: 28,
              font: "Times New Roman"
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: state.nomor || "No. XXX/YYY/ZZZ",
              size: 22,
              font: "Times New Roman"
            }),
          ],
          spacing: { after: 400 }
        })
      )

      // 3. Body Content
      if (state.body_content) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: state.body_content,
                size: 24,
                font: "Times New Roman"
              }),
            ],
            spacing: { after: 300, line: 360 }
          })
        )
      }

      // 4. Dynamic Fields (Table)
      if (fields.length > 0) {
        const rows = fields.map(f => new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({ children: [new TextRun({ text: f.label, bold: true, size: 24, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({ children: [new TextRun({ text: ":", size: 24, font: "Times New Roman" })] })]
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [new Paragraph({ children: [new TextRun({ text: f.value, size: 24, font: "Times New Roman" })] })]
            })
          ]
        }))

        children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: BorderStyle.NONE, rows: rows }))
        children.push(new Paragraph({ spacing: { before: 400 } }))
      }

      // 5. Signature Section (Right Aligned)
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `${state.ttd_lokasi || 'Lokasi'}, ${state.ttd_tanggal || 'Tanggal'}`,
              size: 24,
              font: "Times New Roman"
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: state.ttd_jabatan || 'Jabatan',
              bold: true,
              size: 24,
              font: "Times New Roman"
            }),
          ],
          spacing: { after: 800 }
        })
      )

      // Signature Name
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: state.ttd_nama || 'Nama Terang',
              bold: true,
              underline: {},
              size: 24,
              font: "Times New Roman"
            }),
          ],
        })
      )

      // 6. Footer
      if (state.footer_text) {
        children.push(
          new Paragraph({
            spacing: { before: 1000 },
            border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: state.footer_text,
                size: 18,
                font: "Times New Roman",
                italics: true
              }),
            ],
          })
        )
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${state.title || 'document'}.docx`)
      toast.success("Word document exported successfully!", { id: toastId })
    } catch (e: any) {
      console.error('Word Export Error:', e)
      toast.error("Failed to export Word document", { id: toastId, description: e.message })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border border-border text-foreground rounded-full font-bold hover:bg-muted transition-all shadow-sm disabled:opacity-50",
        className
      )}
    >
      {isExporting ? <Loader2 className="size-5 animate-spin" /> : <FileText className="size-5 text-blue-500" />}
      {isExporting ? "Converting..." : "Export to Word"}
    </button>
  )
}
