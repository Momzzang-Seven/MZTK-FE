# QA API Verification Blocked Report

- run_id: `20260529-1412-KST`
- created_at: `2026-05-29 14:12 KST`
- verification_run_result: `blocked`
- release_readiness_result: `not_evaluated`
- blocker_code: `blocked-missing-notion-source`
- verification_workspace_root: `C:\Users\hero9\projects\MZTK_FE`
- intake_artifact_root: `C:\Users\hero9\projects\MZTK_FE`
- canonical_artifact_root: `not_created`
- source_prd: `C:\Users\hero9\projects\qa-api-verification-prd.md`

## Gate Result

Phase 0 cannot proceed to QA ID assignment or completion scoring because the Notion QA source snapshot is not available.

Per the PRD, this run does not assign `완료`, `부분완료`, or `미검증` status to any QA item. The only valid result for this run is a blocked intake record.

## Notion Source Check

Expected source:

- Notion QA page URL found in local meeting export: `https://www.notion.so/QA-35246e15be2e8041a1fdf776b144057f?pvs=21`
- Local reference file: `C:\Users\hero9\projects\ExportBlock-75aee50f-e7ff-46ab-b5cc-1171b349c74c-Part-1\[5 21] 팀 회의록 36746e15be2e80748173e904ce782a4f.md`
- Reference lines found by search: line 33 and line 157 mention `QA 기록`.

Access attempts:

- Notion fetch for `https://www.notion.so/QA-35246e15be2e8041a1fdf776b144057f?pvs=21` returned `NOT_FOUND`.
- Notion search for `QA 기록`, `35246e15be2e8041a1fdf776b144057f`, `Web3 QA 마켓플레이스 관리자 예약`, and related issue phrases did not return the QA source page.
- Local `ExportBlock-75aee50f-e7ff-46ab-b5cc-1171b349c74c-Part-1` contains a meeting note and `qa_attendance_concurrency_issue.md`, but not the full FE QA source table required by the PRD.

Required input to unblock:

- One of:
  - Notion export of the QA source page/database.
  - Copied text snapshot of the QA source.
  - A reachable Notion page/database URL with access granted to the connected Notion workspace.
- The source must include the full QA item list that covers marketplace reservation Web3, marketplace class media/list, and admin account/user/Web3 management.

## Repository / Worktree Map

| Name                              | Path                                                  | Branch                                | HEAD                                       | Dirty state   |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------- | ------------------------------------------ | ------------- |
| MZTK_FE                           | `C:\Users\hero9\projects\MZTK_FE`                     | `develop`                             | `d51b6f655a890fce103bd963f5113b643f078676` | dirty         |
| MZTK-BE                           | `C:\Users\hero9\projects\MZTK-BE`                     | `develop`                             | `764cd995c4eb19b2460f6bb488e05a6d2684fa9c` | clean         |
| QA admin Web3                     | `C:\Users\hero9\projects\MZTK_FE_QA_admin_web3`       | `fix/qa-admin-web3-management`        | `d51b6f655a890fce103bd963f5113b643f078676` | dirty         |
| QA class media                    | `C:\Users\hero9\projects\MZTK_FE_QA_class_media`      | `fix/qa-marketplace-class-media-list` | `d51b6f655a890fce103bd963f5113b643f078676` | dirty         |
| QA marketplace Web3               | `C:\Users\hero9\projects\MZTK_FE_QA_marketplace_web3` | `fix/qa-marketplace-web3-flow`        | `d51b6f655a890fce103bd963f5113b643f078676` | dirty         |
| Integration verification worktree | `not_created`                                         | `not_created`                         | `not_created`                              | not evaluated |

Remote refs observed locally:

- `MZTK_FE origin/develop`: `d51b6f655a890fce103bd963f5113b643f078676`
- `MZTK-BE origin/develop`: `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`
- Network fetch was not run because the Notion source gate failed before BE contract verification.

Excluded worktrees:

| Path                                           | Reason                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `C:\Users\hero9\projects\MZTK_FE_MOM378_merge` | `git worktree list --porcelain` reports `prunable gitdir file points to non-existent location`; excluded from QA/integration inputs. |

## Dirty Worktree Summary

`MZTK_FE` tracked changes:

- `e2e/smoke/prod-smoke.spec.ts`
- `e2e/smoke/support/session.ts`
- `playwright.prod.config.ts`
- `src/pages/__tests__/MarketplaceTrainer.qa.test.tsx`

`MZTK_FE` untracked files:

- `docs/prd/2026-05-19-edge-case-product-bug-fixes.md`
- `docs/qa/2026-05-25-edge-case-status-audit.md`
- `docs/qa/qa-api-verification-blocked-20260529-1412-KST.md`

`MZTK_FE_QA_admin_web3` tracked changes:

- `src/hooks/useAdminDashboard.ts`
- `src/pages/MyTknHistory.tsx`
- `src/pages/admin/AdminAccountManagement.tsx`
- `src/pages/admin/TokenLog.tsx`
- `src/pages/admin/UserManagement.tsx`
- `src/pages/admin/Web3Management.tsx`
- `src/services/admin.ts`
- `src/services/index.ts`
- `src/store/adminStore.ts`
- `src/types/admin.ts`

`MZTK_FE_QA_admin_web3` untracked files:

- `src/services/onchain.ts`

`MZTK_FE_QA_class_media` tracked changes:

- `src/hooks/trainer/useRegisterTicket.ts`
- `src/hooks/trainer/useTicketForm.ts`
- `src/hooks/trainer/useTrainerStatus.ts`
- `src/pages/__tests__/CriticalPages.smoke.test.tsx`
- `src/pages/__tests__/MarketplaceTrainer.qa.test.tsx`
- `src/pages/market/Market.tsx`
- `src/services/image.ts`
- `src/services/market.ts`
- `src/services/trainer.ts`
- `src/types/image.ts`

`MZTK_FE_QA_class_media` untracked files: none.

`MZTK_FE_QA_marketplace_web3` tracked changes:

- `src/constant/reservation.ts`
- `src/pages/VerifyWallet.tsx`
- `src/pages/__tests__/MarketPurchase.test.tsx`
- `src/pages/market/MarketPurchase.tsx`
- `src/pages/market/MarketReservation.tsx`
- `src/pages/trainer/TrainerReservations.tsx`
- `src/services/__tests__/reservation.test.ts`
- `src/services/reservation.ts`
- `src/types/web3.ts`

`MZTK_FE_QA_marketplace_web3` untracked files: none.

## Next Action

Provide or grant access to the full Notion QA source. After that, the next run should:

1. Save the source snapshot under `output/qa-api-verification/<RUN_ID>/notion-source/`.
2. Create `docs/qa/notion-qa-source-manifest.md`.
3. Create `docs/qa/qa-item-index-<RUN_ID>.md` with stable QA IDs.
4. Only then continue to BE contract mapping, FE service/API request evidence, UI-flow evidence, and final report generation.
