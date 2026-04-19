'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, ImageIcon, CheckCircle2, ChevronRight, Save, Layout, ShieldCheck, Palette, FileText, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import DocumentPreview from './DocumentPreview'
import PDFExportButton from './PDFExportButton'
import WordExportButton from './WordExportButton'
import dynamic from 'next/dynamic'
const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from '@/lib/utils'

export default function DocumentBuilder() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('header')
  
  const [docState, setDocState] = useState({
    title: '',
    nomor: '',
    header_company: '',
    header_subtext: '',
    text_color: '#000000',
    body_content: '',
    closing_content: '',
    ttd_nama: '',
    ttd_jabatan: '',
    ttd_lokasi: '',
    ttd_tanggal: '',
    ttd_align: 'right',
    footer_text: ''
  })

  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null)
  const [ttdImageUrl, setTtdImageUrl] = useState<string | null>(null)
  const [capImageUrl, setCapImageUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)

  const [dynamicFields, setDynamicFields] = useState<{ id: string, label: string, value: string }[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDocState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRichChange = (name: string, content: string) => {
    setDocState(prev => ({ ...prev, [name]: content }))
  }

  const addDynamicField = () => {
    setDynamicFields(prev => [...prev, { id: crypto.randomUUID(), label: '', value: '' }])
  }

  const updateDynamicField = (id: string, key: 'label' | 'value', val: string) => {
    setDynamicFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f))
  }

  const removeDynamicField = (id: string) => {
    setDynamicFields(prev => prev.filter(f => f.id !== id))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'logos' | 'signatures' | 'stamps' | 'backgrounds', setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      console.error('Full Upload Error:', uploadError)
      toast.error(`Failed to upload ${bucket}`, {
        description: uploadError.message
      })
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    setter(data.publicUrl)
    toast.success(`${bucket === 'logos' ? 'Logo' : bucket === 'signatures' ? 'Tanda Tangan' : bucket === 'stamps' ? 'Cap' : 'Background'} berhasil diunggah!`)
  }

  const saveDocument = async () => {
    setIsSaving(true)
    const toastId = toast.loading("Menyimpan dokumen...")
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Tidak terautentikasi")

      const { data: docData, error: docError } = await supabase.from('documents').insert({
        user_id: userData.user.id,
        ...docState,
        header_logo_url: headerLogoUrl,
        ttd_image_url: ttdImageUrl,
        cap_image_url: capImageUrl,
        background_image_url: backgroundUrl,
      }).select().single()

      if (docError) throw docError

      if (dynamicFields.length > 0) {
        const fieldsToInsert = dynamicFields.map(f => ({
          document_id: docData.id,
          label: f.label,
          value: f.value
        }))
        const { error: fieldsError } = await supabase.from('document_fields').insert(fieldsToInsert)
        if (fieldsError) throw fieldsError
      }

      await supabase.from('activity_logs').insert({
        user_id: userData.user.id,
        action: 'create',
        module: 'document',
        description: `Membuat dokumen: ${docState.title}`
      })

      toast.success("Dokumen berhasil disimpan!", { id: toastId })
      router.push('/documents')
      router.refresh()
    } catch (error: any) {
      console.error('Save Error:', error)
      toast.error("Gagal menyimpan dokumen", { id: toastId, description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const printRef = useRef<HTMLDivElement>(null)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-180px)] min-h-[600px]">
      {/* Left: Input Controls */}
      <div className="xl:col-span-5 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-card rounded-[32px] shadow-sm border border-border/50 flex flex-col h-full overflow-hidden">
          <div className="bg-muted/50 p-2 border-b border-border/50">
            <TabsList className="grid grid-cols-6 w-full bg-white rounded-full p-1 h-12">
              <TabsTrigger value="header" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Kop</TabsTrigger>
              <TabsTrigger value="body" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Isi</TabsTrigger>
              <TabsTrigger value="fields" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Data</TabsTrigger>
              <TabsTrigger value="sign" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Ttd</TabsTrigger>
              <TabsTrigger value="footer" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Kaki</TabsTrigger>
              <TabsTrigger value="style" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Style</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <TabsContent value="header" className="space-y-6 m-0 border-none outline-none">
               <div className="space-y-2">
                  <Label htmlFor="comp" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Nama Instansi / Perusahaan</Label>
                  <Textarea id="comp" name="header_company" value={docState.header_company} onChange={handleInputChange} placeholder="PT DocuForge Indonesia" className="bg-muted border-none rounded-xl min-h-[80px] focus:ring-1 focus:ring-primary resize-none p-4" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="sub" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Detail Header (Alamat/Kontak)</Label>
                  <Textarea id="sub" name="header_subtext" value={docState.header_subtext} onChange={handleInputChange} rows={4} placeholder="Alamat, Kantor, dll..." className="resize-none bg-muted border-none rounded-xl focus:ring-1 focus:ring-primary p-4" />
               </div>
               <Separator className="bg-border/50" />
               <div className="space-y-3">
                  <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Logo Instansi</Label>
                  <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[20px] p-8 hover:bg-muted transition-colors cursor-pointer group relative bg-white border-border/50">
                    {headerLogoUrl ? (
                       <div className="relative">
                        <img src={headerLogoUrl} alt="Logo" className="max-h-24 object-contain rounded-md" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" onChange={(e) => handleImageUpload(e, 'logos', setHeaderLogoUrl)} />
                           <p className="text-white text-xs font-medium">Ubah</p>
                        </div>
                       </div>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-secondary/30 mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-xs text-secondary/60 font-medium">Klik untuk unggah logo</p>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" accept="image/*" onChange={(e) => handleImageUpload(e, 'logos', setHeaderLogoUrl)} />
                      </>
                    )}
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="body" className="space-y-8 m-0 border-none">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Judul Dokumen</Label>
                  <Input id="title" name="title" value={docState.title} onChange={handleInputChange} placeholder="SURAT TUGAS" className="bg-muted border-none rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Nomor Surat</Label>
                  <Input id="no" name="nomor" value={docState.nomor} onChange={handleInputChange} placeholder="No. 123/ST/2026" className="bg-muted border-none rounded-xl h-12" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="content" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Paragraf Pembuka (Rich Editor)</Label>
                <RichEditor 
                  value={docState.body_content} 
                  onChange={(val) => handleRichChange('body_content', val)} 
                  placeholder="Ketik isi pembukaan dokumen di sini..."
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="closing" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Paragraf Penutup</Label>
                <RichEditor 
                  value={docState.closing_content} 
                  onChange={(val) => handleRichChange('closing_content', val)} 
                  placeholder="Ketik isi penutup dokumen di sini..."
                />
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-6 m-0 border-none">
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl">
                <div className="text-sm font-bold text-primary">Data Dinamis (Tabel)</div>
                <Button variant="outline" size="sm" onClick={addDynamicField} className="h-8 rounded-full border-primary/20 bg-white text-primary text-xs hover:bg-primary/10">
                   <Plus className="w-3 h-3 mr-1" /> Tambah Baru
                </Button>
              </div>
              
              <div className="space-y-4">
                {dynamicFields.map((field) => (
                  <div key={field.id} className="relative p-5 border-none rounded-[20px] bg-muted group animate-in slide-in-from-left-2 transition-all">
                    <button onClick={() => removeDynamicField(field.id)} className="absolute -top-2 -right-2 bg-white border border-border text-secondary hover:text-destructive rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="space-y-4">
                      <Input value={field.label} onChange={(e) => updateDynamicField(field.id, 'label', e.target.value)} placeholder="Label Data (misal: NIK)" className="h-10 text-sm font-bold border-none bg-white rounded-xl" />
                      <Input value={field.value} onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)} placeholder="Isi Data" className="h-10 text-sm bg-white border-none rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sign" className="space-y-6 m-0 border-none">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Lokasi</Label>
                   <Input name="ttd_lokasi" value={docState.ttd_lokasi} onChange={handleInputChange} placeholder="Jakarta" className="bg-muted border-none rounded-xl" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Tanggal</Label>
                   <Input name="ttd_tanggal" value={docState.ttd_tanggal} onChange={handleInputChange} placeholder="10 Oct 2026" className="bg-muted border-none rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Nama Penandatangan</Label>
                  <Input name="ttd_nama" value={docState.ttd_nama} onChange={handleInputChange} placeholder="Nama Terang" className="bg-muted border-none rounded-xl h-11 font-bold" />
              </div>
              <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Jabatan</Label>
                  <Input name="ttd_jabatan" value={docState.ttd_jabatan} onChange={handleInputChange} placeholder="Direktur" className="bg-muted border-none rounded-xl" />
              </div>
              
              <div className="space-y-4 py-2">
                  <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Posisi Tanda Tangan</Label>
                  <div className="flex gap-2">
                    {[
                      { id: 'left', icon: AlignLeft, label: 'Kiri' },
                      { id: 'center', icon: AlignCenter, label: 'Tengah' },
                      { id: 'right', icon: AlignRight, label: 'Kanan' }
                    ].map((pos) => (
                      <Button
                        key={pos.id}
                        variant={docState.ttd_align === pos.id ? 'default' : 'outline'}
                        className={cn(
                          "flex-1 h-12 rounded-xl gap-2 font-bold transition-all",
                          docState.ttd_align === pos.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-muted border-none"
                        )}
                        onClick={() => setDocState(prev => ({ ...prev, ttd_align: pos.id }))}
                      >
                        <pos.icon className="size-4" />
                        <span className="text-[10px] uppercase tracking-wider">{pos.label}</span>
                      </Button>
                    ))}
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2 text-center">
                   <Label className="text-[9px] uppercase font-bold text-secondary tracking-widest opacity-60">Cap Perusahaan</Label>
                   <div className="relative aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center hover:bg-muted border-border/50 bg-gray-50/50 cursor-pointer">
                      {capImageUrl ? (
                        <img src={capImageUrl} className="w-full h-full object-contain p-2" alt="Cap" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <ShieldCheck className="w-6 h-6 text-secondary/20" />
                          <span className="text-[8px] font-bold text-secondary/40">UNGGAH CAP</span>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" onChange={(e) => handleImageUpload(e, 'stamps', setCapImageUrl)} />
                   </div>
                </div>
                <div className="space-y-2 text-center">
                   <Label className="text-[9px] uppercase font-bold text-secondary tracking-widest opacity-60">Tanda Tangan</Label>
                   <div className="relative aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center hover:bg-muted border-border/50 bg-gray-50/50 cursor-pointer">
                      {ttdImageUrl ? (
                        <img src={ttdImageUrl} className="w-full h-full object-contain p-2" alt="TTD" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-6 h-6 text-secondary/20" />
                          <span className="text-[8px] font-bold text-secondary/40">UNGGAH TTD</span>
                        </div>
                      )}
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" onChange={(e) => handleImageUpload(e, 'signatures', setTtdImageUrl)} />
                   </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="footer" className="space-y-4 m-0 border-none">
              <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Catatan Kaki / Keterangan (Rich Editor)</Label>
              <RichEditor 
                value={docState.footer_text} 
                onChange={(val) => handleRichChange('footer_text', val)} 
                placeholder="Ketik catatan kaki dokumen di sini..."
              />
            </TabsContent>

            <TabsContent value="style" className="space-y-8 m-0 border-none">
              <div className="space-y-4">
                <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Warna Tema Teks</Label>
                <div className="flex items-center gap-4 bg-muted p-4 rounded-2xl">
                   <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white shrink-0" style={{ backgroundColor: docState.text_color }} />
                   <Input type="color" name="text_color" value={docState.text_color} onChange={handleInputChange} className="flex-1 cursor-pointer h-10 border-none p-0" />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Gambar Background / Watermark</Label>
                <div className={cn(
                  "relative h-48 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all p-4 group",
                  backgroundUrl ? "border-primary/30 bg-primary/5" : "border-border/50 bg-white hover:bg-muted"
                )}>
                  {backgroundUrl ? (
                    <div className="relative w-full h-full">
                      <img src={backgroundUrl} className="w-full h-full object-contain opacity-40" alt="Background" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]">
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" onChange={(e) => handleImageUpload(e, 'backgrounds', setBackgroundUrl)} />
                         <Button variant="secondary" size="sm" className="rounded-full shadow-lg">Ganti Background</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                       <div className="p-4 bg-muted rounded-2xl group-hover:bg-white transition-colors">
                        <ImageIcon className="w-8 h-8 text-secondary/30" />
                       </div>
                       <div className="text-center">
                        <p className="text-sm font-bold text-foreground">Aunggah Background</p>
                        <p className="text-[10px] text-secondary font-medium mt-1">Logo instansi atau tanda air resmi</p>
                       </div>
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" onChange={(e) => handleImageUpload(e, 'backgrounds', setBackgroundUrl)} />
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="p-6 bg-white border-t border-border/50 flex gap-4">
             <PDFExportButton printRef={printRef} filename={docState.title} className="flex-1 h-14 rounded-full font-black text-sm" />
             <Button 
                onClick={saveDocument} 
                disabled={isSaving}
                className="flex-1 h-14 rounded-full bg-zinc-900 text-white font-black hover:bg-zinc-800 shadow-xl shadow-zinc-900/20 transition-all active:scale-95"
             >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Menyimpan..." : "Simpan Draft"}
             </Button>
          </div>
        </Tabs>
      </div>

      {/* Right: Preview Area */}
      <div className="xl:col-span-7 flex flex-col min-h-0 bg-muted/30 rounded-[40px] p-8 border border-border/50">
         <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
               <div className="size-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Layout className="size-5 text-primary" />
               </div>
               <div>
                  <h3 className="font-black text-foreground tracking-tight">Live Document Preview</h3>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Wysiwyg Engine Active</p>
               </div>
            </div>
            <WordExportButton 
              state={docState} 
              fields={dynamicFields} 
              logo={headerLogoUrl} 
              signature={ttdImageUrl} 
              stamp={capImageUrl} 
              background={backgroundUrl}
              className="h-10 px-6 text-xs" 
            />
         </div>
         
         <div className="flex-1 relative overflow-hidden bg-white rounded-[32px] shadow-2xl border border-border/30 group">
           <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
              <div 
                ref={printRef}
                className="w-full min-h-full transition-transform duration-500 origin-top"
              >
                <DocumentPreview 
                  state={docState} 
                  fields={dynamicFields} 
                  logo={headerLogoUrl}
                  signature={ttdImageUrl}
                  stamp={capImageUrl}
                  background={backgroundUrl}
                />
              </div>
           </div>
           
           {/* Auto-scale indicator */}
           <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
              Standard A4 Format
           </div>
         </div>
      </div>
    </div>
  )
}
