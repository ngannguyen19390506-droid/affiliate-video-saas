'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

type UploadedMedia = {
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

type VideoScriptDraft = {
  hook: string
  script: string
  caption: string
}

export default function VideoCreatePage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const actionType = searchParams.get('actionType')

  // MEDIA
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([])

  // PROMPT & SCRIPT
  const [prompt, setPrompt] = useState('')
  const [scriptDraft, setScriptDraft] = useState<VideoScriptDraft | null>(null)
  const [generating, setGenerating] = useState(false)

  // ---- MEDIA HANDLERS ----
  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newMedia: UploadedMedia[] = []

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video')
      const isImage = file.type.startsWith('image')
      if (!isVideo && !isImage) return

      newMedia.push({
        file,
        previewUrl: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
      })
    })

    setMediaList((prev) => [...prev, ...newMedia])
  }

  const removeMedia = (index: number) => {
    setMediaList((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].previewUrl)
      copy.splice(index, 1)
      return copy
    })
  }

  // ---- MOCK AI GENERATE ----
  const generateScript = async () => {
    setGenerating(true)

    // Giả lập AI delay
    setTimeout(() => {
      setScriptDraft({
        hook: 'Bạn có đang gặp vấn đề này không?',
        script: `Mình đã thử sản phẩm ${productId} và khá bất ngờ.
Sau vài ngày sử dụng, mình thấy điểm mạnh nhất là sự tiện lợi và dễ dùng.
Nếu bạn đang gặp vấn đề tương tự, đây có thể là giải pháp đáng thử.`,
        caption:
          'Mình vừa test sản phẩm này và kết quả khá ổn 👍 Ai đang quan tâm thì xem thử nhé!',
      })
      setGenerating(false)
    }, 1200)
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">Tạo video mới</h1>

      {/* CONTEXT */}
      <div className="mt-4 rounded-lg border p-4 text-sm text-gray-600">
        <p>
          <b>Sản phẩm:</b> {productId}
        </p>
        <p>
          <b>Action:</b> {actionType}
        </p>
      </div>

      {/* STEP 1: UPLOAD */}
      <div className="mt-8">
        <h2 className="font-semibold mb-2">1️⃣ Upload ảnh hoặc video</h2>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:bg-gray-50">
          <p className="text-gray-500">
            Kéo thả ảnh / video hoặc click để chọn
          </p>

          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {mediaList.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((media, index) => (
              <div key={index} className="relative border rounded p-2">
                {media.type === 'image' ? (
                  <img
                    src={media.previewUrl}
                    className="h-32 w-full object-cover rounded"
                  />
                ) : (
                  <video
                    src={media.previewUrl}
                    className="h-32 w-full rounded"
                    controls
                  />
                )}

                <button
                  className="absolute top-1 right-1 text-xs bg-black text-white px-2 py-1 rounded"
                  onClick={() => removeMedia(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 2: PROMPT */}
      <div className="mt-10">
        <h2 className="font-semibold mb-2">2️⃣ Prompt bổ sung</h2>

        <textarea
          className="w-full rounded border p-3 text-sm"
          rows={3}
          placeholder="Ví dụ: Giọng review trung lập, nói như trải nghiệm cá nhân, không sale gắt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          disabled={mediaList.length === 0 || generating}
          onClick={generateScript}
          className="mt-3 rounded bg-black px-4 py-2 text-white disabled:opacity-40"
        >
          {generating ? 'Đang tạo nội dung...' : 'Tạo nội dung'}
        </button>
      </div>

      {/* STEP 3: SCRIPT EDITOR */}
      {scriptDraft && (
        <div className="mt-10">
          <h2 className="font-semibold mb-3">3️⃣ Nội dung video (có thể chỉnh)</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Hook</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={scriptDraft.hook}
                onChange={(e) =>
                  setScriptDraft({ ...scriptDraft, hook: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Script (giọng đọc)</label>
              <textarea
                className="mt-1 w-full rounded border p-2"
                rows={4}
                value={scriptDraft.script}
                onChange={(e) =>
                  setScriptDraft({ ...scriptDraft, script: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Caption</label>
              <textarea
                className="mt-1 w-full rounded border p-2"
                rows={2}
                value={scriptDraft.caption}
                onChange={(e) =>
                  setScriptDraft({ ...scriptDraft, caption: e.target.value })
                }
              />
            </div>
          </div>

          <button
            className="mt-6 rounded bg-green-600 px-6 py-3 text-white"
          >
            Render video
          </button>
        </div>
      )}
    </div>
  )
}
