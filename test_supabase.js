const { createBrowserClient } = require("@supabase/ssr");

try {
    const client = createBrowserClient(undefined, undefined);
    console.log("Success?");
} catch (e) {
    console.error("Error:", e);
}
