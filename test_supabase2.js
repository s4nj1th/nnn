const { createBrowserClient } = require('@supabase/ssr');

try {
  const client = createBrowserClient('your_supabase_project_url', 'your_supabase_anon_key');
  console.log("Success?");
} catch (e) {
  console.error("Error:", e);
}
