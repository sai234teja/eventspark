const { spawnSync } = require('child_process');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');

const keysToUpdate = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const line of lines) {
  if (!line || line.trim().startsWith('#')) continue;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    if (keysToUpdate.includes(key)) {
      console.log(`Updating ${key} on Vercel (Production)...`);
      try {
        // Remove existing key (ignoring errors if it doesn't exist)
        spawnSync('vercel', ['env', 'rm', key, 'production', '-y'], { shell: true });
        
        // Add new key by writing to stdin
        const child = spawnSync('vercel', ['env', 'add', key, 'production'], { 
          input: value,
          shell: true 
        });
        
        if (child.status === 0) {
          console.log(`Successfully updated ${key}.`);
        } else {
          console.error(`Failed to update ${key}:`, child.stderr.toString());
        }
      } catch (err) {
        console.error(`Failed to update ${key}:`, err.message);
      }
    }
  }
}
