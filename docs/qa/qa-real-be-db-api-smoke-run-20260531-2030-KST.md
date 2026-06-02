# Real BE/DB API Smoke Run - 20260531-2030 KST

## Run Context

| Item         | Value                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Target       | Local BE/DB                                                                                                                          |
| API base URL | `http://localhost:8080`                                                                                                              |
| DB           | Local `mztk-postgres`                                                                                                                |
| BE health    | `GET /actuator/health` returned HTTP `200` before this run                                                                           |
| Command      | `E2E_SMOKE_API_BASE_URL=http://localhost:8080 pnpm exec playwright test -c playwright.local-fullstack-api.config.ts --reporter=list` |

## Result

| Status  | Count | Meaning                                                      |
| ------- | ----: | ------------------------------------------------------------ |
| Passed  |     3 | Actual local BE/DB API calls completed successfully          |
| Skipped |     3 | Admin credentials and optional fixture IDs were not provided |
| Failed  |     0 | No failing API smoke checks in the executed scope            |

Overall result: `pass-with-warning`

The warning is that admin/API-escrow coverage was skipped because the required admin smoke environment variables were not available in this run.

Follow-up admin credential discovery was attempted from the current local BE dev bootstrap log without printing credential values. The current log did not contain a parseable `BOOTSTRAP ADMIN` entry, so admin API smoke remains blocked on explicit disposable admin credentials.

## TDD Cycle Result

| Phase    | Result                 | Evidence                                                                                                                                                                                            |
| -------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED      | `red-coverage-gap`     | The real BE/DB community and admin smoke checks did not exist as executable Playwright specs at the start of this cycle. The first targeted run returned `No tests found`.                          |
| GREEN    | `green-executed`       | `pnpm exec playwright test -c playwright.local-fullstack-api.config.ts --reporter=list` ran against `http://localhost:8080` and returned `3 passed`, `0 failed` for the executable non-admin scope. |
| REFACTOR | `refactor-done`        | Shared API helpers were extracted into `e2e/smoke/support/api.ts`, and `playwright.local-fullstack-api.config.ts` was added so API smoke runs do not start the FE preview server.                   |
| BLOCKED  | `blocked-test-account` | Admin read-only and escrow tests were skipped because disposable admin credentials and optional fixture IDs were not available.                                                                     |

## Passed Tests

| Test file                                     | Test                                                                        | Verified coverage                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `e2e/smoke/local-fullstack-api.spec.ts`       | `safe USER and TRAINER API services work against local BE and DB`           | Auth signup/login/reissue/stepup, user profile, leaderboard, level, attendance, location, image presign/status, workout verification safe path, posts/comments/likes, trainer store/class, marketplace list/detail/reservation safe path, Web3 challenge, transfer precondition, and admin access denial for normal user |
| `e2e/smoke/local-fullstack-community.spec.ts` | `free post and v2 comments round-trip through local BE and DB`              | Free post create/detail/list, v2 comment create/list, reply create/list, comment update, reply delete, comment delete, post delete                                                                                                                                                                                       |
| `e2e/smoke/local-fullstack-community.spec.ts` | `question and answer APIs avoid server errors when Web3 prerequisites vary` | QnA create/answer APIs did not produce server errors in this local BE state                                                                                                                                                                                                                                              |

## Skipped Tests

| Test file                                          | Test                                                               | Skip reason                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `e2e/smoke/local-fullstack-admin-readonly.spec.ts` | `admin read-only APIs return successful BE envelopes`              | Missing `E2E_SMOKE_ADMIN_LOGIN_ID` and `E2E_SMOKE_ADMIN_PASSWORD`                              |
| `e2e/smoke/local-fullstack-admin-readonly.spec.ts` | `admin marketplace escrow review APIs are read-only and DB-backed` | Missing admin credentials; also requires `E2E_SMOKE_MARKETPLACE_RESERVATION_ID`                |
| `e2e/smoke/local-fullstack-admin-readonly.spec.ts` | `admin qna escrow review APIs are read-only and DB-backed`         | Missing admin credentials; also requires `E2E_SMOKE_QNA_POST_ID` and `E2E_SMOKE_QNA_ANSWER_ID` |

## Raw Summary

```text
Running 6 tests using 1 worker

3 skipped
3 passed (2.1m)
```

## Remaining Work For Full Exhaustive Claim

| Area                      | Needed next                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Admin read-only APIs      | Provide disposable admin smoke credentials and rerun the same config                                                            |
| Marketplace escrow review | Provide disposable admin credentials plus `E2E_SMOKE_MARKETPLACE_RESERVATION_ID`                                                |
| QnA escrow review         | Provide disposable admin credentials plus `E2E_SMOKE_QNA_POST_ID` and `E2E_SMOKE_QNA_ANSWER_ID`                                 |
| External side effects     | Keep production APIs, real payments, real on-chain execution, and production S3 uploads out of scope unless explicitly approved |
