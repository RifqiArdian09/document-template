import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import DocumentDetailClient from '@/components/document/DocumentDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (docError || !doc) {
    console.error('Document not found:', docError)
    return notFound()
  }

  // 2. Fetch Dynamic Fields
  const { data: fields } = await supabase
    .from('document_fields')
    .select('*')
    .eq('document_id', id)

  return (
    <DocumentDetailClient doc={doc} fields={fields || []} />
  )
}
