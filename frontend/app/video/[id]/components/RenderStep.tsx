export function RenderStep({ step }: { step: string }) {
  return (
    <div className="text-sm text-gray-700">
      Current step:{' '}
      <span className="font-semibold text-gray-900">
        {step}
      </span>
    </div>
  )
}
