import { create } from "zustand";

export const useNameState = create((set) => ({
  name: "",
  setName: (newName) => set({ name: newName }),
}));
