'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, Building2, UserCheck, ShieldCheck, Download } from 'lucide-react'
import DocumentPreview from '@/components/document/DocumentPreview'
import PDFExportButton from '@/components/document/PDFExportButton'
import WordExportButton from '@/components/document/WordExportButton'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DocumentDetailClientProps {
  doc: any
  fields: any[]
}

export default function DocumentDetailClient({ doc, fields }: DocumentDetailClientProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-[32px] shadow-sm border border-border/50">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className="rounded-full size-12 bg-white dark:bg-zinc-800 border-none shadow-sm hover:shadow-md transition-all group">
            <Link href="/documents">
              <ArrowLeft className="size-5 text-secondary group-hover:text-primary transition-colors" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">{doc.title || 'Document Detail'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase px-3 py-1 rounded-full">
                Professional Draft
              </Badge>
              <div className="flex items-center gap-1.5 text-secondary text-xs font-semibold">
                <Calendar className="size-3.5 opacity-40" />
                {new Date(doc.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <WordExportButton 
             state={doc} 
             fields={fields} 
             className="flex-1 md:flex-none h-14 px-8"
           />
           <PDFExportButton 
             printRef={previewRef} 
             filename={doc.title} 
             className="flex-1 md:flex-none h-14 px-10 bg-primary text-white font-black rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all" 
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Sidebar: Info Cards */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm bg-card overflow-hidden">
             <div className="p-8 space-y-8">
                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60">Metadata</h3>
                   <div className="grid gap-4">
                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/5">
                         <div className="size-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                            <FileText className="size-5 text-primary" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-secondary">Nomor Surat</span>
                            <span className="text-sm font-bold text-foreground font-mono">{doc.nomor || '-'}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/5">
                         <div className="size-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                            <Building2 className="size-5 text-blue-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-secondary">Instansi</span>
                            <span className="text-sm font-bold text-foreground">{doc.header_company || '-'}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60">Penandatangan</h3>
                   <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/5">
                      <div className="size-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                         <UserCheck className="size-5 text-purple-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase text-secondary">{doc.ttd_jabatan || 'Jabatan'}</span>
                         <span className="text-sm font-bold text-foreground">{doc.ttd_nama || 'Nama'}</span>
                      </div>
                   </div>
                </div>

                <Card className="bg-primary p-6 rounded-[24px] text-white relative overflow-hidden group">
                   <div className="absolute -right-4 -bottom-4 size-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative z-10 space-y-3">
                      <ShieldCheck className="size-8" />
                      <h4 className="font-black text-lg">Verified Draft</h4>
                      <p className="text-xs text-white/80 font-medium leading-relaxed">Dokumen ini telah melalui sistem verifikasi integritas DocuForge.</p>
                   </div>
                </Card>
             </div>
          </Card>
        </div>

        {/* Right Area: Document Preview */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60">Document Preview</h3>
              <div className="flex items-center gap-2">
                 <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold text-secondary uppercase">Ready for Sync</span>
              </div>
           </div>

           <div className="bg-muted/40 rounded-[40px] p-2 lg:p-6 flex justify-center items-start border border-border/30 shadow-inner overflow-auto min-h-[800px] group">
              <div 
                ref={previewRef}
                className="w-[794px] min-h-[1123px] shrink-0 bg-white shadow-2xl p-0 flex flex-col rounded-none origin-top transition-all duration-500 scale-[0.4] sm:scale-[0.6] lg:scale-[0.7] xl:scale-[0.85] 2xl:scale-100 mb-[-600px] sm:mb-[-400px] lg:mb-[-200px] 2xl:mb-0 pb-20"
              >
                <DocumentPreview 
                  state={doc} 
                  fields={fields}
                  logo={doc.header_logo_url}
                  stamp={doc.cap_image_url}
                  signature={doc.ttd_image_url}
                />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
