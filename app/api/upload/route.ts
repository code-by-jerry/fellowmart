import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin-server'
import { getImageKitClient } from '@/lib/imagekit'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function POST(request: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const supabase = await createAdminClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse multipart form ─────────────────────────────────────────────────
    const form = await request.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string | null) ?? 'uploads'

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ── Validate type & size ─────────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Accepted: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5 MB.' },
        { status: 400 },
      )
    }

    // ── Upload to ImageKit ───────────────────────────────────────────────────
    const buffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(buffer)

    const result = await getImageKitClient().files.upload({
      file: new File([uint8], file.name, { type: file.type }),
      fileName: file.name,
      folder: `/${folder}`,
      useUniqueFileName: true,
    })

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[/api/upload]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
