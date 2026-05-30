# QA API Verification Integration Log

- run_id: `20260529-1419-KST`
- created_at: `2026-05-29 KST`
- integration_worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- integration_branch: `qa/api-verification-20260529-1419`
- base: `MZTK_FE develop` at `d51b6f655a890fce103bd963f5113b643f078676`

## Owner Decision

`/trainer/status` is confirmed to be absent from BE. The class-media worktree already removed the legacy FE call, while admin_web3 and marketplace_web3 were stale. Integration must keep the class-media version.

## Patch Inputs

- `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\class_media\tracked.diff`
- `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\marketplace_web3\tracked.diff`
- `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\admin_web3\tracked.diff`
- `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\admin_web3\untracked\src\services\onchain.ts`
- combined output: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\integration-combined.diff`
- BE continuation patch: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\be-publication-status.diff`

## Apply Result

1. Created integration worktree from clean `develop`.
2. Applied `class_media/tracked.diff` with `git apply --3way --whitespace=nowarn`: clean.
3. Applied `marketplace_web3/tracked.diff` with `git apply --3way --whitespace=nowarn`: clean.
4. Applied `admin_web3/tracked.diff` with `git apply --3way --whitespace=nowarn`: clean.
5. Copied admin untracked `src/services/onchain.ts`: clean.

## Contract Check

- command: `rg -n '"/trainer/status"|/trainer/status' src`
- workdir: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- result: zero matches.

## Verification

- dependency setup: `pnpm install --offline --frozen-lockfile --ignore-scripts` passed using the local pnpm store.
- targeted Vitest combined run: 16 tests passed across `reservation.test.ts`, `MarketPurchase.test.tsx`, and `MarketplaceTrainer.qa.test.tsx`; run exited non-zero because Vitest timed out starting a worker for `CriticalPages.smoke.test.tsx`.
- targeted Vitest retry: `CriticalPages.smoke.test.tsx` passed 18 tests with `--pool=threads --maxWorkers=1`.
- build: `pnpm run build` passed (`tsc -b && vite build`).
- warnings: Vite reported existing lottie `eval` and large bundle warnings; CriticalPages retry printed jsdom `alert()` not implemented warnings after a passing run.
- secret scan: re-run over QA docs/output after combined patch export; matches were field names, endpoint names, removed env var names, and prior QA text only. No credential values were found.

## 2026-05-29 Continuation

- QA-002 BE fix: updated `PostPublicationReconciliationRowService` so a `VISIBLE` question with active create intent evidence is reconciled to `PENDING`, and a `VISIBLE` question with terminal create intent evidence is reconciled to `FAILED`. This keeps on-chain-incomplete questions out of public `VISIBLE` lists after reconciliation.
- QA-006 FE fix: `My.tsx` now calls `initLevel()` on page mount so my page refreshes level/EXP from the backend instead of relying only on persisted store state.
- QA-007 FE fix: `Question.tsx` renders attached question images when the rich text body has no inline `<img>` tag.
- QA-008 test coverage: `ActionList.qa.test.tsx` asserts answer adoption calls `acceptAnswer(parentQuestionId, answerId)`.
- QA-009 FE fix: `QuestionPostCard.tsx` and `Question.tsx` use `answerCount` for question status/count logic instead of `commentCount`.
- QA-012/QA-005 test coverage: `image.qa.test.ts` asserts uploaded images are confirmed with `GET /images/status` and marketplace class images wait for backend post-processing.
- QA-013 test coverage: `AdminAccountManagement.qa.test.tsx` asserts the generated admin password returned by BE is displayed.
- QA-017/QA-018/QA-020 test coverage: `Web3Management.qa.test.tsx` asserts BE nonce-slot loading, treasury role enum options, and DB transaction ID/TX hash separation.
- QA-015 FE fix: admin board restore now calls the BE unblock endpoint, uses BE-supported board filters, and stores `publiclyVisible` from the moderation response.
- Browser evidence: added `e2e/qa-api-contract.spec.ts` for mocked browser-network request capture across trainer, marketplace purchase, admin users, and admin web3.

Continuation verification:

- BE: `.\\gradlew --no-daemon --max-workers=1 test --tests "momzzangseven.mztkbe.modules.post.application.service.PostPublicationReconciliationRowServiceTest" --rerun-tasks` passed. The first non-escalated Gradle run failed on user-level `.gradle` cache access; a timed-out retry left Gradle Java processes that were checked and cleared before the successful no-daemon run.
- FE: `pnpm exec vitest run src/pages/__tests__/My.qa.test.tsx src/pages/admin/__tests__/AdminAccountManagement.qa.test.tsx src/pages/admin/__tests__/Web3Management.qa.test.tsx src/services/__tests__/image.qa.test.ts src/components/community/__tests__/ActionList.qa.test.tsx src/components/community/__tests__/Question.qa.test.tsx --reporter=verbose --pool=threads --maxWorkers=1` passed 10 tests.
- FE: `pnpm exec vitest run src/services/__tests__/reservation.test.ts src/pages/__tests__/MarketPurchase.test.tsx src/pages/__tests__/MarketplaceTrainer.qa.test.tsx src/pages/__tests__/CriticalPages.smoke.test.tsx src/pages/__tests__/My.qa.test.tsx src/pages/admin/__tests__/AdminAccountManagement.qa.test.tsx src/pages/admin/__tests__/Web3Management.qa.test.tsx src/services/__tests__/image.qa.test.ts src/components/community/__tests__/ActionList.qa.test.tsx src/components/community/__tests__/Question.qa.test.tsx --reporter=verbose --pool=threads --maxWorkers=1` passed 44 tests across 10 files. jsdom printed two existing `window.alert()` not implemented warnings from smoke coverage after passing.
- FE: `pnpm run build` passed (`tsc -b && vite build`) with existing lottie `eval` and bundle-size warnings.
- FE: `pnpm exec vitest run src/services/__tests__/reservation.test.ts src/pages/__tests__/MarketPurchase.test.tsx src/pages/__tests__/MarketplaceTrainer.qa.test.tsx src/pages/__tests__/CriticalPages.smoke.test.tsx src/pages/__tests__/My.qa.test.tsx src/pages/admin/__tests__/AdminAccountManagement.qa.test.tsx src/pages/admin/__tests__/Web3Management.qa.test.tsx src/pages/admin/__tests__/PostManagement.qa.test.tsx src/services/__tests__/image.qa.test.ts src/services/__tests__/admin.qa.test.ts src/store/__tests__/adminStore.qa.test.ts src/components/community/__tests__/ActionList.qa.test.tsx src/components/community/__tests__/Question.qa.test.tsx --reporter=verbose --pool=threads --maxWorkers=1` passed 50 tests across 13 files.
- FE browser: `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list` initially hit sandbox `spawn EPERM`, then passed 3 tests after escalation and one route-interception fix. Captured browser requests prove `POST /marketplace/classes/{classId}/reservations`, `GET /marketplace/trainer/store` without `/trainer/status`, `GET /admin/users`, and `GET /admin/web3/treasury-keys`.
- FE: `pnpm run build` passed after QA-015/browser evidence changes (`tsc -b && vite build`) with existing lottie `eval` and bundle-size warnings.
- BE: broader focused command including `AdminBoardControllerTest` exceeded the 5 minute command timeout and was stopped. The modified BE unit test `PostPublicationReconciliationRowServiceTest` was rerun separately and passed.
- Negative search: `rg -n "etherscan|api\.etherscan|VITE_ETHERSCAN|blockscout|explorer\.etherscan|fetch\(.*scan|axios\..*scan" src -S` found no production direct Etherscan API/fetch/axios calls; remaining matches are config/env naming and test explorer URL display.
- Secret scan: re-run over QA docs/output after continuation QA tests/docs; matches were field names, endpoint names, removed env var names, prior QA text, and the fake QA fixture value `qa-generated-password` only. No credential values were found.
- Secret scan: re-run after QA-015/browser evidence report/log update at `2026-05-29 16:30 KST`; matches remained false positives only. No credential, token, cookie, private key, mnemonic value, or raw storageState artifact was found.
- Real local BE + DB smoke planning: wrote `docs/qa/qa-real-be-db-smoke-plan-20260529-1419-KST.md` with exact environment, fixture, pass/fail, and failure-classification steps.
- QA-010 correction found during real-BE plan: BE `CreateReservationRequestDTO` requires `idempotencyKey` and `signedAmount`; FE `MarketPurchase` and reservation request typing/tests/browser spec were updated. Focused Vitest rerun passed 8 tests across `reservation.test.ts` and `MarketPurchase.test.tsx`; `pnpm run build` passed; Playwright browser contract rerun passed 3 tests after rebuild.
- Secret scan: re-run after real-BE smoke plan and QA-010 body correction at `2026-05-29 16:55 KST`; matches remained false positives only, including plan field names and removed env var names. No credential values were found.

## Real Local BE + DB Smoke Attempt - 2026-05-29 17:44 KST

- FE integration worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- FE branch/SHA: `qa/api-verification-20260529-1419` / `d51b6f655a890fce103bd963f5113b643f078676`
- BE branch/SHA: `develop` / `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`
- Local services verified listening during the attempt: fake RPC `127.0.0.1:18545`, BE `localhost:8080`, FE `localhost:3001`, Postgres container `mztk-postgres`.
- Added smoke harness in the integration worktree: `e2e/qa-real-be-db-smoke.spec.ts`, `e2e/support/qa-fake-rpc.mjs`, and `playwright.qa-real-be.config.ts`.
- Real BE setup succeeded for disposable member/trainer/admin login, wallet rows, trainer store, marketplace class, and admin board post fixture.
- Real browser reached `/market/purchase/{classId}` and rendered the seeded class/store data from real BE/local DB (`Selected Class`, class title, price, and available dates).
- Harness issue resolved: browser direct `fetch` to `localhost:8080` hit Spring CORS, so mutation verification was changed to Playwright `APIRequestContext` while keeping browser page navigation for FE read-path evidence.
- Last command: `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`.
- Last result: failed at QA-010 reservation create with BE `409`, code `MARKETPLACE_038`, message `Reservation completion window does not fit before the marketplace escrow deadline`.
- Current classification: `blocked-fixture-seed`. The next change should adjust `nextBookableSlot()` so `reservationDate + durationMinutes + 24h` fits before the BE escrow deadline.
- Artifacts: `test-results\qa-real-be-db-smoke-real-BE-DB-smoke-for-selected-QA-flows-chromium\error-context.md`, `test-failed-1.png`, and `video.webm` in the integration worktree.
- Secret keyword scan over the three updated QA docs at `2026-05-29 17:45 KST` returned known false positives only: field names, endpoint names, fake QA fixture wording, and redaction text. No credential, token, cookie, private key, mnemonic value, or raw storageState artifact was found.

## Real Local BE + DB Smoke Completion - 2026-05-29 22:36 KST

- Restarted Docker/Postgres/fake RPC/BE/FE as needed. Passing local endpoints were fake RPC `127.0.0.1:18545`, BE `localhost:8080`, FE `localhost:3001`, and Postgres container `mztk-postgres`.
- BE was restarted with fake RPC endpoints and a QA-only local signer mapping for `qa-marketplace-signer-kms`; the matching `marketplace-signer-treasury` row is seeded by the smoke harness. The actual signer material is not recorded in docs.
- Smoke harness fixes after the 17:44 blocker:
  - `nextBookableSlot()` now uses tomorrow `10:00:00` and local-date formatting.
  - fake RPC returns ABI-shaped 32-byte `eth_call` results for marketplace precheck selectors.
  - local dev DB stale `class_reservations` constraints are replaced with the current enum-compatible checks.
  - local dev DB stale `web3_sponsor_daily_usage.estimated_cost_wei` `NOT NULL` drift is relaxed.
  - `psqlScalar()` filters command tags such as `INSERT 0 1`.
- BE fix required for the local EIP-7702 path: removed reservation adapter `@ConditionalOnBean` gates so `ReservationMarketplaceExecutionAdapter` and `ReservationPurchasePrecheckAdapter` are selected when `web3.eip7702.enabled=true`.
- Passing command: `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`.
- Passing result: `1 passed (10.0s)` in Chromium.
- Passed selected flows: QA-010 reservation create plus reservation list read, QA-011 trainer store request with no `/trainer/status`, QA-014 admin users request, QA-015 real admin board ban/unblock restore response, and QA-016 admin Web3 treasury keys request.
- Scope limit remains: this is local BE/local Postgres evidence only, not real wallet/relayer/on-chain/S3/explorer evidence.
- Secret scan: re-run after final real-BE smoke pass docs at `2026-05-29 22:36 KST`; matches remained false positives only: field names, endpoint names, prior edge-case/source mnemonic wording, removed env var names, QA fixture text, and redaction text. No credential, token, cookie, private key value, mnemonic value, or raw storageState artifact was found.

## Current Integration Status

The integration worktree contains staged tracked patch changes, including `src/services/onchain.ts`, continuation FE QA fixes/tests, QA-010 reservation body correction, QA-015 admin board restore contract fixes/tests, and the Playwright browser contract evidence spec. It also contains untracked real-BE smoke harness files. It has not been committed.

The real local BE-connected Playwright smoke is now complete for the selected QA-010/011/014/015/016 flows. Remaining optional work is broader non-smoke coverage or committing/preserving the FE integration and BE patches for handoff.

## Full Verification Update - 2026-05-30 00:20 KST

Full FE gates:

- `pnpm run build`: pass, with existing lottie `eval` and bundle-size warnings.
- `pnpm exec vitest run --pool=threads --maxWorkers=1 --reporter=verbose`: pass, `83` files and `473` tests.
- `pnpm run lint`: pass with `0` errors and `5` warnings.
- `pnpm run format:check`: fail on existing repo-wide Prettier baseline, `402` files. No broad format was applied.

Full BE gates:

- `.\gradlew.bat --no-daemon --max-workers=1 check`: first run failed only on Spotless.
- `.\gradlew.bat --no-daemon --max-workers=1 spotlessApply`: pass.
- `.\gradlew.bat --no-daemon --max-workers=1 check`: pass after Spotless. Checkstyle warnings remain baseline/non-fatal.

Browser and smoke gates:

- `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list`: pass, `3 passed`.
- `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`: pass before the later CORS restart, `1 passed (14.3s)`.
- `MZTK_FE` prod-smoke against running dev FE `http://localhost:3001`: pass after fixes, `2 passed`, `1 skipped` for missing trainer smoke credentials.
- `MZTK_FE` prod-smoke against local production preview `vite preview` on `http://localhost:4174`: pass after fixes, `2 passed`, `1 skipped`.

Changes made during full verification:

- `MZTK_FE/e2e/smoke/prod-smoke.spec.ts` now waits for the logout confirm button and uses `/marketplace/trainer/store` for trainer smoke instead of stale `/trainer/status`.
- `MZTK-BE/src/main/resources/application-dev.yml` now allows QA local origins `http://localhost:3001`, `http://localhost:4174`, and `http://127.0.0.1:4174`. This fixed browser POST logout CORS and local production preview smoke.

Latest recovery rerun:

- At `2026-05-30 01:24 KST`, the real BE/DB smoke blocker was recovered and rerun.
- Diagnosis confirmed: the failed `409 MARKETPLACE_040` rerun came from BE using non-fake `.env` RPC values. The passing rerun forced the QA fake RPC through runtime Spring configuration.
- During recovery, BE startup exposed local dev DB drift: `qna_answer_update_states` was missing because dev runs with Flyway disabled. The idempotent `V072__add_answer_publication_lifecycle.sql` migration was applied to local Postgres.
- The local signer fixture was aligned with the runtime dev signer without writing signer material to docs.
- `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`: pass, `1 passed (11.1s)`, using BE `http://localhost:8080`, FE `http://localhost:3002`, fake RPC `http://127.0.0.1:18545`, and Postgres `mztk-postgres`.
- `pnpm run build` in `MZTK_FE_QA_integration_20260529_1419`: pass with existing lottie `eval` and chunk-size warnings.
- Targeted FE QA Vitest rerun in `MZTK_FE_QA_integration_20260529_1419`: pass, `13` files and `50` tests.
- `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list`: pass, `3 passed`.
- `MZTK_FE` prod-smoke against local BE plus local `vite preview`: pass, `2 passed`, `1 skipped` for missing trainer smoke credentials.
- BE focused test `.\gradlew.bat --no-daemon --max-workers=1 test --tests "momzzangseven.mztkbe.modules.post.application.service.PostPublicationReconciliationRowServiceTest" --rerun-tasks`: pass, `BUILD SUCCESSFUL`.
- Secret scan after latest recovery docs at `2026-05-30 01:24 KST` returned known false positives only: field names, endpoint names, removed env var names, QA fixture text, and redaction text. No credential, token, cookie, private key value, mnemonic value, or raw storageState artifact was found.

Stale trainer status cleanup:

- Negative search found remaining `/trainer/status` references after the recovery pass. The production `src` reference in `MZTK_FE/src/services/trainer.ts` was removed, and `useTrainerStatus` was made local-state only to avoid calling a non-BE endpoint.
- `MZTK_FE_QA_integration_20260529_1419/e2e/smoke/prod-smoke.spec.ts` was also updated to wait for `/marketplace/trainer/store` instead of `/trainer/status`.
- Follow-up `rg -n "/trainer/status|trainer/status" src e2e` now shows no production `src` references in `MZTK_FE`; remaining matches are a test fixture route and negative assertions in browser evidence specs.
- `pnpm exec vitest run src/pages/__tests__/MarketplaceTrainer.qa.test.tsx --reporter=verbose` in `MZTK_FE`: pass, `12 passed`.
- `pnpm run build` in `MZTK_FE`: pass with existing lottie `eval` and chunk-size warnings.
- `MZTK_FE` prod-smoke rerun after stale endpoint cleanup: pass, `2 passed`, `1 skipped` for missing trainer smoke credentials.
- Secret scan after stale endpoint cleanup docs at `2026-05-30 01:29 KST` returned known false positives only and found no credential value.

## Edge Case Audit Closure - 2026-05-30 01:53 KST

- Updated `docs/qa/2026-05-25-edge-case-status-audit.md` to current completed status. The previous incomplete conclusion was stale.
- Found and fixed one additional edge defect during closure: rapid double-submit of the wallet recovery mnemonic could call registration twice before the UI rerendered. `RegisterWallet` now has a registration in-flight guard.
- Added focused edge regression tests for trainer store phone/URL validation, record-auth `.txt` rejection, wallet weak PIN and rapid PIN confirmation dedupe, question reward precision/exponent rejection, and community long content/tag/comment/answer blocking.
- Final focused regression run in `MZTK_FE`: pass, `14` files and `79` tests.
- Final `MZTK_FE` build after source changes: pass with existing lottie `eval` and chunk-size warnings only.
- Final `MZTK_FE` prod-smoke after source changes: pass, `2 passed`, `1 skipped` for missing trainer smoke credentials.
- Secret scan after edge audit closure docs at `2026-05-30 01:54 KST` returned known false positives only and found no credential value.
