'use client'

export default function CreateFirstVideoStep({
  productId,
  onDone,
}: {
  productId: string
  onDone: () => void
}) {
  async function handleCreate() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_URL) return

    await fetch(`${API_URL}/video-projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        type: 'SELL',
        template: 'slideshow',
        status: 'DRAFT',
      }),
    })

    onDone()
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Tạo video đầu tiên
      </h1>

      <p className="text-gray-500 mb-4">
        Video này giúp hệ thống bắt đầu test sản phẩm
      </p>

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Tạo video
      </button>
    </div>
  )
}
