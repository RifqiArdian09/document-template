import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DocumentBuilder from '@/components/document/DocumentBuilder'
import { Button } from "@/components/ui/button"

export default function CreateDocumentPage() {
  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          asChild 
          className="rounded-full size-12 border-none bg-card shadow-sm hover:shadow-md transition-all group"
        >
          <Link href="/documents">
            <ArrowLeft className="size-5 text-secondary group-hover:text-primary transition-colors" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Draft Document</h1>
          <p className="text-secondary font-medium mt-1">Design and customize your new official paper in real-time.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DocumentBuilder />
      </div>
    </div>
  )
}
