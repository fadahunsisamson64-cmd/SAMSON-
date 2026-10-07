import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const tables = ['businesses', 'services', 'bookings'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Error fetching ${table}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`${table} columns:`, Object.keys(data[0]));
    } else {
      console.log(`${table} is empty`);
    }
  }
}

inspect();
