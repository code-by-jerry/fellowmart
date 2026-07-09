## What's Protected

### Environment & Credentials
| File | Why Hidden |
|------|-----------|
| `.env.local` | Supabase URL, anon key, service role key |
| `.env*.local` | Any local variant of env files |
| `.env.production` | Production secrets |
| `.env.staging` | Staging secrets |

### Supabase CLI
| File | Why Hidden |
|------|-----------|
| `supabase/.temp/` | Temp CLI files, local DB state |
| `supabase/seed.sql` | May contain plain-text admin credentials |

### Safe to Commit ✅
| File | Reason |
|------|--------|
| `.env.local.example` | Template with no real values |
| `supabase/migrations/*.sql` | Schema only, no credentials |
| `supabase/config.toml` | Project config, no secrets |
