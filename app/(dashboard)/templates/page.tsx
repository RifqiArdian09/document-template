'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, AppWindow, Trash2, Edit } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TemplatesPage() {
  const supabase = createClient()
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchTemplates = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('templates')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
    
    setTemplates(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      setTemplates(prev => prev.filter(t => t.id !== deleteId))
      
      // Log activity
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('activity_logs').insert({
          user_id: userData.user.id,
          action: 'delete',
          module: 'template',
          description: `Menghapus template dengan ID: ${deleteId}`
        })
      }
      
      toast.success("Template berhasil dihapus")
    } else {
      toast.error("Gagal menghapus template")
    }
    setDeleteId(null)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Template Dokumen</h1>
          <p className="text-secondary mt-1 font-medium">Kelola dan sempurnakan struktur yang dapat digunakan kembali untuk dokumen resmi.</p>
        </div>
        <Button asChild className="rounded-full px-6 h-12 bg-primary text-white hover:bg-primary/90 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Link href="/templates/create" className="flex items-center gap-2">
            <Plus className="size-5" />
            Buat Template Baru
          </Link>
        </Button>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-secondary">Nama Template</TableHead>
                <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-secondary">Tanggal Dibuat</TableHead>
                <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-secondary text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {isLoading ? (
                <TableRow>
                   <TableCell colSpan={3} className="h-48 text-center text-secondary font-bold">Sedang memuat...</TableCell>
                </TableRow>
              ) : templates.length > 0 ? (
                templates.map((tpl) => (
                  <TableRow key={tpl.id} className="hover:bg-muted/20 border-border group transition-colors">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                          <AppWindow className="size-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-base text-foreground">{tpl.name || 'Template Tanpa Judul'}</span>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Preset Struktur</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="text-sm font-bold text-secondary">
                        {new Date(tpl.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" size="icon" asChild className="rounded-2xl h-10 w-10 hover:bg-muted hover:text-primary transition-all active:scale-95">
                          <Link href={`/templates/${tpl.id}`}>
                            <Edit className="size-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-2xl h-10 w-10 hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95"
                          onClick={() => setDeleteId(tpl.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <AppWindow className="size-20 mb-4" />
                      <p className="text-xl font-black italic tracking-tight">Belum ada template.</p>
                      <p className="text-sm font-bold mt-1">Mulai dengan menambahkan struktur organisasi pertama Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[40px] p-10 border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black text-foreground tracking-tight">Hapus Template?</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary font-medium text-base mt-2">
              Tindakan ini akan menghapus template "{templates.find(t => t.id === deleteId)?.name}" secara permanen. Anda tidak dapat membatalkan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-full px-8 h-14 font-black border-2 border-border hover:bg-muted transition-all">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="rounded-full px-8 h-14 bg-destructive text-white font-black hover:bg-destructive/90 transition-all shadow-xl shadow-destructive/20"
            >
              Hapus Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
