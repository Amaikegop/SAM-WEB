const SUPABASE_URL = "https://gsoqoqgxrorptveiijga.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzb3FvcWd4cm9ycHR2ZWlpamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDI2NTgsImV4cCI6MjA3NTkxODY1OH0.0cf6px2c3fcPmH1Pf1h9WHUoFHfTCgmYvHFizXE67LE";

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
