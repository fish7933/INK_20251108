import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kxxdrwwqdjkynbuyzrpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGRyd3dxZGpreW5idXl6cnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAwNjYsImV4cCI6MjA3Nzc5NjA2Nn0._KflDSzupmXetTBSCPgQGoC1QUOQDU2gEL_D8XlM5hA'
);

console.log('🔍 Testing Supabase connection...');

// Test 1: Check positions table
const { data: positions, error: posError } = await supabase
  .from('app_7c39e793e3_positions')
  .select('*')
  .limit(5);

console.log('\n📊 Positions table:');
console.log('Error:', posError);
console.log('Data count:', positions?.length || 0);
if (positions && positions.length > 0) {
  console.log('First position:', JSON.stringify(positions[0], null, 2));
}

// Test 2: Check vessels table
const { data: vessels, error: vesError } = await supabase
  .from('app_7c39e793e3_vessels')
  .select('*')
  .limit(5);

console.log('\n🚢 Vessels table:');
console.log('Error:', vesError);
console.log('Data count:', vessels?.length || 0);
if (vessels && vessels.length > 0) {
  console.log('First vessel:', JSON.stringify(vessels[0], null, 2));
}

// Test 3: Check joined query
const { data: joined, error: joinError } = await supabase
  .from('app_7c39e793e3_positions')
  .select('*, vessel:app_7c39e793e3_vessels(*)')
  .limit(3);

console.log('\n🔗 Joined query:');
console.log('Error:', joinError);
console.log('Data count:', joined?.length || 0);
if (joined && joined.length > 0) {
  console.log('First joined record:', JSON.stringify(joined[0], null, 2));
}

// Test 4: Check active positions with active vessels
const { data: active, error: activeError } = await supabase
  .from('app_7c39e793e3_positions')
  .select('*, vessel:app_7c39e793e3_vessels(*)')
  .eq('is_active', true);

console.log('\n✅ Active positions:');
console.log('Error:', activeError);
console.log('Data count:', active?.length || 0);

if (active && active.length > 0) {
  const activeWithVessels = active.filter(p => p.vessel?.is_active);
  console.log('Active positions with active vessels:', activeWithVessels.length);
  if (activeWithVessels.length > 0) {
    console.log('Sample:', JSON.stringify(activeWithVessels[0], null, 2));
  }
}