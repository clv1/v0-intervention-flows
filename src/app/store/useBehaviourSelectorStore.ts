import { create } from 'zustand';

interface BehaviourSelectorState {
  selectedBehaviour: string;
  setSelectedBehaviour: (behaviour: string) => void;
}

export const useBehaviourSelectorStore = create<BehaviourSelectorState>((set) => ({
  selectedBehaviour: 'Behaviour Analysis',
  setSelectedBehaviour: (behaviour: string) => set({ selectedBehaviour: behaviour }),
})); 