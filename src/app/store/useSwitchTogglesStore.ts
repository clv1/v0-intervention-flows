import { create } from 'zustand'

interface SwitchTogglesState {
  overlayMode: boolean
  chartMode: boolean
  averageType: boolean
  setOverlayMode: (value: boolean) => void
  setChartMode: (value: boolean) => void
  setAverageType: (value: boolean) => void
  clearStore: () => void
}

export const useSwitchTogglesStore = create<SwitchTogglesState>((set) => ({
  overlayMode: false,
  chartMode: false,
  averageType: false,
  setOverlayMode: (value) => set({ overlayMode: value }),
  setChartMode: (value) => set({ chartMode: value }),
  setAverageType: (value) => set({ averageType: value }),
  clearStore: () => set({ overlayMode: false, chartMode: false, averageType: false })
})) 