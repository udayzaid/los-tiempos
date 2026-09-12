import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  getProfile,
  logout as logoutService,
} from '../components/auth/authService';

type Profile = {
  email?: string;
  name?: string;
  userName?: string;
  rol?: string | string[];
  role?: string | string[];
  [key: string]: any;
};

type AuthContextType = {
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  role: string | null;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

function extractRole(profile: Profile | null): string | null {
  if (!profile) {
    return null;
  }

  const roleValue =
    profile.rol ??
    profile.role ??
    (profile as any).Rol ??
    (profile as any).Role;

  if (Array.isArray(roleValue)) {
    return roleValue.length > 0
      ? String(roleValue[0])
      : null;
  }

  if (
    typeof roleValue === 'object' &&
    roleValue !== null
  ) {
    const values = Object.values(roleValue);

    if (values.length > 0) {
      return String(values[0]);
    }
  }

  if (typeof roleValue === 'string') {
    return roleValue;
  }

  return null;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshProfile = async () => {
    setLoading(true);

    try {
      const data = await getProfile();

      if (data) {
        console.info('[Auth] Perfil autenticado:', data);
        setProfile(data as Profile);
      } else {
        console.info(
          '[Auth] No existe una sesión autenticada.'
        );
        setProfile(null);
      }
    } catch (error) {
      console.error(
        '[Auth] Error actualizando perfil:',
        error
      );

      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error(
        '[Auth] Error al cerrar sesión:',
        error
      );
    } finally {
      // Limpiar inmediatamente el estado local.
      setProfile(null);
      setLoading(false);

      console.info('[Auth] Sesión local cerrada.');
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const role = extractRole(profile);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: !!profile,
        loading,
        role,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de un AuthProvider'
    );
  }

  return context;
}