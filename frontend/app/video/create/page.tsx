'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  createVideoProject,
  updateVideoProjectContent,
  renderVideoProject,
} from '@/app/lib/api/videoProjects'

type UploadedMedia = {
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

// =========================
// MAP ACTION → VIDEO CONFIG
// =========================
function getVideoConfigFromAction(actionType: string | null) {
  switch (actionType) {
    case 'SCALE_FORMAT':
      return {
        type: 'SELL',
        template: 'before-after',
      }
    case 'RETEST_WITH_NEW_FORMAT':
      return {
        type: 'SELL',
        template: 'pov',
      }
    case 'MAKE_MORE_VIDEOS':
    default:
      return {
        type: 'SELL',
        template: 'slideshow',
      }
  }
}

export default function VideoCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // =========================
  // CONTEXT FROM DAILY ACTION
  // =========================
  const productId = searchParams.get('productId')
  const actionType = searchParams.get('actionType')
  const dailyActionId = searchParams.get('dailyActionId')

  if (!productId) {
    return (
      <div className="p-6 text-red-600">
        ❌ Thiếu productId (Create Video phải đi từ DailyAction)
      </div>
    )
  }

  const { type, template } = getVideoConfigFromAction(actionType)

  // =========================
  // MEDIA
  // =========================
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([])

  // =========================
  // PROMPT
  // =========================
  const [prompt, setPrompt] = useState('')

  // =========================
  // PROJECT DATA
  // =========================
  const [project, setProject] = useState<any>(null)
  const [scriptData, setScriptData] = useState<any>(null)
  const [caption, setCaption] = useState('')

  // =========================
  // UI STATE
  // =========================
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =========================
  // MEDIA HANDLERS
  // =========================
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

  // =========================
  // STEP 1: CREATE PROJECT
  // =========================
  const generateScript = async () => {
    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('productId', productId)
      formData.append('platform', 'TIKTOK')
      formData.append('type', type)
      formData.append('template', template)
      formData.append('userPrompt', prompt)

      mediaList.forEach((m) => {
        formData.append('files', m.file)
      })

      const res = await createVideoProject(formData)

      setProject(res)
      setScriptData(res.scriptData)
      setCaption(res.caption)

      // ✅ MARK DAILY ACTION DONE (ĐÚNG THỜI ĐIỂM)
      if (dailyActionId) {
        await fetch(`/api/daily-actions/${dailyActionId}/done`, {
          method: 'POST',
        })
      }
    } catch (e: any) {
      setError(e.message || 'FAILED_TO_CREATE_VIDEO_PROJECT')
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // STEP 2: RENDER VIDEO
  // =========================
  const handleRender = async () => {
    if (!project) return

    try {
      setLoading(true)
      setError(null)

      // save edited content
      await updateVideoProjectContent(project.id, {
        scriptData,
        caption,
      })

      // start render
      await renderVideoProject(project.id)

      // go to progress page
      router.push(`/video/${project.id}`)
    } catch (e: any) {
      setError(e.message || 'FAILED_TO_RENDER_VIDEO')
    } finally {
      setLoading(false)
    }
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
        <p>
          <b>Template gợi ý:</b> {template}
        </p>
      </div>

      {/* ACTION HINT */}
      {actionType && (
        <div className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-700">
          {actionType === 'MAKE_MORE_VIDEOS' &&
            'Hôm nay nên làm thêm video cho sản phẩm này'}
          {actionType === 'SCALE_FORMAT' &&
            'Format đang hiệu quả, hãy nhân bản thêm video'}
          {actionType === 'RETEST_WITH_NEW_FORMAT' &&
            'Thử lại sản phẩm bằng format mới'}
        </div>
      )}

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
          placeholder="Ví dụ: Giọng review trung lập, nói như trải nghiệm cá nhân"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          disabled={mediaList.length === 0 || loading}
          onClick={generateScript}
          className="mt-3 rounded bg-black px-4 py-2 text-white disabled:opacity-40"
        >
          {loading ? 'Đang tạo nội dung...' : 'Tạo nội dung'}
        </button>
      </div>

      {/* STEP 3: REVIEW & EDIT */}
      {scriptData && (
        <div className="mt-10">
          <h2 className="font-semibold mb-3">
            3️⃣ Nội dung video (có thể chỉnh)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Hook</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={scriptData.hook}
                onChange={(e) =>
                  setScriptData({ ...scriptData, hook: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Script (giọng đọc)</label>
              {scriptData.body.map((line: string, idx: number) => (
                <textarea
                  key={idx}
                  className="mt-1 w-full rounded border p-2"
                  rows={2}
                  value={line}
                  onChange={(e) => {
                    const newBody = [...scriptData.body]
                    newBody[idx] = e.target.value
                    setScriptData({ ...scriptData, body: newBody })
                  }}
                />
              ))}
            </div>

            <div>
              <label className="text-sm font-medium">CTA</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={scriptData.cta}
                onChange={(e) =>
                  setScriptData({ ...scriptData, cta: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Caption</label>
              <textarea
                className="mt-1 w-full rounded border p-2"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          <button
            className="mt-6 rounded bg-green-600 px-6 py-3 text-white"
            onClick={handleRender}
            disabled={loading}
          >
            {loading ? 'Đang render...' : 'Render video'}
          </button>

          {error && <p className="mt-3 text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
