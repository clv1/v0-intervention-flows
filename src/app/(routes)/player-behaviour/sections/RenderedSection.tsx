'use client'

import { useBehaviourSelectorStore } from '@/store/useBehaviourSelectorStore'
import BehaviourFrequency from "./BehaviourFrequency"
import LLMSummary from "./LLMSummary"

export default function RenderedSection() {
  const { selectedBehaviour } = useBehaviourSelectorStore();

  return (
    <>
      {selectedBehaviour === 'Behaviour Analysis' && (
        <>
          <div className='col-6 d-flex flex-column justify-content-center align-items-center'>
            <BehaviourFrequency />
          </div>
          <div className='col-6 d-flex flex-column justify-content-center align-items-center'>
            <LLMSummary />
          </div>
        </>
      )}
    </>
  )
} 