import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, login as apiLogin, register as apiRegister, type AuthUser } from "../../api/auth";
import { ApiError, setStoredToken } from "../../api/client";

const SESSION_KEY = "foundmate.auth.v1";

interface StoredSession {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (!parsed.token || !parsed.user) return null;
    return { token: parsed.token, user: parsed.user };
  } catch {
    return null;
  }
}

function saveStoredSession(session: StoredSession | null): void {
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setStoredToken(session.token);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
    setStoredToken(null);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const stored = loadStoredSession();
    if (!stored) {
      setIsRestoring(false);
      return;
    }

    setStoredToken(stored.token);
    setSession(stored);

    getCurrentUser()
      .then((user) => {
        setSession((current) => (current ? { ...current, user } : current));
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          saveStoredSession(null);
          setSession(null);
        }
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    const next = { token: response.token, user: response.user };
    saveStoredSession(next);
    setSession(next);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiRegister({ name, email, password });
    const next = { token: response.token, user: response.user };
    saveStoredSession(next);
    setSession(next);
  };

  const logout = () => {
    saveStoredSession(null);
    setSession(null);
  };

  const updateUser = (user: AuthUser) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, user };
      saveStoredSession(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: session !== null,
        isRestoring,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}