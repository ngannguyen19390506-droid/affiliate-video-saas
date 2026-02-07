'use client'

import { useState } from 'react'
import CreateProductStep from './CreateProductStep'
import CreateFirstVideoStep from './CreateFirstVideoStep'
import OnboardingDone from './OnboardingDone'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [productId, setProductId] = useState<string | null>(null)

  if (step === 1) {
    return (
      <CreateProductStep
        onDone={(id) => {
          setProductId(id)
          setStep(2)
        }}
      />
    )
  }

  if (step === 2 && productId) {
    return (
      <CreateFirstVideoStep
        productId={productId}
        onDone={() => setStep(3)}
      />
    )
  }

  return <OnboardingDone />
}
