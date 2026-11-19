import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://qewpdcyozffxakttudro.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFld3BkY3lvemZmeGFrdHR1ZHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNDY5ODMsImV4cCI6MjExMDYyMjk4M30.QDKLVZ-Gb6DqzFOMxLSqJ2PRLGw5aueFKzXrGOxr7eo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-anon-key") &&
  !supabaseUrl.includes("proyek-anda")
);

// Graceful client: only creates active client if configured, otherwise returns null safely
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
