'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, ImageIcon, CheckCircle2, ChevronRight, Save, Layout, ShieldCheck } from 'lucide-react'
import DocumentPreview from './DocumentPreview'
import PDFExportButton from './PDFExportButton'
import WordExportButton from './WordExportButton'
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
    ttd_nama: '',
    ttd_jabatan: '',
    ttd_lokasi: '',
    ttd_tanggal: '',
    footer_text: ''
  })

  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null)
  const [ttdImageUrl, setTtdImageUrl] = useState<string | null>(null)
  const [capImageUrl, setCapImageUrl] = useState<string | null>(null)

  const [dynamicFields, setDynamicFields] = useState<{ id: string, label: string, value: string }[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDocState(prev => ({ ...prev, [e.target.name]: e.target.value }))
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'logos' | 'signatures' | 'stamps', setter: React.Dispatch<React.SetStateAction<string | null>>) => {
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
    toast.success(`${bucket.charAt(0).toUpperCase() + bucket.slice(1)} uploaded successfully!`)
  }

  const saveDocument = async () => {
    setIsSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      const { data: docData, error: docError } = await supabase.from('documents').insert({
        user_id: userData.user.id,
        ...docState,
        header_logo_url: headerLogoUrl,
        ttd_image_url: ttdImageUrl,
        cap_image_url: capImageUrl,
      }).select().single()

      if (docError) throw docError

      if (dynamicFields.length > 0) {
        const fieldsToInsert = dynamicFields.map(f => ({
          document_id: docData.id,
          label: f.label,
          value: f.value
        }))
        await supabase.from('document_fields').insert(fieldsToInsert)
      }

      await supabase.from('activity_logs').insert({
        user_id: userData.user.id,
        action: 'create',
        module: 'document',
        description: `Created document: ${docState.title}`
      })

      toast.success("Document saved successfully!")
      router.push('/documents')
      router.refresh()
    } catch (e: any) {
      console.error('Save Error:', e)
      toast.error("Failed to save document", {
        description: e.message || "Unknown database error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-10rem)] animate-in fade-in duration-700 font-sans">
      {/* Configuration Panel */}
      <Card className="w-full lg:w-[400px] flex flex-col shadow-sm border-none overflow-hidden shrink-0 bg-white rounded-[24px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full theme-talent">
          <div className="bg-muted/50 p-2 border-b border-border/50">
            <TabsList className="grid grid-cols-5 w-full bg-white rounded-full p-1 h-12">
              <TabsTrigger value="header" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Hdr</TabsTrigger>
              <TabsTrigger value="body" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Body</TabsTrigger>
              <TabsTrigger value="fields" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Flds</TabsTrigger>
              <TabsTrigger value="sig" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Sgn</TabsTrigger>
              <TabsTrigger value="ftr" className="text-[10px] uppercase font-bold tracking-tight rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Ftr</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <TabsContent value="header" className="space-y-6 m-0 border-none outline-none">
               <div className="space-y-2">
                  <Label htmlFor="comp" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Company Name</Label>
                  <Input id="comp" name="header_company" value={docState.header_company} onChange={handleInputChange} placeholder="PT DocuForge Indonesia" className="bg-muted border-none rounded-xl h-12 focus:ring-1 focus:ring-primary" />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="sub" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Header Details</Label>
                  <Textarea id="sub" name="header_subtext" value={docState.header_subtext} onChange={handleInputChange} rows={3} placeholder="Address, Office, etc..." className="resize-none bg-muted border-none rounded-xl focus:ring-1 focus:ring-primary" />
               </div>
               <Separator className="bg-border/50" />
               <div className="space-y-3">
                  <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Company Logo</Label>
                  <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[20px] p-8 hover:bg-muted transition-colors cursor-pointer group relative bg-white border-border/50">
                    {headerLogoUrl ? (
                       <div className="relative">
                        <img src={headerLogoUrl} alt="Logo" className="max-h-24 object-contain rounded-md" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                           <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                             onChange={(e) => handleImageUpload(e, 'logos', setHeaderLogoUrl)} 
                           />
                           <p className="text-white text-xs font-medium">Change</p>
                        </div>
                       </div>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-secondary/30 mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-xs text-secondary/60 font-medium">Click to upload logo</p>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'logos', setHeaderLogoUrl)} 
                        />
                      </>
                    )}
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="body" className="space-y-6 m-0 border-none">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Document Title</Label>
                <Input id="title" name="title" value={docState.title} onChange={handleInputChange} placeholder="SURAT TUGAS" className="bg-muted border-none rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Reference Number</Label>
                <Input id="no" name="nomor" value={docState.nomor} onChange={handleInputChange} placeholder="No. 123/ST/2026" className="bg-muted border-none rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Theme Color</Label>
                <div className="flex items-center gap-3 bg-muted p-2 rounded-xl">
                  <div className="w-8 h-8 rounded-lg shadow-sm shrink-0 border border-white" style={{ backgroundColor: docState.text_color }} />
                  <Input type="color" name="text_color" value={docState.text_color} onChange={handleInputChange} className="flex-1 cursor-pointer h-8 border-none p-0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Introductory Paragraph</Label>
                <Textarea id="content" name="body_content" value={docState.body_content} onChange={handleInputChange} rows={6} className="resize-none bg-muted border-none rounded-xl" />
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-6 m-0 border-none">
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl">
                <div className="text-sm font-bold text-primary">Dynamic Fields</div>
                <Button variant="outline" size="sm" onClick={addDynamicField} className="h-8 rounded-full border-primary/20 bg-white text-primary text-xs hover:bg-primary/10">
                   <Plus className="w-3 h-3 mr-1" /> Add New
                </Button>
              </div>
              
              <div className="space-y-4">
                {dynamicFields.map((field) => (
                  <div key={field.id} className="relative p-5 border-none rounded-[20px] bg-muted group animate-in slide-in-from-left-2 transition-all">
                    <button onClick={() => removeDynamicField(field.id)} className="absolute -top-2 -right-2 bg-white border border-border text-secondary hover:text-destructive rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="space-y-4">
                      <Input value={field.label} onChange={(e) => updateDynamicField(field.id, 'label', e.target.value)} placeholder="Field Label (e.g. NIK)" className="h-10 text-sm font-bold border-none bg-white rounded-xl focus:ring-1 focus:ring-primary" />
                      <Input value={field.value} onChange={(e) => updateDynamicField(field.id, 'value', e.target.value)} placeholder="Value" className="h-10 text-sm bg-white border-none rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sig" className="space-y-6 m-0 border-none">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Location</Label>
                   <Input name="ttd_lokasi" value={docState.ttd_lokasi} onChange={handleInputChange} placeholder="Jakarta" className="bg-muted border-none rounded-xl" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Date String</Label>
                   <Input name="ttd_tanggal" value={docState.ttd_tanggal} onChange={handleInputChange} placeholder="10 Oct 2026" className="bg-muted border-none rounded-xl" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Signer Full Name</Label>
                   <Input name="ttd_nama" value={docState.ttd_nama} onChange={handleInputChange} placeholder="Sarah Connor" className="bg-muted border-none rounded-xl h-11 font-bold" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] uppercase font-bold text-secondary tracking-widest pl-1">Title / Position</Label>
                   <Input name="ttd_jabatan" value={docState.ttd_jabatan} onChange={handleInputChange} placeholder="Director" className="bg-muted border-none rounded-xl" />
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-center">
                   <Label className="text-[9px] uppercase font-bold text-secondary tracking-widest opacity-60">Company Stamp</Label>
                   <div className="relative aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center hover:bg-muted border-border/50 bg-gray-50/50 cursor-pointer">
                      {capImageUrl ? (
                        <img src={capImageUrl} className="w-full h-full object-contain p-2" alt="Cap" />
                      ) : (
                        <Layout className="w-6 h-6 text-secondary/20" />
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                        onChange={(e) => handleImageUpload(e, 'stamps', setCapImageUrl)} 
                        title="Upload Stamp" 
                      />
                   </div>
                </div>
                <div className="space-y-2 text-center">
                   <Label className="text-[9px] uppercase font-bold text-secondary tracking-widest opacity-60">Signature</Label>
                   <div className="relative aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center hover:bg-muted border-border/50 bg-gray-50/50 cursor-pointer">
                      {ttdImageUrl ? (
                        <img src={ttdImageUrl} className="w-full h-full object-contain p-2" alt="TTD" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-secondary/20" />
                      )}
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" 
                        onChange={(e) => handleImageUpload(e, 'signatures', setTtdImageUrl)} 
                        title="Upload Signature" 
                      />
                   </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ftr" className="space-y-4 m-0 border-none">
              <Label className="text-secondary text-xs font-bold uppercase tracking-widest pl-1">Notice / Footer Notes</Label>
              <Textarea name="footer_text" value={docState.footer_text} onChange={handleInputChange} rows={12} className="resize-none bg-muted border-none rounded-[20px] p-5 text-sm leading-relaxed" placeholder="Type document footer here..." />
            </TabsContent>
          </div>

          <div className="p-6 border-t border-border/50 bg-gray-50 flex flex-col gap-3">
             <Button onClick={saveDocument} disabled={isSaving} className="w-full h-14 rounded-full bg-primary text-white hover:bg-primary/90 font-bold text-base shadow-xl shadow-primary/20">
                {isSaving ? "Saving..." : "Save Document"}
                <Save className="ml-2 w-5 h-5" />
             </Button>
             <div className="grid grid-cols-2 gap-3 mt-3">
                <PDFExportButton printRef={previewRef} filename={docState.title || 'document'} />
                <WordExportButton state={docState} fields={dynamicFields} />
             </div>
          </div>
        </Tabs>
      </Card>

      {/* Realtime Preview Area (Sharp Corners & Full Visibility) */}
      <div className="flex-1 bg-muted/40 rounded-[40px] p-2 lg:p-6 flex justify-center items-start overflow-auto border border-border/30 shadow-inner group">
        <div 
          ref={previewRef} 
          className="w-[794px] min-h-[1123px] shrink-0 bg-white shadow-2xl m-auto p-0 flex flex-col rounded-none origin-top transition-all duration-500 scale-[0.5] sm:scale-[0.6] lg:scale-[0.7] xl:scale-[0.85] 2xl:scale-100 mb-[-400px] lg:mb-[-200px] xl:mb-[-100px] 2xl:mb-0 pb-20"
        >
          <DocumentPreview 
            state={docState} 
            fields={dynamicFields}
            logo={headerLogoUrl}
            stamp={capImageUrl}
            signature={ttdImageUrl}
          />
        </div>
      </div>
    </div>
  )
}
