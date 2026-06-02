# QA Verified Structured Summary

- generated_at: `2026-05-31 KST`
- target FE repo: `C:\Users\hero9\projects\MZTK_FE`
- target BE repo: `C:\Users\hero9\projects\MZTK-BE`
- purpose: 구조화된 형태로 현재까지 검증된 QA/API 연결 상태를 정리한다.

## Current Conclusion

현재 상태는 `FE API 계약 + 핵심 real BE/DB smoke 통과`이다.

다만 `src/services` 전체 API를 real BE/DB로 전수 검증한 상태는 아니다. 전수 검증은 별도 fullstack API suite로 확장해야 한다.

검증 완료로 볼 수 있는 범위:

- FE build, focused Vitest, Playwright mocked API contract
- selected real local BE/DB smoke for QA-010, QA-011, QA-014, QA-015, QA-016
- admin marketplace escrow review and visual smoke
- prod-smoke against local BE/dev proxy and local preview
- secret scan with known false positives only

아직 전수 검증으로 보지 않는 범위:

- every `src/services` endpoint against real BE/DB
- real S3 upload
- real wallet signature
- real payment/refund/settlement execution
- real relayer or on-chain success
- production environment verification

## Evidence Levels

| Level                   | Meaning                                                                                                           | Can claim                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `real-be-db-pass`       | Local FE or Playwright reached local BE and local PostgreSQL, with DB-backed follow-up evidence where applicable. | Strong local integration evidence          |
| `browser-contract-pass` | Browser test captured the expected FE request path/method/body against mocked BE responses.                       | FE sends the right API contract            |
| `unit-build-pass`       | Vitest/build confirms FE mapping, UI state, and type safety.                                                      | FE implementation is internally consistent |
| `planned-only`          | A plan exists, but code/test/run evidence is not the document's claim.                                            | Not complete                               |
| `out-of-scope`          | Explicitly excluded from this QA pass.                                                                            | No pass/fail claim                         |
| `blocked`               | Required account, local service, fixture, or external dependency is unavailable.                                  | Not a feature failure unless proven        |

## Verified Commands And Runs

| Area                                  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                 | Result                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Focused Kakao follow-up FE tests      | `pnpm exec vitest run src/pages/__tests__/MarketApi.qa.test.tsx src/pages/__tests__/MarketPurchase.test.tsx src/components/community/__tests__/ActionList.test.tsx src/components/community/__tests__/Answer.test.tsx src/components/community/__tests__/FreePostCard.test.tsx src/pages/__tests__/Callback.integration.test.tsx src/store/__tests__/userStore.test.ts --reporter=verbose --pool=threads --maxWorkers=1` | `7` files, `61` tests passed                                                                        |
| FE build                              | `pnpm run build`                                                                                                                                                                                                                                                                                                                                                                                                         | passed, with existing lottie `eval` and chunk-size warnings                                         |
| Browser API contract                  | `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list`                                                                                                                                                                                                                                                                                                                               | `4 passed` after sandbox `spawn EPERM` retry outside sandbox                                        |
| Real BE/DB selected smoke             | `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`                                                                                                                                                                                                                                                                                                                        | passed for QA-010, QA-011, QA-014, QA-015, QA-016                                                   |
| Admin marketplace escrow API smoke    | local BE `http://localhost:8080`, FE `http://localhost:3000`, Postgres `mztk-postgres`                                                                                                                                                                                                                                                                                                                                   | refund-review and settlement-review returned HTTP `200`, envelope `SUCCESS`                         |
| Admin marketplace escrow visual smoke | `/admin/web3` with reservation fixture `11`                                                                                                                                                                                                                                                                                                                                                                              | refund and settlement review panels rendered, execute buttons disabled for non-processable fixture  |
| Secret scan                           | QA docs and QA output scan                                                                                                                                                                                                                                                                                                                                                                                               | `pass_with_false_positives`; no credential/token/cookie/private key/mnemonic/raw storageState found |

## Real BE/DB Verified Items

| QA ID                  | Flow                                 | Real BE/DB evidence                                                                                                                                                      | Status            |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| QA-010                 | Marketplace reservation create       | Browser reached `POST /marketplace/classes/{classId}/reservations`; BE returned `2xx`; follow-up `GET /marketplace/me/reservations` contained the created reservation.   | `real-be-db-pass` |
| QA-011                 | Trainer dashboard store API          | Browser reached `GET /marketplace/trainer/store`; no `/trainer/status` request was captured.                                                                             | `real-be-db-pass` |
| QA-014                 | Admin users                          | Browser reached `GET /admin/users` with admin auth.                                                                                                                      | `real-be-db-pass` |
| QA-015                 | Admin board ban/unblock restore      | Admin ban/unblock reached real BE; unblock response returned `publicationStatus=VISIBLE`, `moderationStatus=NORMAL`, and `publiclyVisible=true`.                         | `real-be-db-pass` |
| QA-016                 | Admin Web3 treasury keys             | Browser reached `GET /admin/web3/treasury-keys`; response envelope was accepted.                                                                                         | `real-be-db-pass` |
| Admin escrow extension | Marketplace refund/settlement review | `GET /admin/web3/marketplace/reservations/11/refund-review` and `GET /admin/web3/marketplace/reservations/11/settlement-review` returned HTTP `200`, envelope `SUCCESS`. | `real-be-db-pass` |

## Browser Contract Verified Items

| Area                             | API contract verified                                                                                                                      | Status                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Trainer dashboard                | Uses `GET /marketplace/trainer/store`; does not call removed `/trainer/status`.                                                            | `browser-contract-pass` |
| Marketplace purchase             | Sends reservation create request with `slotId`, `reservationDate`, `reservationTime`, `userRequest`, `idempotencyKey`, and `signedAmount`. | `browser-contract-pass` |
| Marketplace list                 | Calls `GET /marketplace/classes` without unsupported `keyword` or `status` query params.                                                   | `browser-contract-pass` |
| Marketplace detail back fallback | Direct `/market/:id` entry can return to `/market`.                                                                                        | `browser-contract-pass` |
| Admin pages                      | Captures `GET /admin/users` and `GET /admin/web3/treasury-keys`.                                                                           | `browser-contract-pass` |

## FE Unit/Integration Verified Items

| QA ID  | Item                              | Evidence                                                                                                                                                | Status                    |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| QA-021 | Marketplace list supported params | FE no longer sends unsupported `keyword` or `status` to marketplace list API; search behavior is tested.                                                | `unit-build-pass`         |
| QA-022 | Marketplace detail back fallback  | Direct detail entry falls back to `/market` when there is no browser history.                                                                           | `unit-build-pass`         |
| QA-023 | Image URL rendering               | Shared image URL builder handles object keys, absolute URLs, `blob:`, `data:`, and fallback image; community and marketplace image render paths use it. | `unit-build-pass`         |
| QA-024 | QnA Web3 pre-sign/error UI        | QnA answer Web3 intent navigates to VerifyWallet before actual signing; blocked recovery state shows delay guidance instead of a sign button.           | `unit-build-pass`         |
| QA-025 | Stale wallet/localStorage cleanup | Backend wallet state now syncs local wallet storage; stale encrypted wallet is cleared when backend wallet differs or is unlinked.                      | `unit-build-pass`         |
| QA-026 | Admin Web3 read-only              | Treasury and nonce read-only UI/API paths have prior UI/API contract evidence; local marketplace escrow review has real-BE smoke evidence.              | `partial-real-be-db-pass` |
| QA-027 | QA accounts                       | Treated as prerequisite, not feature behavior. Missing accounts must be recorded as `blocked-test-account`.                                             | `prerequisite`            |

## QA-001 To QA-020 Structured Status

| QA ID  | Current status    | Evidence summary                                                           | Remaining risk                                                                        |
| ------ | ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| QA-001 | `out-of-scope`    | Owner/source claim says relogin wallet recovery is intended flow.          | No formal decision log captured.                                                      |
| QA-002 | `pass`            | BE unit test evidence for publication visibility reconciliation.           | Local fullstack fixture was not run for this item.                                    |
| QA-003 | `out-of-scope`    | Owner/source claim says non-BE/localStorage issue.                         | Relink regression only if release scope requires it.                                  |
| QA-004 | `out-of-scope`    | Navigation-only issue excluded from API request verification.              | UI-only regression risk.                                                              |
| QA-005 | `pass`            | Image status contract verified by service tests.                           | Real S3 processing was not run.                                                       |
| QA-006 | `pass`            | My page level/XP refresh UI test evidence.                                 | No dedicated real BE/DB XP fixture proof.                                             |
| QA-007 | `pass`            | Question attachment image rendering verified.                              | No dedicated real BE media fixture proof.                                             |
| QA-008 | `pass`            | Answer adoption passes parent question id and answer id.                   | No dedicated real BE adoption fixture proof.                                          |
| QA-009 | `pass`            | Answer count rendering based on `answerCount` verified.                    | No dedicated real BE count mutation proof.                                            |
| QA-010 | `real-be-db-pass` | Reservation create and follow-up reservation list read passed.             | On-chain success remains out of scope.                                                |
| QA-011 | `real-be-db-pass` | Trainer dashboard uses `/marketplace/trainer/store`; no `/trainer/status`. | None in verified scope.                                                               |
| QA-012 | `pass`            | Marketplace class media FE/image status contract verified.                 | Real S3/local BE media processing not fully run.                                      |
| QA-013 | `pass`            | Admin generated password UI display verified.                              | Real admin account lifecycle not fully run in production-like environment.            |
| QA-014 | `real-be-db-pass` | `/admin/users` reached real BE with admin token.                           | None in verified scope.                                                               |
| QA-015 | `real-be-db-pass` | Admin board ban/unblock reached real BE and restored visibility state.     | Broader BE controller test timed out in one earlier run, but focused evidence exists. |
| QA-016 | `real-be-db-pass` | `/admin/web3/treasury-keys` reached real BE.                               | Treasury key execution actions remain out of scope.                                   |
| QA-017 | `pass`            | Treasury role selection constrained to BE enum values.                     | Provision execution is out of scope by default.                                       |
| QA-018 | `pass`            | Nonce slot BE API call and UI display verified.                            | Production chain/indexer behavior not verified.                                       |
| QA-019 | `pass`            | Negative search found no production direct Etherscan API calls.            | Env/config naming references remain.                                                  |
| QA-020 | `pass`            | Manual transaction UI separates DB tx id and on-chain tx hash.             | Real mutation not run by default.                                                     |

## API Groups Not Yet Fully Real BE/DB Exhaustive

These groups have partial evidence, contract evidence, or safe-smoke evidence, but should not be called fully exhaustive yet.

| Group                               | Current evidence                                                                                                                                       | What full exhaustive verification still needs                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth/user/attendance/level/location | Local fullstack API smoke passed against running local BE/DB on 2026-05-31.                                                                            | Broaden edge cases only if exhaustive negative-case coverage is required.                                                                                         |
| Community posts/comments/QnA        | Local fullstack community smoke passed for free post create/detail/list, v2 comment/reply round trip, update/delete, and QnA no-server-error behavior. | Full QnA adoption/settlement fixtures still require wallet/Web3 prerequisites.                                                                                    |
| Image/S3                            | Presign and status contract verified.                                                                                                                  | Decide whether real S3 upload is in scope; otherwise mark S3 PUT as out of scope and verify only BE image metadata/status paths.                                  |
| Marketplace list/detail/class media | Local fullstack smoke passed trainer store/class create, trainer/public class list, class detail, reservation-info, and safe reservation path.         | Full media processing still depends on the S3 scope decision.                                                                                                     |
| Reservation lifecycle               | Reservation create real smoke passed.                                                                                                                  | Exhaustively verify cancel, complete, deadline refund, trainer approve/reject, and recover paths with safe fixtures.                                              |
| Wallet/Web3                         | Challenge, wallet registration, intent APIs are wired.                                                                                                 | Verify read/pre-sign paths against fake RPC/local signer only; keep real signing/on-chain success out of scope unless explicitly approved.                        |
| Admin                               | Selected admin users, board restore, treasury keys, escrow review are verified.                                                                        | Exhaustively verify dashboard stats, account list/create/reset, comments, status mutations, and read-only Web3 endpoints; dangerous actions require opt-in flags. |

## Out Of Scope Unless Explicitly Approved

- production API verification
- real payment, refund, settlement, or relayer execution
- real on-chain success or explorer indexing
- real S3 upload to production-like bucket
- treasury key provision, disable, archive against non-disposable data
- admin recovery reseed
- storing credentials, tokens, cookies, private keys, mnemonics, or raw storageState in docs/output

## Recommended Next Documentation Step

Create a dedicated real-BE/DB exhaustive run report after executing the future fullstack suite.

Suggested file:

- `docs/qa/qa-real-be-db-exhaustive-api-run-YYYYMMDD-HHMM-KST.md`

Suggested final classifications:

- `pass`
- `pass-with-warning`
- `blocked-local-server`
- `blocked-test-account`
- `blocked-fixture-seed`
- `blocked-external-side-effect`
- `out-of-scope`
- `fail-fe-contract`
- `fail-be-runtime`
- `fail-db-state`

## New API Smoke Test Entry Points

These tests were added after this summary was created to turn the remaining real-BE/DB gaps into executable checks.

| Test file                                          | Purpose                                                                                                         | Required env                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `e2e/smoke/local-fullstack-community.spec.ts`      | Verifies real BE/DB free post, v2 comments, replies, update/delete, and QnA API no-server-error behavior.       | `E2E_SMOKE_API_BASE_URL=http://localhost:8080`                                                         |
| `e2e/smoke/local-fullstack-admin-readonly.spec.ts` | Verifies admin read-only APIs, admin board post comments, treasury key reads, and optional escrow review reads. | `E2E_SMOKE_API_BASE_URL`, `E2E_SMOKE_ADMIN_LOGIN_ID`, `E2E_SMOKE_ADMIN_PASSWORD`; optional fixture IDs |
| `e2e/smoke/support/api.ts`                         | Shared API smoke helpers for signup/login, admin login, response assertions, and secret-safe auth headers.      | none                                                                                                   |
| `playwright.local-fullstack-api.config.ts`         | API-only Playwright config for local fullstack checks without starting FE preview.                              | same as selected tests                                                                                 |

Recommended command:

```powershell
$env:E2E_SMOKE_API_BASE_URL='http://localhost:8080'
pnpm exec playwright test -c playwright.local-fullstack-api.config.ts --reporter=list
```

## 2026-05-31 Local Fullstack Exhaustive Addendum

### Final local conclusion

Not all items are fully pass.

Most marketplace/admin items are verified locally with real FE code, real BE, and local PostgreSQL. The remaining hard blocker is marketplace purchase/Web3 mutation:

- FE now sends `POST /marketplace/classes/{classId}/reservations` with `signedAmount` in token base units.
- Local DB ACTIVE wallet fixtures were inserted for both buyer and trainer.
- Login confirmed both fixture users return `userInfo.walletAddress`.
- The purchase request no longer fails with `WALLET_003`.
- It now fails at BE runtime with `503 MARKETPLACE_033`, body message `Marketplace Web3 execution is disabled`.

That means purchase API wiring and payload are fixed, but local full purchase success is not verified until the BE marketplace Web3 execution beans are enabled in the running local server.

### Commands/evidence from this addendum

| Area                                 | Evidence                                                                                                                                                                       | Result                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| BE compile                           | `.\gradlew.bat compileJava compileTestJava`                                                                                                                                    | `BUILD SUCCESSFUL`                                      |
| FE build                             | `pnpm run build`                                                                                                                                                               | passed; existing lottie eval/chunk warnings only        |
| Marketplace FE tests                 | `pnpm exec vitest run src/pages/__tests__/MarketPurchase.test.tsx src/pages/__tests__/MarketApi.qa.test.tsx src/services/__tests__/reservation.test.ts --reporter=verbose`     | `10 passed`                                             |
| Admin/Web3 FE tests                  | `pnpm exec vitest run src/pages/admin/__tests__/AdminAccountManagement.qa.test.tsx src/pages/admin/__tests__/Web3Management.qa.test.tsx --reporter=verbose`                    | `6 passed`                                              |
| Admin/board/image FE tests           | `pnpm exec vitest run src/pages/admin/__tests__/PostManagement.qa.test.tsx src/services/__tests__/admin.qa.test.ts src/services/__tests__/image.qa.test.ts --reporter=verbose` | `11 passed`                                             |
| Local API exhaustive spec            | `pnpm exec playwright test -c playwright.local-fullstack-api.config.ts e2e/smoke/local-fullstack-qa-exhaustive.spec.ts --reporter=list`                                        | `6 passed` in earlier run                               |
| Direct local fullstack API runner    | `node tmp-local-fullstack-direct-qa.mjs` before ACTIVE wallet fixture                                                                                                          | reached `37` checks; purchase returned `WALLET_003`     |
| ACTIVE wallet fixture                | JDBC insert into `user_wallets`, then local login                                                                                                                              | trainer/user login returned non-null `walletAddress`    |
| Direct purchase after wallet fixture | `POST /marketplace/classes/{classId}/reservations`                                                                                                                             | `503 MARKETPLACE_033`; local BE Web3 execution disabled |

### Checklist status

| Item                                  | Local status                        | Evidence                                                                                                 |
| ------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Marketplace purchase FE -> BE API     | `partial-pass / blocked-be-runtime` | FE request and base-unit `signedAmount` fixed. BE reaches Web3 execution but returns `MARKETPLACE_033`.  |
| Removed `/trainer/status`             | `pass`                              | Direct API check returned `404`; FE smoke uses `/marketplace/trainer/store`.                             |
| Class registration image attach       | `pass`                              | Presigned image IDs, lambda callback completion, class create, and class detail image fields verified.   |
| Admin user nickname search            | `pass`                              | `/admin/users?search=<nickname>&page=0&size=5&sort=nickname` returned created user.                      |
| Post restore visible in freeboard     | `pass`                              | Admin ban hid post from `/v2/posts`; unblock restored `NORMAL/VISIBLE` and public list visibility.       |
| Marketplace classes visible           | `pass`                              | Created class appeared through public marketplace list/detail.                                           |
| Marketplace infinite scroll           | `pass-with-warning`                 | API pagination and FE unit behavior verified. Final browser rerun was blocked by sandbox approval limit. |
| Marketplace search sends BE API       | `pass`                              | FE passes `search`; BE filters title/tags; direct API search returned created class.                     |
| Marketplace Web3 integration          | `blocked-be-runtime`                | Admin/read Web3 endpoints respond, but purchase mutation returns `MARKETPLACE_033`.                      |
| Admin account generated password      | `pass`                              | `/admin/accounts` returned `generatedPassword`; created admin login succeeded.                           |
| Web3 settings/wallet activity monitor | `pass`                              | `/admin/web3/treasury-keys` and `/admin/web3/nonce-slots` returned list-like data.                       |
| Manual tx confirmation TX ID display  | `unit-pass`                         | Admin Web3 FE tests passed for display/service contract.                                                 |
| Admin user pagination/search query    | `pass`                              | Real `/admin/users` query used `search`, `page`, `size`, `sort`.                                         |
| Board QUESTION answer count           | `pass`                              | BE fixed to return numeric `answerCount`; direct API found QUESTION row with numeric count.              |

### Remaining blocker

`MARKETPLACE_033` is not a FE call issue. It is the running local BE using the disabled fallback for marketplace Web3 execution. To close this fully, restart/run BE with marketplace user Web3 execution beans active and rerun the direct purchase check. If using fake local wallets, the next likely blocker may be token balance/allowance precheck unless the local chain/test wallet fixture is also prepared.

Latest actual local run:

- `docs/qa/qa-real-be-db-api-smoke-run-20260531-2030-KST.md`
- Result: `3 passed`, `3 skipped`, `0 failed`
- Classification: `pass-with-warning`
- Warning: admin read-only and escrow checks were skipped because admin smoke credentials and optional fixture IDs were not provided.

TDD cycle summary:

| Phase    | Status                 | Short result                                                                                        |
| -------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| RED      | `red-coverage-gap`     | Targeted real BE/DB smoke specs were missing at the start; first targeted run had `No tests found`. |
| GREEN    | `green-executed`       | Local BE/DB run completed with `3 passed`, `0 failed` for executable non-admin checks.              |
| REFACTOR | `refactor-done`        | API helper and API-only Playwright config were extracted for repeatable runs.                       |
| BLOCKED  | `blocked-test-account` | Admin checks need disposable admin env and optional fixture IDs.                                    |
