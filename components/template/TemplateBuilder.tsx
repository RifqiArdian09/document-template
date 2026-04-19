'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Layout, Save, AppWindow, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import Link from 'next/link'

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

interface TemplateBuilderProps {
  mode?: 'create' | 'edit'
  initialData?: any
}

export default function TemplateBuilder({ mode = 'create', initialData }: TemplateBuilderProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSaving, setIsSaving] = useState(false)
  const [templateState, setTemplateState] = useState({
    name: '',
    header_company: '',
    header_subtext: '',
    body_structure: '',
    closing_content: '',
    footer_text: '',
    background_image_url: ''
  })

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTemplateState({
        name: initialData.name || '',
        header_company: initialData.header_company || '',
        header_subtext: initialData.header_subtext || '',
        body_structure: initialData.body_structure?.content || '',
        closing_content: initialData.closing_content || '',
        footer_text: initialData.footer_text || '',
        background_image_url: initialData.background_image_url || ''
      })
    }
  }, [mode, initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTemplateState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRichChange = (name: string, content: string) => {
    setTemplateState(prev => ({ ...prev, [name]: content }))
  }

  const saveTemplate = async () => {
    if (!templateState.name) {
      toast.error("Nama template wajib diisi")
      return
    }

    setIsSaving(true)
    const toastId = toast.loading(mode === 'edit' ? "Memperbarui template..." : "Menyimpan template...")

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Tidak terautentikasi")

      const payload = {
        user_id: userData.user.id,
        name: templateState.name,
        header_company: templateState.header_company,
        header_subtext: templateState.header_subtext,
        body_structure: { content: templateState.body_structure },
        closing_content: templateState.closing_content,
        footer_text: templateState.footer_text,
        background_image_url: templateState.background_image_url
      }

      let error
      if (mode === 'edit') {
        const { error: updateError } = await supabase
          .from('templates')
          .update(payload)
          .eq('id', initialData.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('templates')
          .insert(payload)
        error = insertError
      }

      if (error) throw error

      await supabase.from('activity_logs').insert({
        user_id: userData.user.id,
        action: mode === 'edit' ? 'update' : 'create',
        module: 'template',
        description: `${mode === 'edit' ? 'Memperbarui' : 'Membuat'} template: ${templateState.name}`
      })

      toast.success(mode === 'edit' ? "Template berhasil diperbarui!" : "Template berhasil dibuat!", { id: toastId })
      router.push('/templates')
      router.refresh()
    } catch (e: any) {
      console.error('Save Template Error:', e)
      toast.error(mode === 'edit' ? "Gagal memperbarui template" : "Gagal menyimpan template", { id: toastId, description: e.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Header Area */}
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon" asChild className="rounded-full size-12 bg-card border-none shadow-sm hover:shadow-md transition-all group">
          <Link href="/templates">
            <ArrowLeft className="size-5 text-secondary group-hover:text-primary transition-colors" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {mode === 'edit' ? "Edit Template" : "Buat Template Baru"}
          </h1>
          <p className="text-secondary font-medium mt-1">
            {mode === 'edit' ? "Sesuaikan struktur template yang sudah ada." : "Atur struktur dokumen yang bisa digunakan kembali."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm bg-card p-8 space-y-8">
            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60">Informasi Umum</h3>
               <div className="space-y-2">
                  <Label htmlFor="tpl_name" className="text-[10px] font-bold uppercase text-secondary tracking-widest pl-1">Nama Template</Label>
                  <Input 
                    id="tpl_name" 
                    name="name" 
                    value={templateState.name} 
                    onChange={handleInputChange} 
                    placeholder="misal: Kop Surat Resmi A4" 
                    className="h-14 bg-muted border-none rounded-2xl text-base font-bold focus:ring-2 focus:ring-primary/20"
                  />
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60">Sruktur Konten</h3>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-secondary tracking-widest pl-1">Isi Pembuka (Struktur)</Label>
                    <RichEditor 
                      value={templateState.body_structure} 
                      onChange={(val) => handleRichChange('body_structure', val)}
                      placeholder="Struktur pembuka bawaan..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-secondary tracking-widest pl-1">Isi Penutup (Struktur)</Label>
                    <RichEditor 
                      value={templateState.closing_content} 
                      onChange={(val) => handleRichChange('closing_content', val)}
                      placeholder="Struktur penutup bawaan..."
                    />
                  </div>
               </div>
            </div>
          </Card>
        </div>

        {/* Sidebar: Presets Area */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="rounded-[32px] border-none shadow-sm bg-card p-8">
              <div className="space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60">Preset Instansi</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-secondary">Instansi Utama</Label>
                       <Textarea name="header_company" value={templateState.header_company} onChange={handleInputChange} rows={3} className="bg-muted border-none rounded-xl resize-none p-4" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-secondary">Alamat/Detail Utama</Label>
                       <Textarea name="header_subtext" value={templateState.header_subtext} onChange={handleInputChange} rows={4} className="bg-muted border-none rounded-xl resize-none p-4" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-secondary">URL Background (Opsional)</Label>
                    <Input name="background_image_url" value={templateState.background_image_url} onChange={handleInputChange} placeholder="https://..." className="bg-muted border-none rounded-xl" />
                 </div>

                 <div className="pt-4 border-t border-border/50">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary opacity-60 mb-2">Catatan Kaki (Rich Editor)</h3>
                    <RichEditor 
                       value={templateState.footer_text} 
                       onChange={(val) => handleRichChange('footer_text', val)}
                       placeholder="Keterangan kaki standar..."
                    />
                 </div>

                 <Button 
                   onClick={saveTemplate} 
                   disabled={isSaving}
                   className="w-full h-14 bg-primary text-white font-black rounded-full shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all mt-4"
                 >
                   {isSaving ? (mode === 'edit' ? "Memperbarui..." : "Menyimpan...") : (mode === 'edit' ? "Simpan Perubahan" : "Simpan Template")}
                   <Save className="ml-2 size-5" />
                 </Button>
              </div>
           </Card>

           <Card className="bg-muted/50 p-6 rounded-[24px] border-none">
              <div className="flex flex-col gap-3">
                 <h4 className="font-black text-foreground text-sm uppercase tracking-wider">Tips</h4>
                 <p className="text-[11px] text-secondary font-medium leading-relaxed">Gunakan Rich Editor untuk mengatur format teks tebal, miring, atau list yang akan selalu muncul setiap kali template ini digunakan.</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
