import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://dtnmtuseguakekpkbplm.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm10dXNlZ3Vha2VrcGticGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMTE3MTgsImV4cCI6MjEwOTg4NzcxOH0.eh6E1nJh1ON5MHvQ_QD1v4g-obbzNnRTkBNk1NjMIfc";

if (!supabaseUrl || !supabaseKey) {
  console.warn("TaskFlow: Supabase environment variables missing or incomplete.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);