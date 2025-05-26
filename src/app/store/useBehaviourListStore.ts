import { create } from 'zustand'
import { ListOfBehaviours } from '@/data/data'

interface BehaviourListState {
  selectedBehaviour: string | null
  setSelectedBehaviour: (behaviour: string | null) => void
}

// Set initial behaviour to first subcategory of first behavior
const initialSelectedBehaviour = ListOfBehaviours[0]?.subcategories[0] 
  ? `${ListOfBehaviours[0].name}:${ListOfBehaviours[0].subcategories[0]}`
  : null

export const useBehaviourListStore = create<BehaviourListState>((set) => ({
  selectedBehaviour: initialSelectedBehaviour,
  setSelectedBehaviour: (behaviour) => set({ selectedBehaviour: behaviour }),
})) 