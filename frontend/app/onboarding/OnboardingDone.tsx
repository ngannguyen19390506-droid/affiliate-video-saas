'use client'

import { useRouter } from 'next/navigation'

export default function OnboardingDone() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold mb-4">
        🎉 Hoàn tất
      </h1>

      <p className="text-gray-500 mb-6">
        Bạn đã sẵn sàng bắt đầu
      </p>

      <button
        onClick={() => router.push('/dashboard')}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Vào Dashboard
      </button>
    </div>
  )
}
