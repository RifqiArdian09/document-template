'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PDFExportButtonProps {
  printRef: React.RefObject<HTMLDivElement | null>
  filename: string
  className?: string
}

export default function PDFExportButton({ printRef, filename, className }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!printRef.current) return
    
    setIsExporting(true)
    const exportToastId = toast.loading("Generating your document...")
    
    try {
      const element = printRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable for debugging
        backgroundColor: '#ffffff',
        onclone: (clonedDoc, element) => {
          // 1. DONT remove all styles! That breaks layout (zoomed images issue).
          // Instead, SANITIZE them by removing oklch/oklab functions which crash html2canvas.
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(s => {
            if (s.innerHTML.includes('oklch') || s.innerHTML.includes('oklab')) {
                s.innerHTML = s.innerHTML.replace(/oklch\([^)]+\)/g, 'rgba(0,0,0,0.1)');
                s.innerHTML = s.innerHTML.replace(/oklab\([^)]+\)/g, 'rgba(0,0,0,0.1)');
            }
          });

          // 2. Ensure the captured element itself has a white background for the PDF
          const el = element as HTMLElement;
          el.style.backgroundColor = 'white';
        }
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${filename || 'document'}.pdf`)
      toast.success("PDF exported successfully!", { id: exportToastId })
      
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      toast.error("Failed to export PDF", {
        id: exportToastId,
        description: error.message
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        "w-full bg-white dark:bg-zinc-800 border border-border text-foreground hover:bg-muted font-medium py-2.5 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-sm",
        className
      )}
    >
      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      {isExporting ? "Exporting..." : "Export to PDF"}
    </button>
  )
}
