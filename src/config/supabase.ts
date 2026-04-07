import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://efuevizodafndgiosxbr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdWV2aXpvZGFmbmRnaW9zeGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzUxMzIsImV4cCI6MjA5MTExMTEzMn0.whS53DrhQZysfDAn-o1lpTfXGXYYTQRhbYMWSCh1GG4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for use throughout the app
export type Database = any;
