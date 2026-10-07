import { supabase } from './lib/supabase';

async function debugSchema() {
  const tables = ['users', 'businesses', 'services', 'bookings', 'saved_businesses'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Error fetching table ${table}: `, error.message);
    } else if (data && data.length > 0) {
      console.log(`Table ${table} columns: `, Object.keys(data[0]).join(', '));
    } else {
      console.log(`Table ${table} is empty or has no data to inspect columns.`);
    }
  }
}

debugSchema();
