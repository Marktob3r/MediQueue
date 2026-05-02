import React, { createContext, ReactNode, useEffect, useState } from "react";
import { supabase } from "../config/supabase";

export type UserRole = "patient" | "staff" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, userData: any) => Promise<{ needsEmailConfirmation: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Helper to fetch full user profile and role from the database
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Fetch Role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (profileError || roleError) {
        console.error("Error fetching user data:", profileError || roleError);
      }

      const role: UserRole = roleData?.role || "patient";

      const authUser: AuthUser = {
        id: userId,
        email: email,
        first_name: profileData?.first_name,
        last_name: profileData?.last_name,
        phone: profileData?.phone,
        role: role,
        is_active: true,
      };

      setUser(authUser);
      setUserRole(role);
    } catch (err) {
      console.error("Failed to assemble user profile", err);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set loading to false once user is fetched
  useEffect(() => {
    if (user || userRole === null) {
      setLoading(false);
    }
  }, [user, userRole]);

  const signUp = async (email: string, password: string, userData: any): Promise<{ needsEmailConfirmation: boolean }> => {
    try {
      console.log("Starting Supabase auth signup...");
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone || null,
            role: "patient",
          },
        },
      });

      if (error) throw error;

      // If Supabase returns a session immediately, email confirmation is disabled
      // If no session, it means email confirmation is required
      const needsEmailConfirmation = !data.session;
      console.log(needsEmailConfirmation ? "Signup: email confirmation required." : "Signup: logged in directly (no email confirmation).");
      return { needsEmailConfirmation };
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      console.log("Verifying OTP...");
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;
      
      // onAuthStateChange will catch the session and fetch the profile
    } catch (error) {
      console.error("OTP Verification error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with Supabase...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // onAuthStateChange will handle fetching profile
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    userRole,
    signUp,
    verifyOtp,
    signIn,
    signOut,
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