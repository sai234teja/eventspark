const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const lines = envLocal.split('\n');
const env = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
// IMPORTANT: We need the SERVICE ROLE KEY to perform admin actions.
// If it's not in .env.local, this script will fail.
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyUser(email) {
  console.log(`Looking for user with email: ${email}`);
  
  // 1. Get the user
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }
  
  const targetUser = users.find(u => u.email === email);
  
  if (!targetUser) {
    console.error(`User with email ${email} not found.`);
    return;
  }
  
  console.log(`Found user: ${targetUser.id}. Email confirmed at: ${targetUser.email_confirmed_at}`);
  
  // 2. Update the user
  const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
    email_confirm: true,
    password: 'somepassword123',
    user_metadata: { ...targetUser.user_metadata, role: 'organizer' }
  });
  
  if (updateError) {
    console.error('Error updating user:', updateError.message);
  } else {
    console.log('Successfully verified user!');
    console.log('Email Confirmed At:', data.user.email_confirmed_at);
  }
}

const targetEmail = process.argv[2] || 'gundasaiteja634@gmail.com';
verifyUser(targetEmail);
