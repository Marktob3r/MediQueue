import React, { createContext, ReactNode, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

export type UserRole = "patient" | "staff" | "admin";

export interface AuthUser extends User {
  role?: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user as AuthUser);

          // Fetch user role from database
          const userRole = await fetchUserRole(currentSession.user.id);
          setUserRole(userRole);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user as AuthUser | null);

      if (newSession?.user) {
        const userRole = await fetchUserRole(newSession.user.id);
        setUserRole(userRole);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data?.role as UserRole;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: any
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: data.user.id,
            email: data.user.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            created_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        // Create default role (patient)
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "patient",
          });

        if (roleError) throw roleError;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.user as AuthUser);

        // Fetch user role
        const userRole = await fetchUserRole(data.user.id);
        setUserRole(userRole);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateUserRole = (role: UserRole) => {
    setUserRole(role);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    userRole,
    signUp,
    signIn,
    signOut,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
