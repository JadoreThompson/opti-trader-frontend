import { create } from "zustand";
import { persist } from "zustand/middleware";

type IsLoggedInState = {
  isLoggedIn: boolean;
  setIsLoggedIn: (arg: boolean | ((arg: boolean) => boolean)) => void;
};

export const useIsLoggedIn = create(
  persist<IsLoggedInState>(
    (set) => ({
      isLoggedIn: false,
      setIsLoggedIn: (value) =>
        set((state) => ({
          isLoggedIn:
            typeof value === "function" ? value(state.isLoggedIn) : value,
        })),
    }),
    {
      name: "logged-in",
    }
  )
);
