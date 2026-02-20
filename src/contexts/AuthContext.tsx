import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, setToken, clearToken, getToken, UserProfile } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'freelancer') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session from stored JWT
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const { user: me } = await authApi.me();
          setUser(me);
        } catch {
          // Token expired or invalid — clear it
          clearToken();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'freelancer'
  ) => {
    const { token, user: newUser } = await authApi.register({
      email,
      password,
      full_name: fullName,
      role,
    });
    setToken(token);
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const { token, user: loggedIn } = await authApi.login({ email, password });
    setToken(token);
    setUser(loggedIn);
  };

  const signOut = () => {
    clearToken();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { user: me } = await authApi.me();
      setUser(me);
    } catch {
      signOut();
    }
  };

  const value: AuthContextType = {
    user,
    profile: user, // profile === user in this implementation
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
