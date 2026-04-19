'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Download, Eye, Search, Filter, Calendar, Trash2, FileText, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function DocumentsPage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchDocuments = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('id, title, nomor, created_at')
      .order('created_at', { ascending: false })
    
    setDocuments(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== deleteId))
      // Log activity
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('activity_logs').insert({
          user_id: userData.user.id,
          action: 'delete',
          module: 'document',
          description: `Deleted document with ID: ${deleteId}`
        })
      }
      toast.success("Document deleted successfully")
    } else {
      toast.error("Failed to delete document")
    }
    setDeleteId(null)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Document Directory</h1>
          <p className="text-secondary mt-1">Manage and search your generated official paperwork.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full px-6 h-12 font-bold shadow-sm">
             <Filter className="w-4 h-4 mr-2" />
             Filter
           </Button>
           <Button asChild className="rounded-full px-6 h-12 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
             <Link href="/documents/create">
               <Plus className="w-4 h-4 mr-2" />
               New Document
             </Link>
           </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary/40" />
              <input placeholder="Search files by title or reference number..." className="w-full pl-12 pr-6 h-14 bg-card border-none rounded-[20px] shadow-sm text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
           </div>
        </div>

        <Card className="rounded-[24px] border-none shadow-sm bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-secondary">Document</TableHead>
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-secondary">Ref. No</TableHead>
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-secondary">Created On</TableHead>
                  <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-secondary text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/50">
                {isLoading ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm font-bold text-secondary">Retrieving records...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow key={doc.id} className="group hover:bg-muted/30 transition-colors border-none">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-2xl text-primary transition-transform group-hover:scale-110">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-base">{doc.title || 'Untitled'}</span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">Official Doc</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <Badge variant="outline" className="font-mono text-xs rounded-full border-border bg-muted/40 px-3 truncate max-w-[150px]">
                           {doc.nomor || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-2 text-secondary font-semibold text-sm">
                           <Calendar className="w-4 h-4 opacity-40" />
                           {new Date(doc.created_at).toLocaleDateString(undefined, {
                             year: 'numeric', month: 'short', day: 'numeric'
                           })}
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-muted">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px] rounded-2xl p-2 border-border shadow-2xl">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase text-secondary">Management</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors font-medium">
                                <Eye className="h-4 w-4 text-primary" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/documents/${doc.id}`} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors font-medium text-success-dark">
                                <Download className="h-4 w-4" /> Export PDF
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-destructive/10 text-destructive transition-colors font-bold"
                              onClick={() => setDeleteId(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-none">
                    <TableCell colSpan={4} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <FileText className="w-16 h-16 mb-2" />
                        <p className="font-bold">No documents matching the criteria.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-extrabold text-foreground">Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary font-medium mt-2">
              This will permanently delete the selected document. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="rounded-full px-6 h-12 font-bold border-border hover:bg-muted">Discard</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-full px-6 h-12 bg-destructive text-white font-bold hover:bg-destructive/90">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
