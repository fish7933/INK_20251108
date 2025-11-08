import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Request received:`, req.method, req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error(`[${requestId}] Invalid JSON body:`, e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { username, password, role = 'viewer' } = body;

    if (!username || !password) {
      console.error(`[${requestId}] Missing required fields`);
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Creating admin user:`, username, 'with role:', role);

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('app_7c39e793e3_admin_users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      console.error(`[${requestId}] Username already exists:`, username);
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash password using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Default permissions based on role
    let defaultPermissions;
    if (role === 'super_admin') {
      defaultPermissions = {
        applications: { view: true, edit: true, delete: true },
        jobs: { view: true, edit: true, delete: true },
        settings: { view: true, edit: true },
        admins: { view: true, edit: true }
      };
    } else if (role === 'admin') {
      defaultPermissions = {
        applications: { view: true, edit: true, delete: true },
        jobs: { view: true, edit: true, delete: true },
        settings: { view: true, edit: true },
        admins: { view: true, edit: false }
      };
    } else {
      defaultPermissions = {
        applications: { view: true, edit: false, delete: false },
        jobs: { view: true, edit: false, delete: false },
        settings: { view: false, edit: false },
        admins: { view: false, edit: false }
      };
    }

    console.log(`[${requestId}] Inserting admin user with permissions:`, defaultPermissions);

    // Insert new admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('app_7c39e793e3_admin_users')
      .insert([{
        username,
        password_hash: passwordHash,
        role,
        permissions: defaultPermissions,
        is_approved: false
      }])
      .select('id, username, role, permissions, is_approved, created_at, updated_at')
      .single();

    if (insertError) {
      console.error(`[${requestId}] Database insert error:`, insertError);
      return new Response(
        JSON.stringify({ error: insertError.message || 'Failed to create admin user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Admin user created successfully:`, newAdmin.id);

    return new Response(
      JSON.stringify(newAdmin),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});