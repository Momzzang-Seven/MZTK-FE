# QA API Verification Report

## Metadata

- run_id: `20260529-1419-KST`
- verification_run_result: `full_local_static_unit_build_browser_prod_smoke_pass_selected_real_smoke_and_edge_audit_verified_pass`
- release_readiness_result: `acceptable_for_fe_api_contract_scope_and_selected_local_smoke_not_external_onchain_s3_explorer`
- verification_workspace_root: `C:\Users\hero9\projects\MZTK_FE`
- intake_artifact_root: `C:\Users\hero9\projects\MZTK_FE`
- canonical_artifact_root: `C:\Users\hero9\projects\MZTK_FE`
- source_manifest: `C:\Users\hero9\projects\MZTK_FE\docs\qa\notion-qa-source-manifest.md`
- source_snapshot: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\notion-source\notion-qa-copied-text.md`
- qa_item_index: `C:\Users\hero9\projects\MZTK_FE\docs\qa\qa-item-index-20260529-1419-KST.md`
- be_contract_map: `C:\Users\hero9\projects\MZTK_FE\docs\qa\be-api-contract-map.md`
- toolchain_snapshot: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\toolchain-runtime.txt`
- BE basis: `MZTK-BE develop`, `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`
- FE worktrees: `fix/qa-admin-web3-management`, `fix/qa-marketplace-class-media-list`, `fix/qa-marketplace-web3-flow`
- OpenAPI snapshot: not collected. Docker daemon was unavailable, so this run used controller/DTO/security source only.
- Integration verification worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419` on branch `qa/api-verification-20260529-1419`.
- Browser/network evidence: collected with Playwright mocked network responses in `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419\e2e\qa-api-contract.spec.ts`.
- Decision log: owner confirmed `/trainer/status` is not a BE endpoint and the integration must preserve the class-media removal.

## Phase Gates

| Phase                                 | Result                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------ | ------------- | ------------- | ------ | ----------- | -------- | ------------ | ------ | ---------- | -------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 source intake                 | pass                      | User provided full QA source as copied text. Snapshot and manifest created.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Phase 1 QA item indexing              | pass                      | `QA-001..QA-020` created from `0. QA 리뷰`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Phase 2 BE/FE static contract mapping | partial                   | BE static controller/security evidence and FE service references mapped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Phase 3 integration verification      | partial_pass              | Three QA worktree patches were exported and applied cleanly into `MZTK_FE_QA_integration_20260529_1419`; `/trainer/status` source search returned zero matches.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Phase 4 build/vitest/Playwright       | pass                      | `pnpm run build` passed after QA-015/browser additions, after the QA-010 reservation body correction, and again on `2026-05-30 01:17 KST` in the integration worktree. Targeted Vitest passed 50 tests across 13 files with `--pool=threads --maxWorkers=1`. Playwright browser contract evidence passed 3 tests in Chromium. Real local BE+DB Playwright smoke passed 1 test in Chromium for QA-010/011/014/015/016 after the latest fake-RPC recovery rerun. `MZTK_FE` prod-smoke passed 2 tests with 1 trainer-credential skip. BE focused Gradle unit test passed with `--no-daemon --max-workers=1 --rerun-tasks`. |
| Secret scan                           | pass_with_false_positives | `rg -n -i "password                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | passwd | access_token | refresh_token | authorization | bearer | private key | mnemonic | storageState | cookie | set-cookie | wallet private | api_key | secret" docs/qa output/qa-api-verification/20260529-1419-KST`found only field names, endpoint names, fake QA fixture value`qa-generated-password`, removed env var names such as `VITE_ETHERSCAN_API_KEY`, and existing prior QA text; no credential values were found in this run's new artifacts. |

## Repository / Worktree Map

| Name                | Path                                                  | Branch                                | HEAD                                       | Dirty state |
| ------------------- | ----------------------------------------------------- | ------------------------------------- | ------------------------------------------ | ----------- |
| MZTK_FE             | `C:\Users\hero9\projects\MZTK_FE`                     | `develop`                             | `d51b6f655a890fce103bd963f5113b643f078676` | dirty       |
| MZTK-BE             | `C:\Users\hero9\projects\MZTK-BE`                     | `develop`                             | `764cd995c4eb19b2460f6bb488e05a6d2684fa9c` | dirty       |
| QA admin Web3       | `C:\Users\hero9\projects\MZTK_FE_QA_admin_web3`       | `fix/qa-admin-web3-management`        | `d51b6f655a890fce103bd963f5113b643f078676` | dirty       |
| QA class media      | `C:\Users\hero9\projects\MZTK_FE_QA_class_media`      | `fix/qa-marketplace-class-media-list` | `d51b6f655a890fce103bd963f5113b643f078676` | dirty       |
| QA marketplace Web3 | `C:\Users\hero9\projects\MZTK_FE_QA_marketplace_web3` | `fix/qa-marketplace-web3-flow`        | `d51b6f655a890fce103bd963f5113b643f078676` | dirty       |

Excluded worktree:

- `C:\Users\hero9\projects\MZTK_FE_MOM378_merge`: prunable; gitdir points to non-existent location.

## Summary Table

| QA ID  | Evidence level | Business priority | 범위                       | 브랜치                 | 통합 검증 | 실행 모드                                              | 상태   | 남은 리스크                                                           |
| ------ | -------------- | ----------------- | -------------------------- | ---------------------- | --------- | ------------------------------------------------------ | ------ | --------------------------------------------------------------------- |
| QA-001 | P2             | Low               | wallet-web3                | marketplace-web3       | not_run   | source-claim-only                                      | 범위밖 | 원문상 의도한 flow. 정식 decision log는 없음.                         |
| QA-002 | P0             | Critical          | community-question-web3    | base/community         | pass      | BE-unit-test                                           | 완료   | local full-stack fixture는 미실행.                                    |
| QA-003 | P2             | Low               | wallet-web3                | marketplace-web3       | not_run   | source-claim-only                                      | 범위밖 | 원문상 BE 버그 아님. 정식 decision log는 없음.                        |
| QA-004 | P1             | Medium            | navigation                 | base                   | not_run   | non-api-source-claim                                   | 범위밖 | API request verification 범위가 아님.                                 |
| QA-005 | P1             | High              | community-image-upload     | base                   | pass      | service-test                                           | 완료   | real S3는 미실행, `GET /images/status` 계약은 검증.                   |
| QA-006 | P1             | High              | community-profile-xp       | base                   | pass      | UI-test                                                | 완료   | My page mount 시 level/XP 재조회 검증.                                |
| QA-007 | P1             | High              | community-question-media   | base                   | pass      | UI-test                                                | 완료   | 질문 attachment image 렌더링 검증.                                    |
| QA-008 | P1             | High              | community-answer-adoption  | base                   | pass      | UI-test                                                | 완료   | 채택 action이 parent question id와 answer id를 전달함.                |
| QA-009 | P1             | High              | community-answer-count     | base                   | pass      | UI-test                                                | 완료   | `answerCount` 기반 상태/개수 표시 검증.                               |
| QA-010 | P0             | Critical          | marketplace-purchase-web3  | marketplace-web3       | pass      | service-ui-browser-network-mocked-response             | 완료   | 온체인 성공은 범위밖.                                                 |
| QA-011 | P0             | Critical          | marketplace-trainer-status | class-media            | pass      | source-negative-search-browser-network-mocked-response | 완료   | 통합 worktree에서 `/trainer/status` zero match.                       |
| QA-012 | P0             | Critical          | marketplace-class-media    | class-media            | pass      | service-ui-test                                        | 완료   | real S3/local BE는 미실행, image status 계약은 검증.                  |
| QA-013 | P1             | High              | admin-account              | admin-web3             | pass      | UI-test                                                | 완료   | generatedPassword 표시 검증.                                          |
| QA-014 | P0             | High              | admin-user-management      | admin-web3             | pass      | store-service-browser-network-mocked-response          | 완료   | browser에서 `/admin/users` 요청 캡처.                                 |
| QA-015 | P1             | High              | admin-board-community      | admin-web3/base        | pass      | service-store-ui-test                                  | 완료   | 복구가 BE unblock API와 `publiclyVisible` 응답을 사용함.              |
| QA-016 | P0             | Critical          | admin-web3-settings        | admin-web3             | pass      | browser-network-mocked-response                        | 완료   | browser에서 `/admin/web3/treasury-keys` 요청 캡처.                    |
| QA-017 | P1             | High              | admin-web3-treasury-key    | admin-web3             | pass      | UI-test                                                | 완료   | BE enum 4개 role로 select 제한.                                       |
| QA-018 | P1             | High              | admin-web3-monitoring      | admin-web3             | pass      | UI-test                                                | 완료   | nonce slot BE API 호출 및 표시 검증.                                  |
| QA-019 | P1             | High              | admin-web3-monitoring      | class-media/admin-web3 | pass      | negative-search                                        | 완료   | production direct Etherscan API 호출 없음; env name/reference만 남음. |
| QA-020 | P1             | High              | admin-manual-transaction   | admin-web3             | pass      | UI-test                                                | 완료   | DB transaction id와 on-chain tx hash 분리 검증.                       |

## QA Detail Sections

### QA-001

- Notion source: copied text `0.1`.
- FE evidence: wallet restore/relogin flow exists in wallet pages and tests, but this run did not inspect it as an in-scope bug.
- BE contract: not applicable.
- Browser evidence: not collected.
- Execution evidence: not run.
- Decision/blocker: source claims intended flow; formal decision log not recorded.

### QA-002

- Notion source: copied text `0.2`.
- FE evidence: `QuestionDetail` gates some actions on `publicationStatus`.
- BE contract: `Post` domain includes `publicationStatus`; list/detail DTOs include `publicationStatus`.
- Execution evidence: focused BE unit test passed for `PostPublicationReconciliationRowServiceTest`; visible questions with active/terminal on-chain create evidence are reconciled away from public `VISIBLE`.
- Remaining risk: local full-stack fixture was not run.

### QA-003

- Notion source: copied text `0.3`.
- FE evidence: localStorage wallet flow exists, but this run treats it as owner-declared non-BE issue.
- BE contract: not applicable.
- Browser evidence: not collected.
- Execution evidence: not run.

### QA-004

- Notion source: copied text `0.4`.
- FE evidence: not inspected beyond source claim.
- Scope decision: navigation-only issue; excluded from API request verification scope.

### QA-005

- Notion source: copied text `0.5`.
- FE evidence: `MZTK_FE/src/hooks/usePostService.ts:107` calls `imageService.confirmImageUpload`; `MZTK_FE/src/services/image.ts:107` uses `GET /images/status`.
- BE contract: `MZTK-BE/.../ImageController.java:81` exposes `GET /images/status`.
- Execution evidence: `src/services/__tests__/image.qa.test.ts` passed and asserts `GET /images/status`.
- Remaining risk: real S3 processing was not run.

### QA-006

- Notion source: copied text `0.6`, `1.1.1`.
- FE evidence: `My.tsx` refreshes level/XP from the backend on mount.
- BE contract: level/xp ledger exists, but profile read contract was not mapped in this run.
- Execution evidence: `src/pages/__tests__/My.qa.test.tsx` passed.

### QA-007

- Notion source: copied text `0.7`, `1.1.2`.
- FE evidence: `Question.tsx` renders attached images when no inline image exists in rich text.
- Execution evidence: `src/components/community/__tests__/Question.qa.test.tsx` passed.

### QA-008

- Notion source: copied text `0.8`, `1.1.3`.
- FE evidence: answer adoption UI calls `acceptAnswer(parentQuestionId, answerId)`.
- BE contract: `POST /posts/{postId}/answers/{answerId}/accept`.
- Execution evidence: `src/components/community/__tests__/ActionList.qa.test.tsx` passed.

### QA-009

- Notion source: copied text `0.9`, `1.1.4`.
- FE evidence: question card/detail use `answerCount`, not `commentCount`, for question status/count display.
- Execution evidence: `src/components/community/__tests__/Question.qa.test.tsx` passed.

### QA-010

- Notion source: copied text `0.10`, `1.2.1`, `1.2.9`.
- FE evidence: `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:148` calls `POST /marketplace/classes/{classId}/reservations`; `src/pages/market/MarketPurchase.tsx:152` submits selected date/time plus BE-required `idempotencyKey` and `signedAmount`.
- Test evidence: `src/services/__tests__/reservation.test.ts:57` asserts request path; `src/pages/__tests__/MarketPurchase.test.tsx:147` asserts UI submit payload and excludes legacy signature fields.
- BE contract: `SecurityConfig.java:356` allows `POST /marketplace/classes/*/reservations`; reservation controller exact source locator still needs direct mapping.
- Browser evidence: `e2e/qa-api-contract.spec.ts` captured `POST /marketplace/classes/101/reservations` with `slotId`, `reservationDate`, `reservationTime`, `userRequest`, `idempotencyKey`, and `signedAmount`.
- Execution evidence: targeted Vitest and Playwright browser contract tests passed.

### QA-011

- Notion source: copied text `0.11`, `1.2.2`.
- FE evidence: class-media branch uses `/marketplace/trainer/store` and `/marketplace/trainer/classes`; no `/trainer/status` call remains in `MZTK_FE_QA_class_media/src/services/trainer.ts`.
- BE contract: `ClassController.java` exposes `/marketplace/trainer/classes`; store contract is allowed in `SecurityConfig.java:333`.
- Browser evidence: `e2e/qa-api-contract.spec.ts` opened `/trainer`, captured `GET /marketplace/trainer/store`, and asserted no `/trainer/status` request.
- Execution evidence: `rg -n '"/trainer/status"|/trainer/status' src` returned zero matches in the integration worktree; Playwright browser contract test passed.

### QA-012

- Notion source: copied text `0.12`, `1.2.3`.
- FE evidence: `useRegisterTicket` uploads marketplace class images via `imageService.uploadMarketplaceClassImages`; `useTicketForm` includes `imageIds` in class create/update payload.
- BE contract: `POST /images/presigned-urls`, `GET /images/status`, `POST /marketplace/trainer/classes`.
- Execution evidence: `src/services/__tests__/image.qa.test.ts` and marketplace trainer QA tests passed.
- Remaining risk: no real S3/local BE evidence; this verifies FE API contract and status polling.

### QA-013

- Notion source: copied text `0.13`, `1.3.1`.
- FE evidence: `AdminAccountManagement.tsx:326` displays `issuedCredential.generatedPassword`; copy text includes login ID and password.
- BE contract: `POST /admin/accounts` returns admin account creation response with generated password.
- Execution evidence: `src/pages/admin/__tests__/AdminAccountManagement.qa.test.tsx` passed.

### QA-014

- Notion source: copied text `0.14`, `1.2.4`, `1.3.4`.
- FE evidence: `adminStore.ts` passes `search`, `status`, `role`, `page`, `size`, and `sort` to `fetchUsersList`.
- BE contract: admin user read adapter accepts `search`, `page`, and `size`.
- Browser evidence: `e2e/qa-api-contract.spec.ts` captured `GET /admin/users`.
- Execution evidence: targeted Vitest and Playwright browser contract tests passed.

### QA-015

- Notion source: copied text `0.15`, `1.2.5`, `1.3.5`.
- FE evidence: `unblockAdminPost` calls `POST /admin/boards/posts/{postId}/unblock`, `adminStore.unbanPost` stores `publicationStatus`, `moderationStatus`, and `publiclyVisible`, and `PostManagement` routes restore clicks through the store action.
- BE contract: `AdminBoardController` exposes `/admin/boards/posts/{postId}/unblock` and returns `publiclyVisible`.
- Execution evidence: `src/services/__tests__/admin.qa.test.ts`, `src/store/__tests__/adminStore.qa.test.ts`, and `src/pages/admin/__tests__/PostManagement.qa.test.tsx` passed.

### QA-016

- Notion source: copied text `0.16`.
- FE evidence: `adminStore.ts:665` calls `fetchAllTreasuryKeys`; `Web3Management.tsx:129` triggers fetch on mount.
- BE contract: `TreasuryKeyController.java:62` exposes `GET /admin/web3/treasury-keys`.
- Browser evidence: `e2e/qa-api-contract.spec.ts` captured `GET /admin/web3/treasury-keys`.
- Execution evidence: targeted Vitest and Playwright browser contract tests passed.
- Note: source claim that endpoint is missing is stale against current BE source.

### QA-017

- Notion source: copied text `0.17`.
- FE evidence: `Web3Management.tsx:15` defines `TREASURY_ROLE_OPTIONS` and renders a select at `Web3Management.tsx:581`.
- BE contract: `ProvisionTreasuryKeyRequestDTO` accepts `TreasuryRole`.
- Execution evidence: `src/pages/admin/__tests__/Web3Management.qa.test.tsx` passed.

### QA-018

- Notion source: copied text `0.18`, `1.3.2`.
- FE evidence: `Web3Management.tsx:112` calls `fetchSponsorNonceSlots`; `admin.ts:154` maps `GET /admin/web3/nonce-slots`.
- BE contract: `SponsorNonceSlotAdminController.java:24` exposes `GET /admin/web3/nonce-slots`.
- Execution evidence: `src/pages/admin/__tests__/Web3Management.qa.test.tsx` passed.

### QA-019

- Notion source: copied text `0.19`.
- FE evidence: integration branch negative search found no production direct Etherscan API/fetch/axios calls. Remaining hits are `VITE_ETHERSCAN_API_URL` in network config and test explorer display URL.
- BE contract: monitoring should use BE/admin web3 APIs, not direct browser Etherscan.
- Execution evidence: `rg -n "etherscan|api\.etherscan|VITE_ETHERSCAN|blockscout|explorer\.etherscan|fetch\(.*scan|axios\..*scan" src -S` reviewed.

### QA-020

- Notion source: copied text `0.20`, `1.3.3`.
- FE evidence: `adminStore.ts:631` calls `markTransactionSucceeded(txId, data)`; service maps `POST /admin/web3/transactions/{txId}/mark-succeeded`.
- BE contract: `TransactionController.java:29` uses `{txId}` path variable.
- Execution evidence: `src/pages/admin/__tests__/Web3Management.qa.test.tsx` passed.
- Remaining risk: real BE transaction mutation was not run; UI/API contract is verified.

## Integration Verification Update

- integration_worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- integration_branch: `qa/api-verification-20260529-1419`
- patch_manifest: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\patch-manifest.md`
- combined_patch: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\integration-combined.diff`
- apply_order: `class_media/tracked.diff`, `marketplace_web3/tracked.diff`, `admin_web3/tracked.diff`, then copied `src/services/onchain.ts`.
- apply_result: all tracked patches applied cleanly with `git apply --3way --whitespace=nowarn`.
- trainer_status_check: `rg -n '"/trainer/status"|/trainer/status' src` returned zero matches in the integration worktree.
- dependency_setup: `pnpm install --offline --frozen-lockfile --ignore-scripts` completed from the local pnpm store.
- vitest_result: `pnpm exec vitest run src/services/__tests__/reservation.test.ts src/pages/__tests__/MarketPurchase.test.tsx src/pages/__tests__/MarketplaceTrainer.qa.test.tsx src/pages/__tests__/CriticalPages.smoke.test.tsx --reporter=verbose` passed 16 tests in the first three files, but the run exited non-zero because Vitest could not start a worker for `CriticalPages.smoke.test.tsx`.
- vitest_retry_result: `pnpm exec vitest run src/pages/__tests__/CriticalPages.smoke.test.tsx --reporter=verbose --pool=threads --maxWorkers=1` passed 18 tests.
- build_result: `pnpm run build` passed (`tsc -b && vite build`). Vite emitted existing bundle-size and lottie `eval` warnings.

## Continuation Verification Update

- BE QA-002 patch: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\be-publication-status.diff`
- FE combined patch refreshed: `C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST\patches\integration-combined.diff`
- BE fix summary: `PostPublicationReconciliationRowService` now downgrades incorrectly visible question posts to `PENDING` when active create evidence exists and to `FAILED` when terminal create evidence exists.
- FE fix summary: my page level/EXP refresh on mount, question image attachments render without inline `<img>`, question card/status uses `answerCount`, and focused QA tests were added for admin credentials, web3 settings, image status confirmation, and answer adoption.
- BE verification: `.\\gradlew --no-daemon --max-workers=1 test --tests "momzzangseven.mztkbe.modules.post.application.service.PostPublicationReconciliationRowServiceTest" --rerun-tasks` passed.
- FE verification: targeted `pnpm exec vitest run ... --pool=threads --maxWorkers=1` passed 44 tests across 10 files.
- FE build: `pnpm run build` passed again after continuation fixes.

## QA-015 / Browser Evidence Update

- QA-015 FE fix summary: admin board post restore now calls `POST /admin/boards/posts/{postId}/unblock`, uses BE-supported board list filters (`publicationStatus=VISIBLE&moderationStatus=NORMAL` and `moderationStatus=BLOCKED`), and preserves `publiclyVisible` from the BE response.
- QA-015 test evidence: `src/services/__tests__/admin.qa.test.ts`, `src/store/__tests__/adminStore.qa.test.ts`, and `src/pages/admin/__tests__/PostManagement.qa.test.tsx` passed.
- QA-010 correction found while concretizing real local BE + DB smoke: BE `CreateReservationRequestDTO` requires `idempotencyKey` and `signedAmount`; FE now sends both fields from `MarketPurchase`. Focused Vitest rerun passed 8 tests across `src/services/__tests__/reservation.test.ts` and `src/pages/__tests__/MarketPurchase.test.tsx`; `pnpm run build` passed; `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list` passed 3 tests after rebuild.
- Browser evidence spec: `e2e/qa-api-contract.spec.ts`.
- Playwright verification: `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list` passed 3 tests after one corrected retry. It captured marketplace reservation create, trainer dashboard marketplace store request with no `/trainer/status`, `/admin/users`, and `/admin/web3/treasury-keys`.
- FE verification: expanded targeted `pnpm exec vitest run ... --pool=threads --maxWorkers=1` passed 50 tests across 13 files.
- FE build: `pnpm run build` passed after QA-015 and browser evidence changes.
- BE verification: `.\\gradlew --no-daemon --max-workers=1 test --tests "momzzangseven.mztkbe.modules.post.application.service.PostPublicationReconciliationRowServiceTest" --rerun-tasks` passed. A broader run including `AdminBoardControllerTest` exceeded the 5 minute command timeout and was stopped; the existing BE controller source/tests were used as contract evidence for QA-015.
- Direct Etherscan negative search: production source has no direct Etherscan API/fetch/axios calls; matches are env/config naming or test explorer URL display.
- Real local BE + DB smoke plan: `C:\Users\hero9\projects\MZTK_FE\docs\qa\qa-real-be-db-smoke-plan-20260529-1419-KST.md`.

## Real Local BE + DB Smoke Attempt

- executed_at: `2026-05-29 17:44 KST`
- result: `partial_real_be_db_smoke_attempt_blocked_fixture_date_window`
- FE integration worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- FE branch/SHA: `qa/api-verification-20260529-1419` / `d51b6f655a890fce103bd963f5113b643f078676`
- BE branch/SHA: `develop` / `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`
- local endpoints verified during attempt: fake RPC `http://127.0.0.1:18545`, BE `http://localhost:8080`, FE `http://localhost:3001`, Postgres container `mztk-postgres`
- smoke harness: `e2e/qa-real-be-db-smoke.spec.ts`, `e2e/support/qa-fake-rpc.mjs`, `playwright.qa-real-be.config.ts`
- evidence reached: real BE health, disposable member/trainer/admin auth setup, wallet/store/class/post fixture setup, and real browser purchase page render of seeded class/store data through real BE/local DB.
- resolved harness issues: Vite/Playwright needed sandbox escalation for process/browser spawn; browser direct `fetch` to BE hit CORS and was replaced by Playwright `APIRequestContext` for direct BE mutation checks.
- current blocker: QA-010 reservation create returns BE `409`, code `MARKETPLACE_038`, message `Reservation completion window does not fit before the marketplace escrow deadline`.
- failure classification: `blocked-fixture-seed`; next step is to adjust `nextBookableSlot()` so the seeded reservation completion window fits before the BE escrow deadline.

## Real Local BE + DB Smoke Final Result

- executed_at: `2026-05-29 22:36 KST`
- result: `pass`
- FE integration worktree: `C:\Users\hero9\projects\MZTK_FE_QA_integration_20260529_1419`
- FE branch/SHA: `qa/api-verification-20260529-1419` / `d51b6f655a890fce103bd963f5113b643f078676`
- BE branch/SHA: `develop` / `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`
- local endpoints verified: fake RPC `http://127.0.0.1:18545`, BE `http://localhost:8080`, FE `http://localhost:3001`, Postgres container `mztk-postgres`
- command: `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`
- result detail: `1 passed (10.0s)` in Chromium.
- selected flow evidence: QA-010 reservation create and follow-up reservation list read passed against real BE/local DB; QA-011 captured `GET /marketplace/trainer/store` and no `/trainer/status`; QA-014 captured `GET /admin/users`; QA-015 real admin ban/unblock returned visible/normal/publiclyVisible state; QA-016 captured `GET /admin/web3/treasury-keys`.
- local-only repairs applied for the passing run: reservation fixture date window, fake RPC ABI response shape, BE reservation adapter bean conditions, stale local dev DB check constraints, local marketplace signer fixture plus BE local signer mapping, stale sponsor usage column nullability, and psql scalar output parsing.
- scope limit: still not evidence for real wallet signing, real relayer/on-chain settlement, real S3, or explorer indexing.

## Required Next Verification

1. Completed: real local BE-connected Playwright smoke passed after fixing the reservation fixture date window and local dev DB/Web3 fixtures.
2. Optional: re-run broader Vitest suites with constrained workers if the default fork pool repeats the startup timeout.
3. Commit or preserve the FE integration worktree patch and BE patch for handoff.

## Full Verification Update - 2026-05-30 00:20 KST

- FE full verification on the integration worktree:
  - `pnpm run build`: pass. Existing warnings only: lottie `eval` and chunk size over 500 kB.
  - `pnpm exec vitest run --pool=threads --maxWorkers=1 --reporter=verbose`: pass, `83` files and `473` tests.
  - `pnpm run lint`: pass with `0` errors and `5` existing warnings.
  - `pnpm run format:check`: fail, repo-wide Prettier baseline reports `402` files. This was not auto-formatted to avoid unrelated churn.
- BE full verification on `MZTK-BE`:
  - First `.\gradlew.bat --no-daemon --max-workers=1 check` failed only on Spotless formatting for existing modified BE files.
  - `.\gradlew.bat --no-daemon --max-workers=1 spotlessApply`: pass.
  - Re-run `.\gradlew.bat --no-daemon --max-workers=1 check`: pass. Checkstyle warnings remain non-fatal baseline output.
- Browser/API verification:
  - `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list`: pass, `3 passed`.
  - Real BE/DB smoke before the later CORS restart: pass, `1 passed (14.3s)`, confirming QA-010/011/014/015/016 against local BE/Postgres/fake RPC.
  - `MZTK_FE` prod-smoke against dev FE proxy after CORS/spec fixes: pass, `2 passed`, `1 skipped` for missing trainer smoke credentials.
  - `MZTK_FE` prod-smoke against local `vite preview`: pass, `2 passed`, `1 skipped`. Existing build warnings only: lottie `eval` and chunk size.
- Fixes made during this full verification:
  - `MZTK_FE/e2e/smoke/prod-smoke.spec.ts`: waits for the logout confirmation button and updates trainer smoke from removed `/trainer/status` to current `/marketplace/trainer/store`.
  - `MZTK-BE/src/main/resources/application-dev.yml`: adds local QA origins `http://localhost:3001`, `http://localhost:4174`, and `http://127.0.0.1:4174` so browser POST/logout and local preview smoke are not blocked by dev CORS.
- Latest real BE/DB smoke rerun after the CORS restart:
  - Recovery executed at `2026-05-30 01:24 KST`.
  - Diagnosis: the previous `409 MARKETPLACE_040` / insufficient token balance failure was caused by BE inheriting non-fake `.env` RPC values after restart, not by a FE contract regression.
  - Recovery applied: BE was restarted with the QA fake RPC forced through runtime Spring configuration; the local signer fixture was matched to the runtime dev signer without writing signer material to docs.
  - Additional local DB drift repair: applied idempotent `V072__add_answer_publication_lifecycle.sql` because Flyway-disabled dev Postgres was missing `qna_answer_update_states`.
  - Command: `pnpm exec playwright test -c playwright.qa-real-be.config.ts --project=chromium --reporter=list`, with BE `http://localhost:8080`, FE `http://localhost:3002`, fake RPC `http://127.0.0.1:18545`, and Postgres `mztk-postgres`.
  - Result: pass, `1 passed (11.1s)`, confirming QA-010/011/014/015/016 against local BE/Postgres/fake RPC after the latest recovery.
- Additional latest verification after recovery:
  - `pnpm run build` in the integration worktree: pass with existing lottie `eval` and chunk-size warnings.
  - Targeted FE QA Vitest in the integration worktree: pass, `13` files and `50` tests.
  - `pnpm exec playwright test e2e/qa-api-contract.spec.ts --project=chromium --reporter=list`: pass, `3 passed`.
  - `MZTK_FE` prod-smoke against local BE and local preview: pass, `2 passed`, `1 skipped` for missing trainer smoke credentials.
  - BE focused Gradle unit test: pass, `BUILD SUCCESSFUL`.
- Stale trainer status cleanup after recovery:
  - Removed the remaining production `src` `/trainer/status` call from `MZTK_FE` and updated the integration prod-smoke to use `/marketplace/trainer/store`.
  - Follow-up negative search shows no production `src` `/trainer/status` references in `MZTK_FE`; remaining matches are a test fixture route and negative assertions in browser evidence specs.
  - `MZTK_FE` focused MarketplaceTrainer Vitest: pass, `12 passed`.
  - `MZTK_FE` build after cleanup: pass with existing lottie `eval` and chunk-size warnings.
  - `MZTK_FE` prod-smoke after cleanup: pass, `2 passed`, `1 skipped`.

## Edge Case Audit Closure - 2026-05-30 01:53 KST

- `docs/qa/2026-05-25-edge-case-status-audit.md` was updated from stale incomplete status to current completed status for the listed 5.10, 5.12, 5.15, and 5.18 edge cases.
- A rapid mnemonic-submit regression was found during audit closure: `RegisterWallet` could call wallet registration twice if the submit button was clicked twice before React rerendered the registering step. `src/pages/RegisterWallet.tsx` now has a registration in-flight guard.
- Added focused edge regression coverage:
  - `src/pages/__tests__/TrainerStoreRegister.edge.test.tsx`: incomplete Korean phone and unsafe URL validation.
  - `src/pages/__tests__/RecordAuth.edge.test.tsx`: `.txt` record proof blocked before presigned upload.
  - `src/pages/__tests__/WalletPinEdgeCases.test.tsx`: weak PIN rejection and rapid PIN confirmation dedupe for create/restore wallet flows.
  - `src/components/community/__tests__/QuestionPostRewardSelector.edge.test.tsx`: precision-loss decimal and exponent reward rejection.
  - `src/hooks/__tests__/communityEdgeValidation.test.tsx`: long comment, tag, free post, and answer blocking at service boundary.
  - `src/pages/__tests__/RegisterWallet.test.tsx`: rapid mnemonic submit dedupe.
- Final focused edge/API/UI regression command passed: `pnpm exec vitest run src/utils/__tests__/edgeCaseValidation.test.ts src/hooks/__tests__/communityEdgeValidation.test.tsx src/pages/__tests__/TrainerStoreRegister.edge.test.tsx src/pages/__tests__/MarketplaceTrainer.qa.test.tsx src/pages/__tests__/RecordAuth.edge.test.tsx src/pages/__tests__/RecordAuth.test.tsx src/pages/__tests__/ExerciseAuth.test.tsx src/pages/__tests__/LocationRegister.test.tsx src/pages/__tests__/RegisterWallet.test.tsx src/pages/__tests__/WalletPinEdgeCases.test.tsx src/components/community/__tests__/QuestionPostRewardSelector.edge.test.tsx src/components/community/__tests__/TokenSelect.test.tsx src/components/token/__tests__/WithdrawAmt.test.tsx src/components/auth/__tests__/ProtectedRoute.test.tsx --reporter=verbose`, `14` files and `79` tests.
- Final `MZTK_FE` build passed after source changes with existing lottie `eval` and chunk-size warnings only.
- Final `MZTK_FE` prod-smoke passed after source changes: `2 passed`, `1 skipped` for missing trainer smoke credentials.

## Redaction / Secret Scan

- command: `rg -n -i "password|passwd|access_token|refresh_token|authorization|bearer|private key|mnemonic|storageState|cookie|set-cookie|wallet private|api_key|secret" C:\Users\hero9\projects\MZTK_FE\docs\qa C:\Users\hero9\projects\MZTK_FE\output\qa-api-verification\20260529-1419-KST`
- executed_at: `2026-05-29 14:19 KST`; re-run after integration patch export at `2026-05-29 14:42 KST`; re-run after continuation QA tests/docs at `2026-05-29 15:10 KST`; re-run after QA-015/browser evidence update at `2026-05-29 16:30 KST`; re-run after real-BE smoke plan and QA-010 body correction at `2026-05-29 16:55 KST`; re-run over the three updated QA docs after partial real-BE smoke logging at `2026-05-29 17:45 KST`; re-run after final real-BE smoke pass docs at `2026-05-29 22:36 KST`; re-run after full verification update at `2026-05-30 00:20 KST`; re-run after latest recovery docs at `2026-05-30 01:24 KST`; re-run after stale trainer status cleanup docs at `2026-05-30 01:29 KST`; re-run after edge audit closure docs at `2026-05-30 01:54 KST`
- result: `pass_with_false_positives`
- false positives: QA-013 generated password field names, password reset endpoint name, fake QA fixture value `qa-generated-password`, removed Etherscan env var names such as `VITE_ETHERSCAN_API_KEY`, real-BE smoke plan field names such as `password`/`token`/`storageState`, prior edge-case/source text saying mnemonic/private-key-like wallet recovery concept, and the word "Secret scan" in this report.
- redaction action: no credential, token, cookie, private key, mnemonic value, or raw storageState artifact was found or linked.
