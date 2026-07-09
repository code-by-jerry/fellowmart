'use client'

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react'
import { UploadCloud, X, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  /** Called with the ImageKit CDN URL once the upload succeeds */
  onUpload: (url: string) => void
  /** Pre-fill with an existing URL (e.g. when editing a record) */
  currentUrl?: string
  /** ImageKit folder to upload into, e.g. "products" or "branding" */
  folder?: string
  /** Optional label shown above the drop-zone */
  label?: string
  /** Whether upload is disabled */
  disabled?: boolean
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function ImageUpload({
  onUpload,
  currentUrl,
  folder = 'uploads',
  label,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled) return

      // Optimistic local preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setUploadState('uploading')
      setErrorMsg(null)

      try {
        const form = new FormData()
        form.append('file', file)
        form.append('folder', folder)

        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const json = await res.json()

        if (!res.ok) throw new Error(json.error ?? 'Upload failed')

        setPreviewUrl(json.url)
        setUploadState('done')
        onUpload(json.url)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setErrorMsg(msg)
        setUploadState('error')
        // revert to old preview
        setPreviewUrl(currentUrl ?? null)
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    },
    [folder, onUpload, currentUrl, disabled],
  )

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const clearImage = () => {
    setPreviewUrl(null)
    setUploadState('idle')
    setErrorMsg(null)
    onUpload('')
  }

  const isUploading = uploadState === 'uploading'

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload image"
        className={[
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden',
          previewUrl ? 'h-48' : 'h-36',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ].join(' ')}
      >
        {/* Preview image */}
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-contain p-2"
            unoptimized
          />
        )}

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium text-gray-600">Uploading…</span>
          </div>
        )}

        {/* Empty state */}
        {!previewUrl && !isUploading && (
          <div className="flex flex-col items-center gap-2 px-4 text-center pointer-events-none">
            <div className="rounded-full bg-primary/10 p-3">
              {isDragging ? (
                <UploadCloud className="h-5 w-5 text-primary" />
              ) : (
                <ImageIcon className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop to upload' : 'Click or drag an image here'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP, GIF, SVG — max 5 MB</p>
            </div>
          </div>
        )}

        {/* Clear button */}
        {previewUrl && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              clearImage()
            }}
            aria-label="Remove image"
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1 shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-600 hover:text-red-500" />
          </button>
        )}
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {errorMsg}
        </p>
      )}

      {/* Success badge */}
      {uploadState === 'done' && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <span>✓</span> Uploaded successfully
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={onInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden
      />
    </div>
  )
}
