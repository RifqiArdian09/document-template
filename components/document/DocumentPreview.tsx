'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface DocumentPreviewProps {
  state: any
  fields: { label: string, value: string }[]
  logo?: string | null
  stamp?: string | null
  signature?: string | null
  background?: string | null
}

export default function DocumentPreview({ state, fields, logo, stamp, signature, background }: DocumentPreviewProps) {
  const textColor = state.text_color || '#000000'

  return (
    <div 
      className="w-full bg-white relative p-[20mm] font-serif transition-colors duration-300" 
      style={{ color: textColor, minHeight: '297mm' }}
    >
      {/* Document Background Image */}
      {background && (
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" 
          style={{ opacity: 0.1 }}
        >
          <img 
            src={background} 
            alt="Background" 
            className="w-4/5 h-4/5 object-contain"
          />
        </div>
      )}

      {/* Header / Kop Surat */}
      <div className="relative border-b-4 border-black pb-4 mb-8 flex items-center gap-6">
        {logo && (
          <div className="flex-shrink-0">
            <img src={logo} alt="Header Logo" className="h-24 w-auto max-w-[120px] object-contain" />
          </div>
        )}
        <div className="flex-grow text-center">
          <h1 className="text-2xl font-bold leading-tight uppercase tracking-tight" style={{ fontSize: '1.4rem' }}>
            {state.header_company || 'NAMA INSTANSI / PERUSAHAAN'}
          </h1>
          <p className="text-sm mt-1 font-sans italic opacity-80 whitespace-pre-wrap">
            {state.header_subtext || 'Detail Alamat, Kontak, dan Informasi Instansi'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative space-y-6">
        {/* Title & Number */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold underline uppercase decoration-1 underline-offset-4 tracking-wide">
            {state.title || 'JUDUL DOKUMEN'}
          </h2>
          <p className="text-sm font-medium mt-1">
            NOMOR: {state.nomor || 'No. XXX/YYY/ZZZ/2026'}
          </p>
        </div>

        {/* Opening Paragraph (HTML) */}
        <div 
          className="text-base leading-relaxed ql-editor-preview"
          dangerouslySetInnerHTML={{ __html: state.body_content || '<p>Ketik isi pembukaan dokumen di sini...</p>' }}
        />

        {/* Dynamic Fields Table */}
        {fields.length > 0 && (
          <div className="my-8">
            <table className="w-full text-sm">
              <tbody className="divide-y-0">
                {fields.map((field, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="w-1/3 py-1 font-bold">{field.label || 'Field Label'}</td>
                    <td className="w-4 py-1">:</td>
                    <td className="py-1">{field.value || 'Input Value'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Closing Paragraph (HTML) */}
        {state.closing_content && (
          <div 
            className="text-base leading-relaxed mt-6 ql-editor-preview"
            dangerouslySetInnerHTML={{ __html: state.closing_content }}
          />
        )}

        {/* Signature Area */}
        <div className={cn(
          "mt-12 flex",
          state.ttd_align === 'center' ? "justify-center" : 
          state.ttd_align === 'left' ? "justify-start" : "justify-end"
        )}>
          <div className="w-64 text-center space-y-1 relative">
            <p className="text-sm mb-12">
              {state.ttd_lokasi || 'Lokasi'}, {state.ttd_tanggal || 'Tanggal'}
            </p>
            
            {/* Signature & Stamp Overlay */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-48 h-32 flex items-center justify-center pointer-events-none">
              {signature && (
                <img 
                  src={signature} 
                  alt="Tanda Tangan" 
                  className="absolute max-h-full max-w-full object-contain"
                />
              )}
              {stamp && (
                <img 
                  src={stamp} 
                  alt="Cap Instansi" 
                  className="absolute max-h-full max-w-full object-contain opacity-50 mix-blend-multiply transition-opacity group-hover:opacity-70"
                />
              )}
            </div>

            <div className="pt-2">
              <p className="font-bold underline text-base uppercase">
                {state.ttd_nama || 'Nama Terang'}
              </p>
              <p className="text-sm font-bold opacity-80">
                {state.ttd_jabatan || 'Jabatan'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Catatan Kaki */}
      {state.footer_text && (
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] pt-4 border-t border-gray-300">
           <div 
             className="ql-editor-preview text-[10px] text-gray-500 italic leading-snug"
             dangerouslySetInnerHTML={{ __html: state.footer_text }}
           />
        </div>
      )}

      <style jsx global>{`
        .ql-editor-preview p {
          margin-bottom: 0.5em;
        }
        .ql-editor-preview ul, .ql-editor-preview ol {
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }
        .ql-editor-preview ul {
          list-style-type: disc;
        }
        .ql-editor-preview ol {
          list-style-type: decimal;
        }
        
        /* Handling Alignment */
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
      `}</style>
    </div>
  )
}
