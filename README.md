# Zadoc — merged app

This is the 7 Zadoc pieces assembled into one Next.js app, with every mock
call listed in the merge spec replaced by a real integration. See
`MERGE_NOTES.md` for exactly what was wired, what was assembled as new glue,
and what still needs your attention before this goes live.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a Supabase project.
   - Run `supabase/zadoc_schema.sql`, then `supabase/zadoc_storage_policies.sql`
     in the SQL editor (in that order — the policies file assumes the schema's
     buckets already exist).

3. **Environment variables**

   Copy the placeholders already in `.env.local` and fill in real values:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` — any long random string (signs the login session cookie)
   - `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`)
   - `FAPSHI_API_USER`, `FAPSHI_API_KEY`, `FAPSHI_WEBHOOK_SECRET`, `FAPSHI_BASE_URL`
     (leave `FAPSHI_BASE_URL` on the sandbox host until you're ready to go live)

4. **Run it**

   ```bash
   npm run dev
   ```

   Then check `/`, `/dashboard` (after signing up), and `/admin` (after
   manually setting a user's `role` to `'admin'` in Supabase — there's no
   self-serve admin signup).

## Build

```bash
npm run build
```

I was not able to run this myself — see `MERGE_NOTES.md` for why — so please
run it and send me any errors if it doesn't come up clean; most likely
candidates are listed there too.
