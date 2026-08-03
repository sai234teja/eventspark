const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const files = [
  'skillService.ts',
  'educationService.ts',
  'experienceService.ts',
  'socialService.ts',
  'storageService.ts'
];

files.forEach(file => {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace top-level createClient
  content = content.replace(
    /const supabase = createClient\([\s\S]*?\);/,
    `const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);`
  );

  // Insert const supabase = getSupabase(); into every async method
  content = content.replace(/async (\w+)\((.*?)\)(.*?)\{/g, 'async $1($2)$3{\n    const supabase = getSupabase();');

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
