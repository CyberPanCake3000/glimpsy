'use client';

import { createContext, useContext, useState } from 'react';
import { emptyStartProfile, type StartProfile } from '@/types/startProfile';

type ProfileContextType = {
  profile: StartProfile;
  setProfile: (profile: StartProfile) => void;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children, initialProfile = emptyStartProfile, }: { children: React.ReactNode, initialProfile?: StartProfile }) {
  const [profile, setProfile] = useState<StartProfile>(initialProfile);
  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}