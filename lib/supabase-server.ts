import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createClientSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          'Authorization': `Bearer ${cookies().get("__session")?.value}`
        }
      }
    }
  );
}
