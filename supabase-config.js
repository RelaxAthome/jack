/**
 * Supabase Configuration - TEMPLATE
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename to: supabase-config.js
 * 2. Replace PLACEHOLDER values with your actual Supabase credentials
 * 3. Get values from Supabase Project → Settings → API → Project URL and anon/public key
 * 4. NEVER commit this file to GitHub (already in .gitignore)
 * 5. NEVER use secret/service-role keys in this file
 * 
 * Safe to use in this file (public keys only):
 * - Project URL (https://yourproject.supabase.co)
 * - Anon/Public key (safe for browser)
 * 
 * DO NOT include in this file:
 * - Service Role Key (secret key)
 * - Database passwords
 * - API secrets
 */

const SUPABASE_CONFIG = {
  // Your Supabase project URL
  // Format: https://YOUR_PROJECT_ID.supabase.co
  // Get from: Supabase Dashboard → Settings → API → Project URL
  url: 'https://PLACEHOLDER-PROJECT-ID.supabase.co',

  // Your Supabase anon/public key (safe for browser)
  // Format: Long string starting with eyJ...
  // Get from: Supabase Dashboard → Settings → API → anon public key
  // DO NOT use service role key (that's a secret key for backend only)
  anonKey: 'PLACEHOLDER-ANON-PUBLIC-KEY-HERE'
};

// This configuration is used by admin-lib.js for Supabase client initialization
// The browser will authenticate using the Supabase Auth system with this config
