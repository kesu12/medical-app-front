import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, logout as apiLogout, isLoggedIn, User } from '../api/auth';

type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load user:', e);
      setUser(null);
      setLoading(false);
    }
  }

  async function refreshUser() {
    setLoading(true);
    await loadUser();
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

