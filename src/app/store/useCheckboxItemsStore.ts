import { create } from 'zustand'

interface CheckboxItemsState {
  selectedItems: string[]
  setSelectedItems: (items: string[]) => void
  clearStore: () => void
}

export const useCheckboxItemsStore = create<CheckboxItemsState>((set) => ({
  selectedItems: [],
  setSelectedItems: (items) => set({ selectedItems: items }),
  clearStore: () => set({ selectedItems: [] })
})) 