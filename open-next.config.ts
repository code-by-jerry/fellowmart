import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default in-memory incremental cache (no R2 required on free tier).
// For production ISR, add an R2 bucket binding in wrangler.jsonc and switch to:
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
// export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });

export default defineCloudflareConfig({});
