/**
 * SUPABASE CONFIGURATION EXAMPLE
 * 
 * DO NOT COMMIT YOUR REAL CREDENTIALS TO GITHUB
 * 
 * Steps to set up:
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project
 * 3. Copy your Project URL and Anon Key from Settings > API
 * 4. Create a file called 'supabase-config.js' (in .gitignore)
 * 5. Replace the values below with your actual credentials
 * 6. The admin system will use this configuration automatically
 */

const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ANON_KEY_HERE',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}
