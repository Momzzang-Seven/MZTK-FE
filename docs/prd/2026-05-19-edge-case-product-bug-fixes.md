# PRD: Edge Case Product Bug Fixes

Date: 2026-05-19
Status: Implemented in frontend; fixture drift follow-up verified

## Problem Statement

The May 18 edge-case QA found multiple places where unusual but realistic user
input could bypass frontend validation or create inconsistent app state.

From the user's perspective, this meant the app could accept malformed trainer
profile data, rewrite trainer class numbers incorrectly, allow unsafe community
text, proceed with invalid token transfers, upload a non-image workout proof,
accept weak wallet PINs, submit a placeholder location, or enter routes that
should be blocked by auth/role checks.

The highest-risk issue was that some flows trusted local UI/storage state too
loosely. For example, a leftover token string could make a protected route look
accessible, and a normal user could type a trainer route directly.

## Solution

The frontend now blocks invalid input earlier and uses shared validation rules
for the repeated edge-case patterns:

- strict positive integer parsing for trainer class numbers
- Korean phone validation for trainer store contact numbers
- safe URL normalization that only allows HTTP and HTTPS
- shared text length limits and unsafe markup checks
- sanitized rich community content before payload/rendering
- strict token amount and recipient address validation
- client-side image file validation before workout upload
- weak PIN rejection and duplicate finalize protection in wallet flows
- stricter protected route checks and trainer-only route authorization
- location submit guard that requires an actual selected location

Playwright fixture drift was initially kept out of the product-bug fix scope,
then handled as a follow-up in the same QA stabilization pass.

## User Stories

1. As a trainer, I want malformed phone numbers to be rejected, so that my store profile does not save unusable contact data.
2. As a trainer, I want unsafe social or homepage URLs to be rejected, so that my profile cannot store broken or dangerous links.
3. As a trainer, I want class price, capacity, and duration to reject invalid numbers, so that the saved class data matches what I intended.
4. As a trainer, I want negative and decimal inputs not to be silently rewritten, so that I can fix the input instead of saving corrupted values.
5. As a trainer, I want script-like text blocked in class fields, so that unsafe content is not persisted.
6. As a community user, I want long tags to be capped, so that posts remain readable and stable.
7. As a community user, I want very long comments and answers to be blocked, so that the UI and backend receive practical payload sizes.
8. As a community user, I want script-like comment or post text to be blocked or sanitized, so that community pages render safely.
9. As a question author, I want reward input to accept only valid whole token values, so that decimal precision mistakes are not silently changed.
10. As a token sender, I want exponent notation like `1e2` to be rejected, so that I do not send an unintended amount.
11. As a token sender, I want token amounts with too many decimals rejected before PIN entry, so that the transfer cannot fail later from precision errors.
12. As a token sender, I want the zero address rejected, so that tokens are not sent to an unusable recipient.
13. As a workout user, I want only real image files accepted for proof upload, so that a text file cannot enter the image verification flow.
14. As a wallet user, I want repeated or sequential PINs rejected, so that my wallet encryption is not protected by an obviously weak PIN.
15. As a wallet user, I want rapid PIN confirmation clicks to be deduplicated, so that registration does not trigger duplicate backend calls or timeout-like behavior.
16. As a logged-out user, I should not access protected screens just because a stale token string exists in browser storage, so that auth state stays reliable.
17. As a normal user, I should be redirected away from trainer-only screens, so that trainer tools are role-restricted.
18. As a user registering a location, I want submit disabled until an actual location is selected, so that placeholder map coordinates are not saved.
19. As a QA engineer, I want these edge cases covered by focused tests, so that future changes do not reintroduce the same bugs.
20. As a maintainer, I want fixture drift handled in a focused follow-up, so that product regressions and test-data problems remain easy to review.

## Implementation Decisions

- A shared edge-case validation module was introduced for reusable rules around unsafe markup, rich HTML sanitization, tags, positive integers, phone numbers, URLs, token amounts, wallet addresses, and weak PINs.
- Protected routes now require a complete authenticated session, not just one token-like value.
- Trainer-only routes now check role authorization and redirect non-trainer users to the normal user area.
- Trainer store submission validates phone numbers and URL fields before sending the request.
- Trainer class create/edit flows validate numeric fields as positive whole numbers before request construction.
- Community post payload creation sanitizes rich content and tags before submit.
- Community comment creation and updates trim input, apply length limits, and reject unsafe markup.
- Community rich content rendering sanitizes server-provided HTML before displaying it.
- Token transfer validation now mirrors token decimal constraints before allowing PIN entry.
- Workout verification rejects invalid file type, extension, and size before preview or presigned upload.
- Wallet create/register/restore flows reject weak PINs and prevent duplicate finalize operations while one registration/encryption request is already in flight.
- Location registration distinguishes fallback map center from a user-selected location and blocks placeholder submission.
- No backend schema or API contract changes were required for this frontend product fix pass.

## Testing Decisions

- Tests focus on observable behavior: whether invalid inputs are blocked, whether valid submissions still proceed, and whether routing redirects correctly.
- Shared validation rules are covered by unit tests because they are a deep module with a small stable interface and broad product impact.
- Protected route behavior is covered with component tests for token-only state, normal-user trainer access, and trainer access.
- Wallet registration tests cover backend success/failure, weak PIN rejection, and rapid PIN confirmation deduplication.
- Token amount input tests cover decimal text input behavior and exponent notation blocking.
- Location registration tests cover geolocation success and geolocation denial with placeholder blocking.
- Workout verification tests cover non-image rejection before presigned upload.
- Existing marketplace/trainer, location, record auth, and community-focused tests were rerun to check nearby behavior.

## Out of Scope

- Production smoke testing was not completed in this pass because the required `E2E_SMOKE_*` credentials were not configured in the shell environment or `.env`.
- Backend validation hardening was not implemented in this pass.
- Existing Vite bundle-size and third-party `lottie-web` eval warnings were not addressed.
- Full UX copy cleanup for older mojibake strings was not part of this change.
- GitHub issue publication is pending because the issue tracker label/setup context was not available in this session.

## Further Notes

- The consolidated QA summary was updated with a 2026-05-19 product fix status table.
- The ignored `output/` QA summary is useful for local traceability but will not be included in a normal git commit unless force-added.
- Fixture drift was handled as a separate reviewable change inside this follow-up: login wallet fixture, admin user mocks, level copy assertion, sanctioned OAuth assertion, trainer login redirect, and logout confirmation behavior.

## 2026-05-19 Follow-up: Playwright Fixture Drift and E2E Verification

### Problem Statement

After the frontend edge-case fixes, the mock-based Playwright suite still had
test drift that could obscure real product status:

- Auth e2e needed to reflect trainer login redirect behavior and the logout confirmation modal.
- Local login and pre-authenticated e2e fixtures needed wallet storage that matches the app's restore-wallet guard.
- Admin e2e expected a seeded user but did not mock the actual `/admin/users` API contract.
- Level e2e asserted the old `50 / 100 XP` copy even though the current public UI displays remaining EXP and progress percentage.

From the maintainer's perspective, this made it hard to tell whether a failure
was a product regression, backend contract issue, or stale test fixture.

### Solution

The e2e fixtures and assertions were aligned with the current frontend behavior:

- Local login fixtures now set both `wallet_address` and `encrypted_wallet`.
- Pre-authenticated e2e sessions now inject the encrypted wallet value through the init script payload.
- Auth e2e now verifies member login, trainer login, logout confirmation, and sanctioned OAuth callback behavior against current UI.
- Admin e2e now mocks `/admin/users` and `/admin/users/{id}/status` using the admin API response shape, then verifies the visible restrict/unrestrict control transition.
- Level e2e now verifies the public UI copy for remaining EXP and progress percentage instead of the removed `current / max XP` text.

### User Stories

1. As a QA engineer, I want auth e2e to model wallet-backed login state, so that successful login does not incorrectly route to wallet restoration.
2. As a trainer, I want trainer local login to land on the trainer dashboard, so that role-specific routing is covered by e2e.
3. As a user, I want logout confirmation to be tested through the real modal flow, so that account exit behavior is covered end to end.
4. As a sanctioned user, I want OAuth callback failure to show the account restriction heading and appeal link, so that blocked-account messaging stays visible.
5. As an admin, I want user restriction and unrestriction to be tested against the admin API response shape, so that table state transitions remain reliable.
6. As a user, I want the level card to show my current level, remaining EXP, and progress percentage, so that level progress remains understandable.
7. As a maintainer, I want mock-based e2e drift separated from prod smoke status, so that local GREEN does not get confused with production readiness.

### Implementation Decisions

- The admin e2e uses route-level API mocks rather than relying on unknown server seed data.
- The admin mock preserves the backend page response shape and updates in-memory status after the PATCH request.
- The wallet fixture uses a stable fake encrypted wallet string because these tests only need the presence of wallet storage, not cryptographic wallet behavior.
- Level assertions target visible product copy: remaining EXP and progress percentage.
- The prod smoke suite remains separate because it requires real API base URL and local smoke account credentials.

### Testing Decisions

- `pnpm run build` was run before e2e verification and passed.
- `pnpm test:e2e -- e2e/auth.spec.ts --reporter=list` passed: 8 tests.
- `pnpm test:e2e -- e2e/admin.spec.ts e2e/levelup.spec.ts --reporter=list` passed: 8 tests.
- `pnpm test:e2e -- --reporter=list` passed: 24 tests across `chromium` and `Mobile Chrome`.
- The full non-smoke e2e run covered admin, auth, core-flow, levelup, and verify specs.
- `prod-smoke` was not run because `E2E_SMOKE_API_BASE_URL`, `E2E_SMOKE_EMAIL`, and `E2E_SMOKE_PASSWORD` were missing. `E2E_SMOKE_BASE_URL` was also missing, so remote deployed FE validation was not configured.

### Out of Scope

- Remote production frontend smoke validation.
- Real production API login validation.
- Commit and push.

### Further Notes

- The current verified status is: mock-based related e2e GREEN.
- The unverified boundary is: prod smoke requires configured smoke credentials and, for deployed FE validation, `E2E_SMOKE_BASE_URL`.
- The relevant prod command is `pnpm test:e2e:smoke` after the smoke environment variables are configured.

## 2026-05-19 Follow-up: Test Scope Clarification

### Problem Statement

The completed GREEN result was for mock-based frontend e2e, not for local
backend/database integration or production smoke. This distinction matters
because each test layer answers a different question:

- Mock e2e answers whether the frontend UI, routing, modal flow, and state
  transitions still work against controlled API responses.
- Local backend/database integration answers whether the frontend and backend
  still agree on real API contracts, auth, seed data, and persistence state.
- Production smoke answers whether the deployed frontend/API environment is
  alive and can satisfy the core user flow with a real test account.

From the user's perspective, "tests are green" should not be ambiguous. The
team needs to know exactly whether that means frontend regression tests,
local full-stack tests, or production environment checks.

### Current Status

- Mock-based frontend e2e is GREEN.
- Build is GREEN.
- Auth/admin/level fixture drift has been fixed.
- Production smoke code exists.
- Local full-stack member smoke is GREEN as of 2026-05-20.
- Production smoke has not been executed because the required smoke account
  environment variables are not configured.
- Local trainer full-stack smoke was skipped because trainer smoke credentials
  were not configured.

### Why Mock E2E Was Used First

Mock e2e was the right first layer for the fixture drift task because the
failures were stale frontend fixtures and selectors:

- auth login needed wallet storage to avoid unintended restore-wallet routing
- logout needed to follow the current confirmation modal
- admin needed a stable `/admin/users` response instead of unknown seed data
- level needed to assert current visible copy rather than removed UI text

Using controlled Playwright route mocks isolated those frontend failures from
backend availability, database seed state, and production account setup.

### What Is Still Needed For Stronger Confidence

1. Prepare a real test account.
   - Minimum: one normal member account that can log in on the target backend.
   - Optional: one trainer account for trainer-dashboard smoke coverage.
   - The account should be safe to use repeatedly in smoke tests.

2. Fix prod-smoke logout drift.
   - The current UI requires a logout button click and then a confirmation modal click.
   - The prod-smoke logout flow should follow the same visible user flow.

3. Run production smoke when credentials are configured.
   - Required: `E2E_SMOKE_API_BASE_URL`, `E2E_SMOKE_EMAIL`, `E2E_SMOKE_PASSWORD`.
   - Optional for deployed frontend validation: `E2E_SMOKE_BASE_URL`.
   - Command: `pnpm test:e2e:smoke`.

4. Optionally run local backend/database integration.
   - Start the local DB and backend.
   - Point the frontend to the local backend API.
   - Use seeded or manually created test accounts.
   - Run targeted Playwright flows without route mocks where contract coverage matters.

## 2026-05-20 Follow-up: Local Full-Stack Integration Verification

### Problem Statement

Instead of using production smoke credentials first, the next confidence layer
was to verify the frontend against the local backend and local database. This
checks real API contracts and auth/cookie behavior without depending on a
remote production account.

### Solution

The local stack was started and the smoke suite was adapted for local
full-stack execution:

- Existing `mztk-postgres` Docker container was started on port 5432.
- Spring Boot backend was started with the `dev` profile on port 8080.
- Local web3/external-service feature flags that were missing from the backend
  `.env` were supplied as process environment values for the bootRun process.
- Playwright local smoke preview was aligned with backend CORS by using
  `localhost` instead of `127.0.0.1`, and the run used `E2E_SMOKE_PORT=3000`.
- Member smoke credentials are now auto-created through local `/auth/signup`
  when `E2E_SMOKE_EMAIL` and `E2E_SMOKE_PASSWORD` are not configured.
- Logout smoke now follows the current confirmation modal flow.
- Workout verification method assertion now accepts the current compact
  `위치인증` accessible name.

### Testing Decisions

- Command used:
  `$env:E2E_SMOKE_API_BASE_URL='http://localhost:8080'; $env:E2E_SMOKE_PORT='3000'; pnpm test:e2e:smoke`
- Result: 2 passed, 1 skipped.
- Passed:
  - member home core APIs respond through the real local backend
  - member logout calls the real `/auth/logout` endpoint and returns to login
- Skipped:
  - trainer dashboard smoke, because `E2E_SMOKE_TRAINER_EMAIL` and
    `E2E_SMOKE_TRAINER_PASSWORD` were not configured.

### Current Status

- Local full-stack member smoke is GREEN.
- Mock-based frontend e2e remains GREEN from the previous follow-up.
- Production smoke remains unexecuted.
- Local trainer full-stack smoke remains unverified until trainer credentials
  are provided or a local trainer seed helper is added.

### Follow-up Notes

- For repeatability, the backend local `.env` should be aligned with
  `.env.example` for the missing web3 feature flags and external-service
  placeholders, or a dedicated local test profile should supply safe defaults.
- The FE smoke config now uses `localhost` for local preview so browser origin
  can match backend dev CORS.

### Testing Language To Use Going Forward

- "mock e2e GREEN" means frontend user flows pass against controlled API responses.
- "local full-stack GREEN" means frontend + local backend + local DB pass together.
- "prod smoke GREEN" means deployed production/testnet environment responds for core flows.

### Out of Scope For Current Completed Work

- Claiming production readiness from mock e2e alone.
- Claiming backend API contract compatibility without either local full-stack testing or prod smoke.
- Adding or committing real test credentials to the repository.
