'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  ImageRun
} from 'docx'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WordExportButtonProps {
  state: any
  fields: { label: string; value: string }[]
  logo?: string | null
  stamp?: string | null
  signature?: string | null
  background?: string | null
  className?: string
}

export default function WordExportButton({ state, fields, logo, stamp, signature, background: bgProp, className }: WordExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const background = bgProp || state.background_image_url

  const stripHtml = (html: string) => {
    if (!html) return ""
    let text = html.replace(/<\/p>/g, "\n").replace(/<br\s*\/?>/g, "\n")
    return text.replace(/<[^>]*>?/gm, '').trim()
  }

  const fetchImage = async (url: string): Promise<Uint8Array | null> => {
    try {
      const resp = await fetch(url)
      const buffer = await resp.arrayBuffer()
      return new Uint8Array(buffer)
    } catch (e) {
      console.error("Failed to fetch image:", url, e)
      return null
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const toastId = toast.loading("Mempersiapkan dokumen Word dengan gambar...")

    try {
      const children: any[] = []

      // --- 0. Background / Watermark (Floating Behind Text) ---
      if (background) {
        const bgBuffer = await fetchImage(background)
        if (bgBuffer) {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: bgBuffer,
                  transformation: { width: 500, height: 500 },
                  floating: {
                    horizontalPosition: { offset: 0, relative: 'page' as any },
                    verticalPosition: { offset: 1500000, relative: 'page' as any },
                    wrap: { type: 'none' as any, side: 'both' as any },
                    behindText: true,
                  },
                } as any),
              ],
            })
          )
        }
      }

      // --- 1. Logo Header (Floating In Front of Text) ---
      if (logo) {
        const logoBuffer = await fetchImage(logo)
        if (logoBuffer) {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: { width: 80, height: 80 },
                  floating: {
                    horizontalPosition: { offset: 600000, relative: 'page' as any },
                    verticalPosition: { offset: 600000, relative: 'page' as any },
                    wrap: { type: 'none' as any, side: 'both' as any },
                  },
                } as any),
              ],
            })
          )
        }
      }

      // --- 2. Header Content ---
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

      children.push(new Paragraph({ children: [new TextRun({ text: "" })], border: { bottom: { color: "000000", space: 1, style: BorderStyle.DOUBLE, size: 6 } } }))
      children.push(new Paragraph({ spacing: { before: 200 } }))

      // --- 3. Title & Number ---
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: (state.title || "JUDUL DOKUMEN").toUpperCase(),
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

      // --- 4. Content ---
      if (state.body_content) {
        const cleanContent = stripHtml(state.body_content)
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: cleanContent,
                size: 24,
                font: "Times New Roman"
              }),
            ],
            spacing: { after: 300, line: 360 }
          })
        )
      }

      // --- 5. Fields ---
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

        children.push(new Table({ 
          width: { size: 100, type: WidthType.PERCENTAGE }, 
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
          }, 
          rows: rows 
        }))
        children.push(new Paragraph({ spacing: { before: 400 } }))
      }

      if (state.closing_content) {
        const cleanClosing = stripHtml(state.closing_content)
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: cleanClosing,
                size: 24,
                font: "Times New Roman"
              }),
            ],
            spacing: { before: 300, after: 300, line: 360 }
          })
        )
      }

      // --- 6. Signature Area ---
      const ttdAlign = state.ttd_align === 'center' ? AlignmentType.CENTER : 
                       state.ttd_align === 'left' ? AlignmentType.LEFT : AlignmentType.RIGHT;

      const sigBuffer = signature ? await fetchImage(signature) : null
      const capBuffer = stamp ? await fetchImage(stamp) : null

      children.push(
        new Paragraph({
          alignment: ttdAlign,
          children: [
            new TextRun({
              text: `${state.ttd_lokasi || 'Lokasi'}, ${state.ttd_tanggal || 'Tanggal'}`,
              size: 24,
              font: "Times New Roman"
            }),
          ],
          spacing: { after: 200 }
        })
      )

      // Signature & Stamp Images (if any)
      if (sigBuffer || capBuffer) {
        const sigRuns: any[] = []
        if (sigBuffer) {
          sigRuns.push(new ImageRun({ data: sigBuffer, transformation: { width: 120, height: 60 } } as any))
        }
        if (capBuffer) {
          sigRuns.push(new ImageRun({ 
            data: capBuffer, 
            transformation: { width: 80, height: 80 },
            floating: {
                horizontalPosition: { offset: -300000, relative: 'column' as any },
                verticalPosition: { offset: -200000, relative: 'paragraph' as any },
                wrap: { type: 'none' as any, side: 'both' as any },
            }
          } as any))
        }
        children.push(new Paragraph({ alignment: ttdAlign, children: sigRuns, spacing: { after: 200 } }))
      } else {
        children.push(new Paragraph({ spacing: { after: 800 } }))
      }

      children.push(
        new Paragraph({
          alignment: ttdAlign,
          children: [
            new TextRun({
              text: state.ttd_nama || 'Nama Terang',
              bold: true,
              underline: {},
              size: 24,
              font: "Times New Roman"
            }),
          ],
        }),
        new Paragraph({
          alignment: ttdAlign,
          children: [
            new TextRun({
              text: state.ttd_jabatan || 'Jabatan',
              bold: true,
              size: 24,
              font: "Times New Roman"
            }),
          ],
        })
      )

      // --- 7. Footer ---
      if (state.footer_text) {
        const cleanFooter = stripHtml(state.footer_text)
        children.push(
          new Paragraph({
            spacing: { before: 1000 },
            border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: cleanFooter,
                size: 18,
                font: "Times New Roman",
                italics: true
              }),
            ],
          })
        )
      }

      const docBlob = new Document({
        sections: [{ properties: {}, children: children }],
      })

      const blob = await Packer.toBlob(docBlob)
      saveAs(blob, `${state.title || 'dokumen'}.docx`)
      toast.success("Dokumen Word berhasil diekspor!", { id: toastId })
    } catch (e: any) {
      console.error('Word Export Error:', e)
      toast.error("Gagal mengekspor dokumen Word", { id: toastId, description: e.message })
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
      {isExporting ? "Mengonversi..." : "Ekspor ke Word"}
    </button>
  )
}
