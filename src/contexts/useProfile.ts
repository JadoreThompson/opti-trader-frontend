import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Profile {
  avatar: string;
  username: string;
  balance: string;
  is_user: boolean;
}

type ProfileState = {
  profile?: Profile;
  setProfile: (
    arg: Profile | undefined | ((arg: Profile | undefined) => Profile)
  ) => void;
};

export const useProfile = create(
  persist<ProfileState>(
    (set) => ({
      profile: undefined,
      setProfile: (newProfile) =>
        set((state) => ({
          profile:
            typeof newProfile === "function"
              ? newProfile(state.profile)
              : newProfile,
        })),
    }),
    { name: "profile" }
  )
);
