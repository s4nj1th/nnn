const { createBrowserClient } = require('@supabase/ssr');

async function test() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdmrwkhbxrgvwfdpwtpe.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbXJ3a2hieHJndndmZHB3dHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjQ0NjgsImV4cCI6MjA5NjE0MDQ2OH0.lb1A7j3Z02pgELkfC28758PLVtmZpx2UX05jBFXtEtA',
    {
      cookies: {
        get(name) { return undefined; },
        set(name, value) {},
        remove(name) {}
      }
    }
  );

  console.log("Fetching user without cookies...");
  const start = Date.now();
  const { data, error } = await client.auth.getUser();
  console.log("Time taken:", Date.now() - start, "ms");
  console.log("Data:", data, "Error:", error?.message);
}

test();
