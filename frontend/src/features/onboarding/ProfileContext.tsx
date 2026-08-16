import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { updateCurrentUser } from "../../api/auth";
import type { FoundmateProfile } from "../../types/profile";
import { clearStoredProfile, loadProfile, persistProfile } from "../../utils/profileStorage";
import { useAuth } from "../auth/AuthContext";

interface ProfileContextValue {
  profile: FoundmateProfile | null;
  saveProfile: (profile: FoundmateProfile) => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<FoundmateProfile | null>(() => loadProfile());

  useEffect(() => {
    if (!user) return;
    setProfile((current) => {
      if (!current) return current;
      const next = { ...current, name: user.name, headline: user.headline ?? current.headline };
      if (next.name === current.name && next.headline === current.headline) return current;
      persistProfile(next);
      return next;
    });
  }, [user]);

  const saveProfile = async (nextProfile: FoundmateProfile) => {
    const updated = await updateCurrentUser({ name: nextProfile.name, headline: nextProfile.headline });
    updateUser(updated);
    persistProfile({ ...nextProfile, name: updated.name, headline: updated.headline ?? "" });
    setProfile({ ...nextProfile, name: updated.name, headline: updated.headline ?? "" });
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