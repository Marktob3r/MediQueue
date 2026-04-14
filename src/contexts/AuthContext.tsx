import React, { createContext, ReactNode, useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import bcrypt from "bcryptjs";

export type UserRole = "patient" | "staff" | "admin";

export interface AuthUser {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('patient_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserRole(parsedUser.role);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("Starting signup...");
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("patients")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Insert new patient
      const { data, error } = await supabase
        .from("patients")
        .insert({
          email: email,
          password_hash: password_hash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone || null,
          role: "patient",
          created_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw new Error(error.message);
      }

      if (data) {
        // Remove password_hash from user object
        const { password_hash: _, ...patientUser } = data;
        setUser(patientUser as AuthUser);
        setUserRole("patient");
        localStorage.setItem('patient_user', JSON.stringify(patientUser));
        console.log("Signup successful");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in...");
      
      // Get user by email
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Fetch error:", error);
        throw new Error("Invalid email or password");
      }
      
      if (!data) {
        throw new Error("Invalid email or password");
      }
      
      if (!data.is_active) {
        throw new Error("Account is deactivated");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Update last login
      await supabase
        .from("patients")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.id);

      // Remove password_hash from user object
      const { password_hash: _, ...patientUser } = data;
      setUser(patientUser as AuthUser);
      setUserRole(patientUser.role);
      localStorage.setItem('patient_user', JSON.stringify(patientUser));
      console.log("Sign in successful");
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('patient_user');
    console.log("Sign out successful");
  };

  const updateUserRole = (role: UserRole) => {
    setUserRole(role);
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('patient_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
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