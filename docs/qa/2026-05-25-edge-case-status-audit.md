# 2026-05-25 Edge Case Fix Status Audit

## Current Conclusion

As of 2026-05-30 01:53 KST, the 5.10, 5.12, 5.15, and 5.18 edge-case checklist is fixed and verified in the current `MZTK_FE` working tree.

No known open item remains in this audit. The earlier incomplete table in this document was stale and has been replaced with the current code and test evidence below.

Current branch:

- `develop`

## Latest Verification

- `pnpm exec vitest run src/utils/__tests__/edgeCaseValidation.test.ts src/hooks/__tests__/communityEdgeValidation.test.tsx src/pages/__tests__/TrainerStoreRegister.edge.test.tsx src/pages/__tests__/MarketplaceTrainer.qa.test.tsx src/pages/__tests__/RecordAuth.edge.test.tsx src/pages/__tests__/RecordAuth.test.tsx src/pages/__tests__/ExerciseAuth.test.tsx src/pages/__tests__/LocationRegister.test.tsx src/pages/__tests__/RegisterWallet.test.tsx src/pages/__tests__/WalletPinEdgeCases.test.tsx src/components/community/__tests__/QuestionPostRewardSelector.edge.test.tsx src/components/community/__tests__/TokenSelect.test.tsx src/components/token/__tests__/WithdrawAmt.test.tsx src/components/auth/__tests__/ProtectedRoute.test.tsx --reporter=verbose`: 14 files passed, 79 tests passed.
- `pnpm run build`: passed after the final source changes. Existing warnings only: `lottie-web` eval warning and large chunk warning.
- `pnpm test:e2e:smoke -- --reporter=list` with `E2E_SMOKE_API_BASE_URL=http://localhost:8080` and `E2E_SMOKE_PORT=4174`: 2 passed, 1 skipped. The skipped trainer smoke still depends on trainer credentials.
- Real BE/DB smoke from `playwright.qa-real-be.config.ts`: 1 passed at 2026-05-30 01:24 KST after local BE/Postgres/fake-RPC recovery.

## Completion Map

| Area                             | Edge case                                                   | Status | Evidence                                                                                                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.10 wallet registration/restore | Rapid mnemonic submit and rapid PIN confirmation            | Done   | `src/pages/RegisterWallet.tsx` now has an in-flight registration guard. `RegisterWallet.test.tsx` covers rapid mnemonic submit and rapid PIN confirmation. `WalletPinEdgeCases.test.tsx` covers rapid PIN confirmation in create and restore wallet flows. |
| 5.10 protected route             | Token exists but app auth state is false                    | Done   | `ProtectedRoute` requires a complete session and `ProtectedRoute.test.tsx` verifies token-only storage redirects to login.                                                                                                                                 |
| 5.10 trainer route               | Normal user directly opens `/trainer`                       | Done   | Trainer routes use `allowedRoles={["TRAINER"]}` and `ProtectedRoute.test.tsx` verifies normal-user redirect and trainer access.                                                                                                                            |
| 5.12 trainer store               | Incomplete Korean phone numbers such as `010`, `010-1234-5` | Done   | `TrainerStoreRegister` uses `isValidKoreanPhoneNumber`, blocks saving, and shows a visible error. `TrainerStoreRegister.edge.test.tsx` covers this directly.                                                                                               |
| 5.12 trainer store               | Unsafe URL such as `ftp://example.com/<script>`             | Done   | `normalizeOptionalHttpUrl` parses URLs, allows only HTTP(S), and rejects unsafe nested protocols or markup. Covered by `edgeCaseValidation.test.ts` and `TrainerStoreRegister.edge.test.tsx`.                                                              |
| 5.12 trainer class               | `-999`, `12.5`, `0` numeric inputs                          | Done   | Trainer class create/edit uses `parsePositiveIntegerInput`. `MarketplaceTrainer.qa.test.tsx` covers `-999`, `12.5`, and `capacity=0`.                                                                                                                      |
| 5.12 trainer class               | Script-like description, tag, or supplies                   | Done   | Trainer class create/edit checks `containsUnsafeMarkup`. `MarketplaceTrainer.qa.test.tsx` covers script-like class details.                                                                                                                                |
| 5.15 community                   | Over-limit tag, comment, free post, and answer content      | Done   | Shared `TEXT_LIMITS` are enforced in tag input, comment service, and post service validation. `communityEdgeValidation.test.tsx` covers long comments, tags, free posts, and answers at the service boundary.                                              |
| 5.15 question reward             | Precision-loss reward such as `1.000000000000000001`        | Done   | Reward selector accepts whole-number strings only. `QuestionPostRewardSelector.edge.test.tsx` covers precision-loss decimal and exponent notation.                                                                                                         |
| 5.15 token transfer              | `1e2`, decimal scale greater than 18, zero address          | Done   | Token transfer uses `isValidTokenAmount` and `normalizeNonZeroAddress`. Covered by `edgeCaseValidation.test.ts` and `WithdrawAmt.test.tsx`.                                                                                                                |
| 5.18 workout upload              | `.txt` proof file                                           | Done   | `useWorkoutVerification` calls `getInvalidImageFileMessage` before preview/upload. `ExerciseAuth.test.tsx` and `RecordAuth.edge.test.tsx` cover non-image files before presigned upload.                                                                   |
| 5.18 wallet PIN                  | Weak PINs such as `000000` and `123456`                     | Done   | `RegisterWallet`, `RestoreWallet`, and `CreateWallet` use `isWeakPin`. Covered by `edgeCaseValidation.test.ts`, `RegisterWallet.test.tsx`, and `WalletPinEdgeCases.test.tsx`.                                                                              |
| 5.18 location registration       | Geolocation denial leaves placeholder/default location      | Done   | `LocationRegister` tracks actual location selection and disables registration for the placeholder address. `LocationRegister.test.tsx` covers geolocation denial.                                                                                          |

## Notes

- The final prod smoke skip is expected unless trainer credentials are supplied for the smoke session.
- The build warnings are pre-existing bundle hygiene warnings and are not QA blockers for this audit.
- Stale `/trainer/status` production calls were removed; remaining matches are test fixtures or negative assertions.
