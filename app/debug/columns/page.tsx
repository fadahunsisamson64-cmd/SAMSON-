'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ColumnFinderPage() {
  const [columns, setColumns] = useState<any>(null);

  useEffect(() => {
    const findColumns = async () => {
      // Fetch one record from businesses
      const { data, error } = await supabase.from('businesses').select('*').limit(1);
      if (error) {
        setColumns({ error });
      } else if (data && data.length > 0) {
        setColumns({ table: 'businesses', columns: Object.keys(data[0]), data: data[0] });
      } else {
        setColumns({ table: 'businesses', message: 'Table is empty' });
      }
    };
    findColumns();
  }, []);

  return (
    <div className="p-8 font-mono bg-black text-white whitespace-pre">
      <h1>Column Finder</h1>
      {JSON.stringify(columns, null, 2)}
    </div>
  );
}
