
import React, { useState, useContext, createContext, useMemo } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  // Accept either a full User object (from API) or legacy (email, role)
  login: (userOrEmail: User | string, role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      const parsed = JSON.parse(storedUser);
      // Normalize backend `_id` to `id` used on frontend
      if (parsed && parsed._id && !parsed.id) {
        parsed.id = parsed._id;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = (userOrEmail: User | string, role?: UserRole) => {
    // If caller passed a full User object (from API), store it directly.
    if (typeof userOrEmail === 'object' && userOrEmail !== null) {
      const raw = userOrEmail as any;
      // normalize backend `_id` -> `id`
      const u: User = {
        id: raw.id || raw._id || String(raw.email || '1'),
        name: raw.name || raw.email?.split?.('@')?.[0] || 'User',
        email: raw.email || '',
        phone: raw.phone || '',
        role: (raw.role as UserRole) || UserRole.CLIENT,
        password: raw.password,
        licenseNumber: raw.licenseNumber,
        city: raw.city,
        assignedBusId: raw.assignedBusId,
        status: raw.status,
      };

      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return;
    }

    // Backwards-compatible: caller provided email and role
    const email = userOrEmail as string;
    const mockUser: User = {
      id: '1',
      email: email,
      name: (typeof email === 'string' && email.includes('@')) ? email.split('@')[0] : String(email),
      role: role || UserRole.CLIENT,
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
