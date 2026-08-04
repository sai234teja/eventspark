const { execSync } = require('child_process');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');

const keysToUpdate = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const line of lines) {
  if (!line || line.startsWith('#')) continue;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1];
    let value = match[2];
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    if (keysToUpdate.includes(key)) {
      console.log(`Updating ${key} on Vercel (Production)...`);
      try {
        // Remove existing key (ignoring errors if it doesn't exist)
        try { execSync(`vercel env rm ${key} production -y`, { stdio: 'ignore' }); } catch (e) {}
        
        // Add new key by echoing the value to vercel env add
        execSync(`echo "${value}" | vercel env add ${key} production`, { stdio: 'inherit', shell: true });
        console.log(`Successfully updated ${key}.`);
      } catch (err) {
        console.error(`Failed to update ${key}:`, err.message);
      }
    }
  }
}
