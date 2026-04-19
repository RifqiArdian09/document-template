export type Document = {
  id: string
  user_id: string
  title: string | null
  nomor: string | null
  header_company: string | null
  header_subtext: string | null
  header_logo_url: string | null
  body_content: string | null
  text_color: string | null
  ttd_nama: string | null
  ttd_jabatan: string | null
  ttd_lokasi: string | null
  ttd_tanggal: string | null
  ttd_image_url: string | null
  cap_image_url: string | null
  footer_text: string | null
  created_at: string
  updated_at: string
}

export type Template = {
  id: string
  name: string | null
  header_company: string | null
  header_subtext: string | null
  body_structure: any | null
  footer_text: string | null
  created_at: string
}

export type DocumentField = {
  id: string
  document_id: string
  label: string | null
  value: string | null
  created_at: string
}

export type ActivityLog = {
  id: string
  user_id: string | null
  action: string | null
  module: string | null
  description: string | null
  ip_address: string | null
  created_at: string
}
