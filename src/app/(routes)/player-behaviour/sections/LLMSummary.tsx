'use client'

import { useBehaviourListStore } from "@/store/useBehaviourListStore"

export default function LLMSummary() {
  const { selectedBehaviour } = useBehaviourListStore()
  
  if (!selectedBehaviour) return null

  return (
    <div>
      Summary for {selectedBehaviour}
    </div>
  )
} 