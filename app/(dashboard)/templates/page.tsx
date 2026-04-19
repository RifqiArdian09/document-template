import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Plus, AppWindow, Trash2, Edit, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function TemplatesPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Document Templates</h1>
          <p className="text-secondary mt-1 font-medium">Manage and refine reusable structures for official documents.</p>
        </div>
        <Button asChild className="rounded-full px-6 h-12 bg-primary text-white hover:bg-primary/90 font-black shadow-xl shadow-primary/20">
          <Link href="/templates/create" className="flex items-center gap-2">
            <Plus className="size-5" />
            Create New Template
          </Link>
        </Button>
      </div>

      <Card className="rounded-[24px] border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary">Template Name</TableHead>
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary">Created Date</TableHead>
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates && templates.length > 0 ? (
                templates.map((tpl: any) => (
                  <TableRow key={tpl.id} className="hover:bg-muted/20 border-border group transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                          <AppWindow className="size-5" />
                        </div>
                        <span className="font-black text-sm text-foreground">{tpl.name || 'Untitled Template'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <span className="text-sm font-bold text-secondary">
                        {new Date(tpl.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-muted hover:text-primary transition-colors">
                          <Link href={`/templates/${tpl.id}`}>
                            <Edit className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <AppWindow className="size-20 mb-4" />
                      <p className="text-xl font-black italic tracking-tight">No templates discovered.</p>
                      <p className="text-sm font-bold mt-1">Start by adding your first organizational structure.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
