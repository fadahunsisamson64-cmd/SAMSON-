'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SchemaDebugPage() {
  const [data, setData] = useState<any>({
    businesses: null,
    services: null,
    bookings: null,
    users: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSchema = async () => {
      const results: any = {};
      
      const tables = ['businesses', 'services', 'bookings', 'users'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          results[table] = {
            error: error ? { message: error.message, code: error.code } : null,
            columns: data && data.length > 0 ? Object.keys(data[0]) : (data ? 'Table empty' : 'No data'),
            sample: data && data.length > 0 ? data[0] : null
          };
        } catch (err: any) {
          results[table] = { error: err.message };
        }
      }

      setData(results);
      setLoading(false);
    };
    checkSchema();
  }, []);

  if (loading) return <div className="p-8 font-mono bg-gray-900 text-green-400">Loading schema info...</div>;

  return (
    <div className="p-8 font-mono bg-gray-900 text-green-400 min-h-screen overflow-auto">
      <h1 className="text-2xl font-bold mb-4 border-b border-green-800 pb-2">Schema Debug</h1>
      
      {Object.entries(data).map(([table, info]: [string, any]) => (
        <div key={table} className="mb-8 p-4 border border-green-800 rounded bg-black/50">
          <h2 className="text-xl font-bold text-yellow-400 mb-2 uppercase">{table}</h2>
          
          {info.error && (
            <div className="text-red-400 mb-2 p-2 bg-red-900/20 rounded">
              Error: {info.error.message} (Code: {info.error.code})
            </div>
          )}
          
          <div className="mb-2">
            <span className="text-blue-400 font-bold">Columns:</span>{' '}
            {Array.isArray(info.columns) ? (
              <span className="text-white">{info.columns.join(', ')}</span>
            ) : (
              <span className="text-gray-500 italic">{info.columns}</span>
            )}
          </div>
          
          <div>
            <span className="text-blue-400 font-bold">Sample Record:</span>
            <pre className="mt-2 text-sm bg-gray-800 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(info.sample, null, 2)}
            </pre>
          </div>
        </div>
      ))}

      <div className="mt-8 border-t border-green-800 pt-4">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">PostgREST Join Test (Bookings)</h2>
        <ButtonTest />
      </div>
    </div>
  );
}

function ButtonTest() {
  const [testResult, setTestResult] = useState<any>(null);

  const runTest = async () => {
    setTestResult('Running join test...');
    const { data, error } = await supabase
      .from('bookings')
      .select('*, business:business_id(*), service:service_id(*)')
      .limit(1);
    
    setTestResult({ data, error });
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={runTest}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Test Join Query
      </button>
      {testResult && (
        <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto max-h-80">
          {JSON.stringify(testResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
