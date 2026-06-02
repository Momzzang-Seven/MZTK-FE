# Real Local BE + DB Smoke Plan

- run_id: `20260529-1419-KST`
- drafted_at: `2026-05-29 16:53 KST`
- target FE worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- target BE repo: `C:\Users\hero9\projects\MZTK-BE`
- purpose: prove selected QA flows reach local BE and persist/read through local PostgreSQL.

## Scope

This is stronger than the current mocked browser-network evidence. It must not claim on-chain success, relayer success, explorer indexing, or production-like third-party integration.

In scope:

- QA-010 reservation create reaches `POST /marketplace/classes/{classId}/reservations` and creates a DB reservation row.
- QA-011 trainer dashboard reaches `GET /marketplace/trainer/store` and does not call `/trainer/status`.
- QA-014 admin users reaches `GET /admin/users` with an admin token.
- QA-015 admin board restore reaches `POST /admin/boards/posts/{postId}/unblock`, and the DB-backed response has `moderationStatus=NORMAL` plus `publiclyVisible=true` when publication is visible.
- QA-016 admin Web3 settings reaches `GET /admin/web3/treasury-keys`.

Out of scope:

- real S3 upload
- real wallet signature
- real on-chain execution
- real Etherscan/explorer API

## Preconditions

1. PostgreSQL container is running from `MZTK-BE\docker-compose.yml`.
2. BE runs with local/dev config and talks to that Postgres instance.
3. FE runs from the integration worktree.
4. No raw token/cookie/password/storageState artifact is committed or linked in QA docs.

Expected local endpoints:

- BE: `http://localhost:8080`
- FE dev server: `http://localhost:3000`

FE should use Vite dev proxy for this smoke because `src/services/client.ts` forces `BASE=""` in dev. Set `VITE_API_BASE_URL=http://localhost:8080`, then run Vite dev server on port `3000`.

## Environment Start

From `MZTK-BE`:

```powershell
docker compose up -d
.\gradlew bootRun
```

Health checks:

```powershell
docker ps --filter name=mztk-postgres
Invoke-WebRequest -UseBasicParsing http://localhost:8080/actuator/health
Invoke-WebRequest -UseBasicParsing http://localhost:8080/v3/api-docs
```

From `MZTK_FE_QA_integration_20260529_1419`:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"
pnpm exec vite --host localhost --port 3000
```

## Test Data Setup

Use disposable QA identities. Do not write real credentials to docs.

1. Member account:
   - `POST /auth/signup`
   - body: `email`, `password`, `nickname`, `role="USER"`
   - login: `POST /auth/login` with `provider="LOCAL"`

2. Trainer account:
   - `POST /auth/signup`
   - body: `email`, `password`, `nickname`, `role="TRAINER"`
   - login: `POST /auth/login` with `provider="LOCAL"`

3. Trainer store:
   - `PUT /marketplace/trainer/store`
   - required body fields: `storeName`, `address`, `detailAddress`, `latitude`, `longitude`, `phoneNumber`

4. Marketplace class:
   - `POST /marketplace/trainer/classes`
   - required body fields: `title`, `category`, `description`, `priceAmount > 0`, `durationMinutes`, `classTimes`
   - use one future weekly slot, for example next Monday `10:00:00`, capacity `3`

5. Admin account:
   - preferred: use existing dev bootstrap admin credentials from the local bootstrap mechanism, without storing values in docs.
   - fallback: add a local-only seed helper that mirrors `AdminUserRoleManagementE2ETest#createTestAdmin`: insert `users` + `admin_accounts` with a BCrypt password hash, then login through `POST /auth/login` with `provider="LOCAL_ADMIN"`.

6. Admin board post fixture:
   - create a disposable free post as member through `POST /posts/free`.
   - as admin, call `POST /admin/boards/posts/{postId}/ban`.
   - verify it appears in `GET /admin/boards/posts?moderationStatus=BLOCKED`.

7. Web3 treasury fixture:
   - `GET /admin/web3/treasury-keys` may return an empty list if provisioning is enabled and no wallet is seeded.
   - pass condition is a real BE `2xx` response with the expected response envelope, not a non-empty list.

## Playwright Real-BE Spec

Add a separate spec instead of changing the mocked evidence spec:

- `e2e/qa-real-be-db-smoke.spec.ts`
- optional config: `playwright.qa-real-be.config.ts`

Spec responsibilities:

1. Programmatically create/login member and trainer through real BE APIs.
2. Use UI or API setup for trainer store/class.
3. Put sanitized auth state into browser localStorage, storing only runtime values in memory.
4. Navigate FE pages and let requests go to real BE through Vite proxy.
5. Capture request method/path/query/body metadata without printing auth values.
6. After each mutating flow, verify DB-backed state by a follow-up BE API read.

## Pass Criteria

QA-010 pass:

- browser sends `POST /marketplace/classes/{classId}/reservations`
- body includes `slotId`, `reservationDate`, `reservationTime`, `idempotencyKey`, `signedAmount`
- BE returns `2xx`
- follow-up `GET /marketplace/me/reservations` contains the created reservation

QA-011 pass:

- browser sends `GET /marketplace/trainer/store`
- captured requests contain no `/trainer/status`
- BE returns the seeded trainer store

QA-014 pass:

- browser sends `GET /admin/users`
- BE returns `2xx` with paginated user data

QA-015 pass:

- browser or direct admin action sends `POST /admin/boards/posts/{postId}/unblock`
- BE returns `publicationStatus`, `moderationStatus`, `publiclyVisible`
- follow-up `GET /admin/boards/posts?moderationStatus=NORMAL&publicationStatus=VISIBLE` can find the restored post, or a direct detail/read path proves equivalent DB-backed visibility

QA-016 pass:

- browser sends `GET /admin/web3/treasury-keys`
- BE returns `2xx` response envelope

## Failure Classification

- `blocked-local-server`: Docker, Postgres, BE boot, or FE dev server unavailable.
- `blocked-test-account`: login or admin bootstrap unavailable.
- `blocked-fixture-seed`: store/class/post fixture cannot be created.
- `fe-contract-fail`: request method/path/query/body does not match BE DTO/controller.
- `be-runtime-fail`: FE request is correct but BE returns validation/domain/server error.
- `db-state-fail`: BE returns success but follow-up read cannot prove persisted state.

## Commands To Record

Record all successful/failing commands in the integration log:

```powershell
docker compose up -d
.\gradlew bootRun
pnpm exec vite --host localhost --port 3000
pnpm exec playwright test -c playwright.qa-real-be.config.ts e2e/qa-real-be-db-smoke.spec.ts --project=chromium --reporter=list
```

Final doc update must include:

- exact BE/FE branch and SHA
- local server URLs
- seed method, without secrets
- pass/fail per QA ID
- final secret scan over `docs\qa` and `output\qa-api-verification\20260529-1419-KST`

## Pre-Smoke Fix Found During Planning

While concretizing this plan, BE `CreateReservationRequestDTO` was checked and found to require `idempotencyKey` and `signedAmount`. The FE integration worktree was updated so `MarketPurchase` sends both fields, and targeted Vitest/build/Playwright browser contract checks were rerun.

## Partial Execution Update - 2026-05-29 17:44 KST

Current status: `partial_real_be_db_smoke_attempt_blocked_fixture_date_window`.

Repositories used:

- FE integration worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- FE branch/SHA: `qa/api-verification-20260529-1419` / `d51b6f655a890fce103bd963f5113b643f078676`
- BE repo: `C:\Users\hero9\projects\MZTK-BE`
- BE branch/SHA: `develop` / `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`

Local services verified listening during the attempt:

- fake local JSON-RPC: `http://127.0.0.1:18545`
- BE: `http://localhost:8080`
- FE dev server: `http://localhost:3001`
- Postgres container: `mztk-postgres`

Smoke harness added in the FE integration worktree:

- `e2e/qa-real-be-db-smoke.spec.ts`
- `e2e/support/qa-fake-rpc.mjs`
- `playwright.qa-real-be.config.ts`

Evidence reached before the current blocker:

- BE health check returned `2xx`.
- Disposable member, trainer, and admin auth setup succeeded through real BE/local DB.
- DB fixtures for member/trainer wallets, trainer store, marketplace class, and admin-board post were seeded.
- Real browser navigation to `/market/purchase/{classId}` succeeded.
- Purchase page rendered the real seeded class and store data, including `Selected Class`, class title, price, and available reservation dates.
- This proves the read path `FE -> Vite proxy -> real BE -> local Postgres` for the marketplace purchase screen.

Resolved harness issues during this attempt:

- Initial PowerShell background start with redirected output hung; subsequent starts used non-redirected/foreground checks.
- Vite startup inside the sandbox hit `spawn EPERM`; rerunning outside the sandbox allowed the dev server to bind.
- First reservation helper used browser `fetch` directly against `localhost:8080` and hit Spring CORS (`Invalid CORS request`); the helper was changed to Playwright `APIRequestContext` for direct BE mutation verification.

Current blocker:

- Command: `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`
- Last result: failed at QA-010 reservation mutation.
- BE response: `409`, code `MARKETPLACE_038`, message `Reservation completion window does not fit before the marketplace escrow deadline`.
- Failure classification: `blocked-fixture-seed`.
- Cause to fix next: `nextBookableSlot()` currently seeds `today + 7 days` at `10:00:00`; this must be adjusted so `reservationDate + durationMinutes + 24h` fits before the BE escrow deadline.

Artifact note:

- Failure screenshot/video/context were produced under the FE integration worktree `test-results\qa-real-be-db-smoke-real-BE-DB-smoke-for-selected-QA-flows-chromium`.
- No raw token, cookie, password value, private key, mnemonic, or storageState artifact was intentionally written to QA docs.

## Final Execution Update - 2026-05-29 22:36 KST

Current status: `real_be_db_smoke_pass`.

Repositories used:

- FE integration worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- FE branch/SHA: `qa/api-verification-20260529-1419` / `d51b6f655a890fce103bd963f5113b643f078676`
- BE repo: `C:\Users\hero9\projects\MZTK-BE`
- BE branch/SHA: `develop` / `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`

Local services verified for the passing run:

- fake local JSON-RPC: `http://127.0.0.1:18545`
- BE: `http://localhost:8080`
- FE dev server: `http://localhost:3001`
- Postgres container: `mztk-postgres`

Passing command:

```powershell
$env:QA_BE_BASE_URL='http://localhost:8080'
$env:QA_FE_BASE_URL='http://localhost:3001'
$env:QA_POSTGRES_CONTAINER='mztk-postgres'
pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list
```

Result:

- `1 passed (10.0s)` in Chromium.
- QA-010 reservation create reached real BE and returned `2xx`; follow-up `GET /marketplace/me/reservations` contained the created reservation.
- QA-011 trainer dashboard reached `GET /marketplace/trainer/store` and no `/trainer/status` call was captured.
- QA-014 admin users reached `GET /admin/users`.
- QA-015 admin board ban/unblock reached real BE; unblock response returned `publicationStatus=VISIBLE`, `moderationStatus=NORMAL`, and `publiclyVisible=true`.
- QA-016 admin Web3 settings reached `GET /admin/web3/treasury-keys`.

Additional fixes required to get the local real-BE smoke green:

- Adjusted `nextBookableSlot()` to seed tomorrow at `10:00:00` using local-date formatting so the reservation completion window fits before the marketplace escrow deadline.
- Updated the fake JSON-RPC server to return ABI-shaped 32-byte values for `eth_call` selectors used by BE prechecks.
- Removed BE reservation adapter `@ConditionalOnBean` gates that were evaluated before the marketplace use-case beans, causing the disabled Web3 fallback adapter to be selected at runtime.
- Added local dev DB schema repair for stale `class_reservations` check constraints because `dev` runs with Flyway disabled and Hibernate `ddl-auto=update`.
- Added a local `marketplace-signer-treasury` fixture row and restarted BE with a matching QA-only local signer mapping. The actual signer material was not written to this document.
- Added local dev DB repair for stale `web3_sponsor_daily_usage.estimated_cost_wei` `NOT NULL` drift.
- Hardened `psqlScalar()` to ignore psql command tags such as `INSERT 0 1`.

Scope note:

- This is real FE -> Vite -> BE -> local Postgres evidence for the selected flows.
- It still does not claim real wallet signing, real relayer execution, on-chain settlement, S3 processing, or explorer indexing.

Secret scan:

- command: `rg -n -i "password|passwd|access_token|refresh_token|authorization|bearer|private key|mnemonic|storageState|cookie|set-cookie|wallet private|api_key|secret" MZTK_FE\docs\qa MZTK_FE\output\qa-api-verification\20260529-1419-KST`
- executed_at: `2026-05-29 22:36 KST`
- result: `pass_with_false_positives`
- false positives were field names, endpoint names, prior edge-case audit mnemonic wording, removed `VITE_ETHERSCAN_API_KEY` references, QA fixture text such as `qa-generated-password`, and redaction text.
- no credential, token, cookie, private key value, mnemonic value, or raw storageState artifact was found.

## Reverification Update - 2026-05-30 00:20 KST

Additional smoke coverage was run after the final 22:36 pass:

- `MZTK_FE` prod-smoke against dev FE proxy `http://localhost:3001`: `2 passed`, `1 skipped`.
- `MZTK_FE` prod-smoke against local `vite preview` `http://localhost:4174`: `2 passed`, `1 skipped`.

Additional local fixes:

- FE prod-smoke now clicks the logout confirmation modal before waiting for `/auth/logout`.
- FE prod-smoke now checks trainer dashboard through `/marketplace/trainer/store`; `/trainer/status` remains removed.
- BE dev CORS now allows `http://localhost:3001`, `http://localhost:4174`, and `http://127.0.0.1:4174`, which is required for browser POST logout and local production preview smoke.

Latest real BE/DB smoke recovery and rerun:

- executed_at: `2026-05-30 01:24 KST`
- Recovery applied: BE was restarted with the QA fake RPC forced through runtime Spring configuration, not inherited from `.env`. The local signer fixture was matched to the runtime dev signer without writing signer material to this document.
- Additional local DB drift repair: applied idempotent `V072__add_answer_publication_lifecycle.sql` to the Flyway-disabled dev DB because `qna_answer_update_states` was missing and a scheduler touched it during BE startup.
- Local services verified for the passing run:
  - fake local JSON-RPC: `http://127.0.0.1:18545`
  - BE: `http://localhost:8080`
  - FE dev server: `http://localhost:3002`
  - Postgres container: `mztk-postgres`
- Command:

```powershell
$env:QA_BE_BASE_URL='http://localhost:8080'
$env:QA_FE_BASE_URL='http://localhost:3002'
$env:QA_POSTGRES_CONTAINER='mztk-postgres'
pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list
```

- Result: `1 passed (11.1s)` in Chromium.
- Recovery classification: `blocked-local-env-restart` resolved.
- The same selected flows remained covered: QA-010 reservation create plus follow-up reservation list read, QA-011 trainer store request with no `/trainer/status`, QA-014 admin users request, QA-015 admin board ban/unblock restore response, and QA-016 admin Web3 treasury keys request.
- Secret scan after this latest recovery doc update at `2026-05-30 01:24 KST` returned known false positives only and found no credential, token, cookie, private key value, mnemonic value, or raw storageState artifact.

## Planned Smoke Extension - Admin Marketplace Escrow Review

Add this to the next real-BE/DB smoke pass after the FE `/admin/web3` marketplace escrow panel is available:

- QA-017 admin marketplace escrow review reaches `GET /admin/web3/marketplace/reservations/{reservationId}/refund-review`.
- QA-018 admin marketplace escrow review reaches `GET /admin/web3/marketplace/reservations/{reservationId}/settlement-review`.

Pass criteria:

- use an admin token and an existing marketplace reservation fixture ID.
- browser sends the two review requests from `/admin/web3`.
- BE returns `2xx` response envelopes with `reservationId`, `processable`, `baseValidationItems`, `reasonOptions`, `activeExecution`, and `lastAttempt` fields.
- if the response is not processable, the FE execution button stays disabled.
- if a processable reason is selected, the FE sends one of the BE enum reason codes unchanged when testing refund or settlement execution in a non-on-chain local fixture.

## Admin Marketplace Escrow Smoke - 2026-05-30 19:02 KST

Current status: `admin_marketplace_escrow_review_smoke_pass`.

Local services verified:

- BE: `http://localhost:8080`
- FE dev server: `http://localhost:3000`
- Postgres container: `mztk-postgres`

Fixture setup:

- Used an existing local marketplace reservation fixture: `reservationId=11`.
- Created a disposable LOCAL_ADMIN account directly in the local DB for the smoke run.
- Removed the disposable admin account, refresh tokens, and related local user rows after the run.
- No raw token, cookie, password value, private key, mnemonic, or storageState artifact was written to this document.

API-level result:

- `GET /admin/web3/marketplace/reservations/11/refund-review` returned `2xx`, envelope `SUCCESS`, `reservationId=11`, `processable=false`, `reasonOptions=3`, `baseValidationItems=5`.
- `GET /admin/web3/marketplace/reservations/11/settlement-review` returned `2xx`, envelope `SUCCESS`, `reservationId=11`, `processable=false`, `reasonOptions=2`, `baseValidationItems=5`.
- Both review responses were blocked with `blockingReason=INVALID_LOCAL_STATUS`, which is expected for the selected local fixture state.

FE screen result:

- Navigated to `/admin/web3`.
- Entered reservation ID `11`.
- Clicking `Load Review` sent the refund review request through the FE dev proxy.
- Switching to settlement review and clicking `Load Review` sent the settlement review request through the FE dev proxy.
- Both responses returned HTTP `200` with envelope `SUCCESS`.
- Because both responses were `processable=false`, the FE kept `Execute Refund` and `Execute Settlement` disabled.

Scope note:

- This proves the FE `/admin/web3` review UI reaches real local BE and DB through the Vite proxy.
- This does not prove actual refund/settlement execution, signer flow, relayer execution, on-chain state, or explorer indexing because the local reservation fixture was not processable.

## Admin Marketplace Escrow Visual Smoke - 2026-05-30 19:12 KST

Current status: `admin_marketplace_escrow_visual_smoke_pass`.

What was verified:

- Started local Postgres, BE, and FE dev server.
- Logged in through the real `/admin` UI using a disposable LOCAL_ADMIN account.
- Navigated to `/admin/web3`.
- Entered existing local reservation fixture ID `11`.
- Clicked `Load Review` for refund review and settlement review.
- Captured the rendered admin screen after each review.

Captured real FE -> Vite proxy -> BE requests:

- `GET /admin/web3/marketplace/reservations/11/refund-review` returned HTTP `200`, envelope `SUCCESS`, `processable=false`, `blockingReason=INVALID_LOCAL_STATUS`, `reasonOptions=3`, `baseValidationItems=5`.
- `GET /admin/web3/marketplace/reservations/11/settlement-review` returned HTTP `200`, envelope `SUCCESS`, `processable=false`, `blockingReason=INVALID_LOCAL_STATUS`, `reasonOptions=2`, `baseValidationItems=5`.

Visual result:

- The `Marketplace Reservation Escrow` panel rendered inside `/admin/web3`.
- The reservation ID input retained `11`.
- Refund mode showed `Execute Refund` disabled.
- Settlement mode showed `Execute Settlement` disabled.
- Both modes displayed `INVALID_LOCAL_STATUS` and the blocking validation list.
- Screenshots were saved locally under `output/qa-visual-smoke/admin-web3-escrow-20260530-visual/`.

Cleanup:

- Removed the disposable LOCAL_ADMIN account and related refresh/user rows after the run.
- Removed temporary smoke runner and hash utility files.
- Stopped the FE/BE processes started for the visual smoke.
