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
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const email = `gundasaiteja634@gmail.com`; // From screenshot
  const password = 'somepassword123';

  console.log('Attempting login with', email);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('SignIn Failed:', signInError.message);
  } else {
    console.log('SignIn Success:', signInData.user?.id);
  }
}

testAuth();
