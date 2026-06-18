/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { api, getStoredToken, clearStoredToken } from "../lib/api";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (loginIdentifier: string, password: string) => Promise<void>;
  signUp: (payload: any) => Promise<void>;
  signOut: () => void;
  updateUser: (newUser: User) => void;
  easyLogin: (asWho: "tech" | "chef" | "space" | "lofi") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user on mount if token is saved
  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setCurrentUser(data.user);
      } catch (e) {
        console.error("Session expired or token invalid", e);
        clearStoredToken();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (loginIdentifier: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.login({ loginIdentifier, password });
      setCurrentUser(data.user);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
  };

  const signUp = async (payload: any) => {
    setLoading(true);
    try {
      const data = await api.register(payload);
      setCurrentUser(data.user);
    } catch (e) {
      setLoading(false);
      throw e;
    }
    setLoading(false);
  };

  const signOut = () => {
    clearStoredToken();
    setCurrentUser(null);
  };

  const updateUser = (newUser: User) => {
    setCurrentUser(newUser);
  };

  const easyLogin = async (asWho: "tech" | "chef" | "space" | "lofi") => {
    // Convenient simulation logins utilizing seeded database user passwords
    const mapper = {
      tech: { ident: "technexus", pass: "tech123" },
      chef: { ident: "chefelite", pass: "chef123" },
      space: { ident: "cosmic", pass: "space123" },
      lofi: { ident: "lofibox", pass: "lofi123" },
    };
    const credentials = mapper[asWho];
    if (credentials) {
      await signIn(credentials.ident, credentials.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, signIn, signUp, signOut, updateUser, easyLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
