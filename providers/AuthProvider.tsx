'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string; // e.g., 'Father', 'Mother', 'Son', 'Daughter'
  ageGroup: 'adult' | 'teen' | 'child';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAs: (roleName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const mockUsers: Record<string, User> = {
  Father: {
    uid: 'mem_father_123',
    email: 'hrushikesh@zeroroute.in',
    displayName: 'Hrushikesh',
    role: 'Father',
    ageGroup: 'adult',
  },
  Mother: {
    uid: 'mem_mother_123',
    email: 'nakshatra@zeroroute.in',
    displayName: 'Nakshatra',
    role: 'Mother',
    ageGroup: 'adult',
  },
  Son: {
    uid: 'mem_son_123',
    email: 'shreyas@zeroroute.in',
    displayName: 'Shreyas',
    role: 'Son',
    ageGroup: 'teen',
  },
  Daughter: {
    uid: 'mem_daughter_123',
    email: 'anika@zeroroute.in',
    displayName: 'Anika',
    role: 'Daughter',
    ageGroup: 'child',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage if available
    const savedUser = localStorage.getItem('zr_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      // Default to Father on first load
      setUser(mockUsers['Father']);
      localStorage.setItem('zr_user', JSON.stringify(mockUsers['Father']));
    }
    setLoading(false);
  }, []);

  const loginAs = (roleName: string) => {
    const selectedUser = mockUsers[roleName] || null;
    setUser(selectedUser);
    if (selectedUser) {
      localStorage.setItem('zr_user', JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem('zr_user');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zr_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
