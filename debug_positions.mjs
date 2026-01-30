import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxxdrwwqdjkynbuyzrpz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGRyd3dxZGpreW5idXl6cnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAwNjYsImV4cCI6MjA3Nzc5NjA2Nn0._KflDSzupmXetTBSCPgQGoC1QUOQDU2gEL_D8XlM5hA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('Testing position fetch...');
  
  const { data, error } = await supabase
    .from('app_7c39e793e3_positions')
    .select('*, vessel:app_7c39e793e3_vessels(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Positions found:', data.length);
    if (data.length > 0) {
      console.log('Sample position:', JSON.stringify(data[0], null, 2));
      console.log('Active positions with active vessels:', data.filter(p => p.is_active && p.vessel?.is_active).length);
    }
  }
}

testFetch();
