import { create } from 'zustand';

type State = {
  selectedPlayer: number | null;
};

type Actions = {
  setSelectedPlayer: (id: number) => void;
};

export const useSelectedPlayer = create<State & Actions>((set) => ({
  selectedPlayer: null,
  setSelectedPlayer: (id) => set({ selectedPlayer: id }),
})); 