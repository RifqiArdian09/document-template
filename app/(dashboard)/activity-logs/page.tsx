import { createClient } from '@/utils/supabase/server'
import { Activity, Clock, Search, Filter } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function ActivityLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })

  const getBadgeVariant = (action: string | null) => {
    switch (action?.toLowerCase()) {
      case 'create': return 'default'
      case 'update': return 'secondary'
      case 'delete': return 'destructive'
      case 'download': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Activity Records</h1>
          <p className="text-secondary mt-1 font-medium">Review all administrative actions and system events.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/40" />
            <Input placeholder="Search logs..." className="pl-11 h-12 bg-card border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20" />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-border bg-card">
            <Filter className="h-4 w-4 mr-2 opacity-60" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="rounded-[24px] border-none shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary">Action</TableHead>
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary">Module</TableHead>
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary">Description</TableHead>
                <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-secondary text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log: any) => (
                  <TableRow key={log.id} className="hover:bg-muted/20 border-border group transition-colors">
                    <TableCell className="px-8 py-5">
                      <Badge variant={getBadgeVariant(log.action)} className="capitalize px-3 py-1 text-[10px] tracking-widest font-black rounded-full shadow-sm">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="size-8 bg-muted rounded-xl flex items-center justify-center text-secondary border border-border/10">
                           <Activity className="h-4 w-4" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-wider text-foreground">{log.module}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <span className="text-sm font-medium text-secondary">{log.description || '-'}</span>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-black">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <span className="text-[10px] text-secondary font-bold">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Activity className="w-16 h-16 mb-4" />
                      <p className="text-lg font-black italic tracking-tight">No system logs found.</p>
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
