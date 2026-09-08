import { createClient } from "@supabase/supabase-js";

// No auth/cookies in this sandbox - a single anon-key client is enough. Real
// apps should use @supabase/ssr for cookie-based sessions; this app has no
// sessions to carry.
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
    );
  }
  return createClient(url, key);
}
