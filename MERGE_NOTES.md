# Merge notes

## Build status — please run this yourself

My sandbox has no network access (confirmed: `npm install` returns
`403 Forbidden` from the npm registry here), so **I could not run
`npm install` or `npm run build` for this project**. Everything below is a
careful manual assembly and static review, but it has not been compiled.

Please run:

```bash
npm install
npm run build
```

and send me any errors. Given the scope of this merge, the most likely
categories of build error, roughly in order of likelihood, are:

- A prop name or type mismatch I introduced while wiring two pieces together
  (search for the file in the error and check it against the component it
  calls into).
- A missing import I didn't catch in my manual `@/`-import sweep.
- Supabase generated types not matching the hand-written `select()` strings
  in `lib/*/db.ts` — I wrote these against `zadoc_schema.sql` by hand rather
  than generated types, since generating types requires a live Supabase
  project.

None of these should be structural — the architecture is sound — just
possible typos/mismatches from doing this without a compiler in the loop.

## What replaced what (per the merge spec's mock → real list)

- **Piece 1's "Get Started" placeholder sheet** → Piece 2's real `AuthSheet`,
  wired in `app/page.tsx`. Piece 1's stub `components/landing/AuthSheet.tsx`
  was deleted.
- **Piece 2's mock session/user store** → `lib/auth/session.ts` (signed
  httpOnly cookie, HMAC-SHA256 via `lib/auth/token.ts`, no extra JWT
  dependency) + `lib/auth/users-db.ts` (real `users` table, bcrypt-hashed
  PINs, hash never leaves the server). `lib/mock/session.ts` and
  `lib/mock/users.ts` were deleted.
- **Piece 2's post-auth redirect / Piece 3's mock session** → both now use
  the same session mechanism above; login/signup land on the real
  `/dashboard`.
- **Piece 3's "scan modal would open here" stub** → `app/dashboard/page.tsx`
  now renders Piece 4's real `<ScanFlow>` directly (for the empty state, add
  a profile, and resuming a partially-created profile). The stub
  `ScanHandoffModal.tsx` was deleted.
- **Piece 4's mock `/api/analyze` classifier** → `lib/anthropic/vision.ts`,
  a real Claude Vision call using tool-use for structured output, validated
  against the `skin_type` enum, retried once on invalid output, and falling
  back to a clean "no face detected" result rather than ever trusting an
  unvalidated response.
- **Piece 4's `onComplete(analysis)` placeholder screen** → replaced with a
  new `components/results/ResultsView.tsx` (see "New glue" below), rendered
  directly from `ScanFlow.tsx`'s `'complete'` step. `CompleteStep.tsx` was
  deleted. The real `/api/analyze` route also now writes the `SkinAnalysis`
  row and updates the `ZadocProfile` row in Supabase, including uploading
  the photo to the private bucket.
- **Piece 5's mock `ProductRecommendation[]` and "Unlock modal" stub** →
  `lib/recommendations.ts` (real Supabase queries, same locked/unlocked
  shape) and Piece 6's real `UnlockModal`, composed in `ResultsView.tsx`.
  The stub `components/results/UnlockModal.tsx` was deleted.
- **Piece 5's `app/api/products/route.ts`** → same field-withholding logic,
  now backed by `lib/recommendations.ts` querying Supabase instead of a mock
  store.
- **Piece 6's `lib/mock/fapshi.ts` and mock hosted-checkout page** →
  `lib/payments/fapshi.ts` (real `initiate-pay` call + real webhook signature
  verification) and a real redirect to Fapshi's hosted checkout URL. The
  mock checkout page (`app/pay/mock/[paymentId]/`) and its trigger route
  (`app/api/payments/simulate/`) were deleted.
- **Piece 6's mock webhook signature check** → `verifyFapshiWebhookSignature`
  in `lib/payments/fapshi.ts`. The idempotency check is preserved exactly
  (a payment already `'successful'` short-circuits). Note: **the actual
  unlock + `creator_earnings` write is not re-implemented in application
  code at all** — `zadoc_schema.sql` already has a
  `trg_payments_successful` trigger that does this the moment a payment row
  flips to `status = 'successful'`, so the webhook and admin routes just
  update that one column and let the database do the rest, per the merge
  spec's "mirroring logic as-is" instruction.
- **Piece 3's Creator Dashboard / Admin Panel entries** → wired to Piece 7's
  real `CreatorDashboardSheet` and real `/admin`, both gated server-side by
  `user.role` read fresh from Supabase on every request (the client-side
  gating in `AccountSheet` is UX only, exactly per the spec's "frontend
  check is UX only" instruction).
- **Piece 7's `lib/admin/authorize.ts` and `lib/mock/admin.ts`** →
  `lib/admin/authorize.ts` (real session + role check) and `lib/admin/db.ts`
  (real Supabase queries for overview metrics, users, products,
  recommendations, and creators).

## New glue (not owned by any single piece)

A few things needed to exist for the "full loop end to end" requirement that
no piece's owned-folder list actually covered:

- **`components/results/ResultsView.tsx`** — composes Piece 5's `ProfileCard`
  / `OilSection` / `FloatingCTA` / `ProductSheet` with Piece 6's
  `UnlockModal` / `PaymentStatusPanel` / `DownloadReportButton`, backed by a
  new `GET /api/profiles/[id]` route. This is rendered inline in the
  dashboard (`ProfileBody.tsx`) and inside the scan flow's `'complete'` step.
- **`app/profile/[id]/page.tsx`** — a stable URL for a profile's results,
  used as the `redirectUrl` Fapshi sends the browser back to after checkout.
- **`app/api/profiles/[id]/route.ts`** and **`app/api/auth/me`** /
  **`app/api/auth/logout`** — small routes needed for the client-side
  session check and single-profile fetch; no piece's owned `app/api/*`
  scope happened to include these.

## Known compromises worth your attention

- **Fapshi field/header names are unverified.** I have no network access, so
  I could not check Fapshi's current API docs. `lib/payments/fapshi.ts`
  implements the initiate-pay call and webhook verification using their
  commonly documented conventions (`apiuser`/`apikey` headers, a `link` +
  `transId` response, HMAC-SHA256 webhook signing) with comments flagging
  exactly what to verify. Please double check field names against Fapshi's
  live docs before going to production — sandbox testing will surface any
  mismatch immediately.
- **Admin product form's `skin_type_compatibility` / `avoid_reason` fields
  aren't real columns.** Piece 7's admin UI invented these on its
  demo-only `AdminProduct` type; `zadoc_schema.sql`'s `products` table
  doesn't have them (that relationship is modeled via
  `product_recommendations` instead). `lib/admin/db.ts` derives
  `skin_type_compatibility` for display from a product's actual
  recommendation rows and doesn't persist `avoid_reason` anywhere. Real
  fields (name, description, category, benefits, usage, warnings, active,
  images) persist normally.
- **Claude model name**: `ANTHROPIC_MODEL` defaults to
  `claude-sonnet-4-5-20250929` in `lib/anthropic/vision.ts`. Override via
  the env var if your account uses a different model id.
- **Creator "paid_users" count** in `lib/admin/db.ts` is an approximation
  (one `creator_earnings` row per paying referral) rather than a distinct
  join back through `referrals` — fine for the admin overview, worth
  tightening if it becomes a billing-facing number.


- **`lib/scan/mockQualityCheck.ts` (Piece 4) was left as-is.** Its own code
  comment invites replacing it with real blur/lighting analysis, but it
  wasn't in the merge spec's explicit mock → real list, so per the "only
  touch what's listed" instruction I left it untouched. It currently
  includes a small random failure chance "so the retake path is genuinely
  exercisable in demo" — worth removing that random chance before shipping,
  even if you keep the lightweight brightness heuristic.

## Everything else

Every other component's internals were left untouched, per the "assembly
job, not a refactor" instruction — only `lib/*`, API routes, the specific
files called out above, and the small `ScanFlow`/`AnalyzingStep` prop
threading needed to pass a real `profileId` through the scan flow were
touched.
