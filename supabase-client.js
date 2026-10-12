// supabase-client.js
// Public client (anon key) only — do NOT put service_role key here.

const SUPABASE_URL = "https://jtiqhcezrawmhvlskmgs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gXxi-Cmyf3d1aMin3ICXWw_DkcLpFSA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make available globally the name used by existing pages
window.supabaseClient = supabaseClient;
