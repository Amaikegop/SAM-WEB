const SUPABASE_URL = "https://sdkehxchuqkizynrfiau.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2VoeGNodXFraXp5bnJmaWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTY2MzgsImV4cCI6MjA4Mzg5MjYzOH0.pKPGYaBPusXCVVu_-N7pUZev0js6KNtayFOO2D-xSqg";

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
