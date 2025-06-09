import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyqbypcxwcvkfspzqvpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cWJ5cGN4d2N2a2ZzcHpxdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTgyNDYsImV4cCI6MjA2NDkzNDI0Nn0.Zf1uRkD3oDzvKCplhKe883Q00C5IrFOFSytJA1t9SFo';

if (!supabaseKey) {
  console.log(process);
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_KEY');
}

// At this point TypeScript knows supabaseKey is not undefined
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null; 