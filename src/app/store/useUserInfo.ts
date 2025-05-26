import { create } from 'zustand';

interface UserInfo {
  firstName: string | undefined;
  lastName: string | undefined;
  position: string | undefined;
  teamID: number | undefined;
}

type State = {
  userInfo: UserInfo | null;
};

type Actions = {
  setUserInfo: (info: UserInfo) => void;
};

export const useUserInfo = create<State & Actions>((set) => ({
  userInfo: null,
  setUserInfo: (info) => set({ userInfo: info }),
})); 