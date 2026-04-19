import { createClient } from '@/utils/supabase/server'
import { 
  FileText, 
  AppWindow, 
  Activity, 
  TrendingUp, 
  Clock, 
  Search, 
  Calendar, 
  Zap, 
  FilePlus, 
  Settings as SettingsIcon,
  ShieldCheck,
  Eye,
  MessageSquare,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch some basic stats
  const { count: docsCount } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })

  const { count: templatesCount } = await supabase
    .from('templates')
    .select('id', { count: 'exact', head: true })

  const { data: recentLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: userData } = await supabase.auth.getUser()
  const userName = userData.user?.email?.split('@')[0] || 'Admin'

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-xl md:text-2xl font-black tracking-tight">Dashboard Admin</h1>
          <p className="text-secondary text-sm font-medium">Selamat datang kembali, <span className="text-primary">{userName}</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-card rounded-2xl border border-border flex items-center gap-2 shadow-sm">
            <Calendar className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">{today}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col rounded-[24px] border border-border p-5 gap-3 bg-card transition-all hover:shadow-xl hover:shadow-primary/5 group">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="size-5 text-primary" />
            </div>
            <p className="font-bold text-[10px] text-secondary uppercase tracking-[0.15em]">Total Dokumen</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="font-black text-3xl leading-none text-foreground">{(docsCount || 0).toLocaleString()}</p>
            <span className="text-[10px] bg-success/10 text-success-dark px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <TrendingUp className="size-3" /> +4.2%
            </span>
          </div>
        </div>

        <div className="flex flex-col rounded-[24px] border border-border p-5 gap-3 bg-card transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <AppWindow className="size-5 text-blue-500" />
            </div>
            <p className="font-bold text-[10px] text-secondary uppercase tracking-[0.15em]">Template Aktif</p>
          </div>
          <p className="font-black text-3xl leading-none text-foreground">{(templatesCount || 0).toLocaleString()}</p>
        </div>
        
        <div className="flex flex-col rounded-[24px] border border-border p-5 gap-3 bg-card transition-all hover:shadow-xl hover:shadow-purple-500/5 group">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Activity className="size-5 text-purple-500" />
            </div>
            <p className="font-bold text-[10px] text-secondary uppercase tracking-[0.15em]">Aktivitas Sistem</p>
          </div>
          <p className="font-black text-3xl leading-none text-foreground">{(recentLogs?.length || 0)}</p>
        </div>

        <div className="flex flex-col rounded-[24px] border border-border p-5 gap-3 bg-card transition-all hover:shadow-xl hover:shadow-warning/5 group">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-warning/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Eye className="size-5 text-warning" />
            </div>
            <p className="font-bold text-[10px] text-secondary uppercase tracking-[0.15em]">Total Tayangan</p>
          </div>
          <p className="font-black text-3xl leading-none text-foreground">1.2k</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent History Table */}
        <Card className="lg:col-span-2 rounded-[24px] border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
            <div>
              <h3 className="font-black text-base text-foreground">Riwayat Aktivitas</h3>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Log sistem terbaru</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-xl text-primary font-bold">
               <Link href="/activity-logs">
                 Lihat Semua <ChevronRight className="ml-1 size-4" />
               </Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Aksi</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Modul</TableHead>
                  <TableHead className="px-6 py-4 text-[10px) font-black uppercase tracking-widest text-secondary">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs && recentLogs.length > 0 ? (
                  recentLogs.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 border-none group transition-colors">
                      <TableCell className="px-6 py-4">
                        <span className="font-black text-sm text-foreground capitalize">{log.action}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="secondary" className="rounded-full bg-muted text-secondary border-none text-[9px] font-black px-2 py-0.5">
                          {log.module}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                          <span className="text-[10px] text-secondary">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-secondary font-bold italic text-sm">
                      Belum ada data aktivitas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-1">
             <h3 className="font-black text-sm uppercase tracking-widest text-secondary opacity-60">Tindakan Cepat</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
             <Link href="/documents/create" className="group p-4 rounded-[20px] bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex items-center gap-4">
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <FilePlus className="size-6 text-primary" />
                </div>
                <div>
                   <h4 className="font-black text-sm text-foreground mb-0.5">Buat Dokumen</h4>
                   <p className="text-[10px] text-secondary font-medium leading-tight">Buat surat atau dokumen baru.</p>
                </div>
                <ExternalLink className="ml-auto size-4 text-secondary/30 group-hover:text-primary transition-colors" />
             </Link>

             <Link href="/templates" className="group p-4 rounded-[20px] bg-card border border-border hover:border-blue-500/50 transition-all shadow-sm flex items-center gap-4">
                <div className="size-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <AppWindow className="size-6 text-blue-500" />
                </div>
                <div>
                   <h4 className="font-black text-sm text-foreground mb-0.5">Kelola Template</h4>
                   <p className="text-[10px] text-secondary font-medium leading-tight">Atur struktur dokumen bawaan.</p>
                </div>
                <ExternalLink className="ml-auto size-4 text-secondary/30 group-hover:text-blue-500 transition-colors" />
             </Link>

             <Link href="/settings" className="group p-4 rounded-[20px] bg-card border border-border hover:border-warning/50 transition-all shadow-sm flex items-center gap-4">
                <div className="size-12 bg-warning/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   <SettingsIcon className="size-6 text-warning" />
                </div>
                <div>
                   <h4 className="font-black text-sm text-foreground mb-0.5">Kustomisasi</h4>
                   <p className="text-[10px] text-secondary font-medium leading-tight">Ubah logo dan data instansi.</p>
                </div>
                <ExternalLink className="ml-auto size-4 text-secondary/30 group-hover:text-warning transition-colors" />
             </Link>
          </div>

          <Card className="rounded-[24px] bg-primary p-6 text-white overflow-hidden relative group">
             <div className="absolute -right-6 -top-6 size-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000" />
             <div className="relative z-10 flex flex-col gap-4">
                <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                   <Zap className="size-5 text-white" />
                </div>
                <div>
                   <h4 className="font-black text-lg">DocuForge Pro</h4>
                   <p className="text-xs text-white/80 font-medium">Aktifkan fitur pencetakan massal dan integrasi API.</p>
                </div>
                <Button className="w-fit bg-white text-primary border-none font-black rounded-full hover:bg-white/90">
                   Upgrade Sekarang
                </Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
