import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import TemplateBuilder from '@/components/template/TemplateBuilder'

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!template) {
    notFound()
  }

  return (
    <TemplateBuilder mode="edit" initialData={template} />
  )
}
