import { createContext, useContext, useState, type ReactNode } from "react";
import type { FoundmateProfile } from "../../types/profile";
import { clearStoredProfile, loadProfile, persistProfile } from "../../utils/profileStorage";

interface ProfileContextValue {
  profile: FoundmateProfile | null;
  saveProfile: (profile: FoundmateProfile) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FoundmateProfile | null>(() => loadProfile());

  const saveProfile = (nextProfile: FoundmateProfile) => {
    persistProfile(nextProfile);
    setProfile(nextProfile);
  };

  const clearProfile = () => {
    clearStoredProfile();
    setProfile(null);
  };

  return <ProfileContext.Provider value={{ profile, saveProfile, clearProfile }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside ProfileProvider");
  return context;
}
