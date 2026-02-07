'use client'

import { useState } from 'react'

const WORKSPACE_ID = 'workspace-demo'

export default function CreateProductStep({
  onDone,
}: {
  onDone: (productId: string) => void
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    try {
      setLoading(true)

      const API_URL = process.env.NEXT_PUBLIC_API_URL
      if (!API_URL) throw new Error('Missing API URL')

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          name,
        }),
      })

      if (!res.ok) throw new Error('Create product failed')

      const product = await res.json()
      onDone(product.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        Tạo sản phẩm đầu tiên
      </h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Tên sản phẩm"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        disabled={!name || loading}
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Tiếp tục
      </button>
    </div>
  )
}
