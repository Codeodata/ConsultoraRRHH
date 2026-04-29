import { createClient, SupabaseClient } from '@supabase/supabase-js'

const BUCKET_NAME = 'documents'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase env vars not configured')
    _client = createClient(url, key)
  }
  return _client
}

export async function uploadFile(
  tenantId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const storagePath = `${tenantId}/${safeName}`

  const { error } = await getClient()
    .storage.from(BUCKET_NAME)
    .upload(storagePath, buffer, { contentType: mimeType, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  return storagePath
}

export function getFileUrl(storagePath: string): string {
  const { data } = getClient().storage.from(BUCKET_NAME).getPublicUrl(storagePath)
  return data.publicUrl
}

export async function deleteFile(storagePath: string): Promise<void> {
  await getClient().storage.from(BUCKET_NAME).remove([storagePath])
}
