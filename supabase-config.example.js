/**
 * Supabase Configuration Example
 * 
 * IMPORTANT: This file contains ONLY PLACEHOLDERS.
 * Never commit real API keys, service-role keys, or secrets to GitHub.
 * 
 * Instructions:
 * 1. Create a new file called 'supabase-config.js' in the root directory (DO NOT commit this file)
 * 2. Replace the placeholder values below with your actual Supabase credentials
 * 3. Add 'supabase-config.js' to .gitignore
 * 4. The admin system will automatically import and use supabase-config.js at runtime
 */

// DO NOT expose these values in public source code
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY_HERE';

// Example: how to use in your HTML/JS files
// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
