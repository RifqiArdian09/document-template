-- ==============================================================================
-- DATABASE SCHEMA FOR DOCUMENT-TEMPLATE
-- ==============================================================================
-- Instruksi: 
-- Jalankan (RUN) query SQL berikut secara keseluruhan di dalam Supabase "SQL Editor"
-- Pastikan Anda melakukannya pada project yang benar.
-- ==============================================================================

-- 1. Tabel Documents
-- Menyimpan informasi utama suatu dokumen.
CREATE TABLE documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  title text,
  nomor text,

  header_company text,
  header_subtext text,
  header_logo_url text,

  body_content text, 
  text_color text,

  ttd_nama text,
  ttd_jabatan text,
  ttd_lokasi text,
  ttd_tanggal text,

  ttd_image_url text,
  cap_image_url text,

  closing_content text,
  footer_text text,
  background_image_url text,
  ttd_align text default 'right',

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Tabel Templates
-- Menyimpan layout struktur template kasar (jika reusable).
CREATE TABLE templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,

  header_company text,
  header_subtext text,

  body_structure jsonb, 
  closing_content text,
  footer_text text,
  background_image_url text,
  ttd_align text default 'right',

  created_at timestamp with time zone default now()
);

-- RLS Policies for Templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own templates" ON templates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Tabel Document Fields (Dynamic input)
-- Menyimpan record input label & value untuk list format dinamis.
CREATE TABLE document_fields (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,

  label text,
  value text,

  created_at timestamp with time zone default now()
);

-- 4. Tabel Activity Logs
-- Menyimpan logs untuk seluruh aktivitas (Create, update, delete, download)
CREATE TABLE activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  action text, 
  module text, 

  description text,
  ip_address text,

  created_at timestamp with time zone default now()
);


-- ==============================================================================
-- KONFIGURASI STORAGE BUCKETS (PENTING)
-- ==============================================================================
-- Buka menu "Storage" pada Supabase dan buat (Create New Bucket) berikut secara manual:
-- 1. logos         -> Centang "Public bucket" 
-- 2. signatures    -> Centang "Public bucket" 
-- 3. stamps        -> Centang "Public bucket" 

-- Hal ini diperlukan agar modul HTML2Canvas dapat mengakses & menulis file
-- gambar ke dalam PDF tanpa terhalang CORS.
-- ==============================================================================
