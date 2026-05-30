# BE API Contract Map

- run_id: `20260529-1419-KST`
- BE root: `C:\Users\hero9\projects\MZTK-BE`
- BE branch: `develop`
- BE HEAD/local `origin/develop`: `764cd995c4eb19b2460f6bb488e05a6d2684fa9c`
- evidence_mode: `static-controller-dto-source`
- openapi_snapshot: `not_collected`
- openapi_snapshot_reason: `Docker daemon was unavailable, so local BE server and /v3/api-docs were not started in this run.`

## Marketplace Class / Reservation

| Contract                                                              | BE source locator                                                                                                                         | FE evidence candidate                                                                                                                      |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /marketplace/trainer/classes`                                   | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:92`                           | `MZTK_FE_QA_class_media/src/services/trainer.ts:200`                                                                                       |
| `PUT /marketplace/trainer/classes/{classId}`                          | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:115`                          | `MZTK_FE_QA_class_media/src/services/trainer.ts:208`                                                                                       |
| `PATCH /marketplace/trainer/classes/{classId}/status`                 | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:138`                          | `MZTK_FE_QA_class_media/src/services/trainer.ts:227`                                                                                       |
| `GET /marketplace/trainer/classes?page=...`                           | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:159`                          | `MZTK_FE_QA_class_media/src/services/trainer.ts:218`                                                                                       |
| `GET /marketplace/classes`                                            | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:193`                          | `MZTK_FE_QA_class_media/src/services/market.ts:36`, `MZTK_FE_QA_class_media/src/pages/market/Market.tsx:114`                               |
| `GET /marketplace/classes/{classId}`                                  | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:221`                          | `MZTK_FE_QA_class_media/src/services/trainer.ts:250`                                                                                       |
| `GET /marketplace/classes/{classId}/reservation-info`                 | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/marketplace/classes/api/controller/ClassController.java:243`                          | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:139`, `MZTK_FE_QA_marketplace_web3/src/services/__tests__/reservation.test.ts:40` |
| `POST /marketplace/classes/{classId}/reservations`                    | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:356` and marketplace reservation controller source search | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:148`, `MZTK_FE_QA_marketplace_web3/src/services/__tests__/reservation.test.ts:57` |
| `GET /marketplace/me/reservations`                                    | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:358`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:164`                                                                              |
| `PATCH /marketplace/me/reservations/{reservationId}/cancel`           | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:366`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:177`                                                                              |
| `PATCH /marketplace/me/reservations/{reservationId}/complete`         | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:364`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:186`                                                                              |
| `POST /marketplace/me/reservations/{reservationId}/web3/recover`      | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:371`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:204`                                                                              |
| `GET /marketplace/trainer/reservations`                               | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:375`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:218`                                                                              |
| `PATCH /marketplace/trainer/reservations/{reservationId}/approve`     | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:380`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:233`                                                                              |
| `PATCH /marketplace/trainer/reservations/{reservationId}/reject`      | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:382`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:242`                                                                              |
| `POST /marketplace/trainer/reservations/{reservationId}/web3/recover` | `MZTK-BE/src/main/java/momzzangseven/mztkbe/global/security/SecurityConfig.java:385`                                                      | `MZTK_FE_QA_marketplace_web3/src/services/reservation.ts:253`                                                                              |

Notable mismatch:

- `GET /trainer/status` is not present in the BE contract search.
- `MZTK_FE_QA_class_media/src/services/trainer.ts` no longer calls `/trainer/status`.
- `MZTK_FE_QA_admin_web3/src/services/trainer.ts` and `MZTK_FE_QA_marketplace_web3/src/services/trainer.ts` still contain legacy `/trainer/status`; this must be resolved in the integration branch by taking the class-media version or equivalent fix.

## Image Upload / Status

| Contract                      | BE source locator                                                                                 | FE evidence candidate                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `POST /images/presigned-urls` | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/image/api/controller/ImageController.java:46` | `MZTK_FE_QA_class_media/src/services/image.ts:53`, `MZTK_FE_QA_class_media/src/hooks/trainer/useRegisterTicket.ts:280` |
| `GET /images/status?ids=...`  | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/image/api/controller/ImageController.java:81` | `MZTK_FE_QA_class_media/src/services/image.ts:107`                                                                     |

## Admin Account / User / Board

| Contract                                                   | BE source locator                                                                                                         | FE evidence candidate                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `POST /admin/accounts`                                     | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/admin/api/controller/AdminAccountController.java:39`                  | `MZTK_FE_QA_admin_web3/src/services/admin.ts:124`, `MZTK_FE_QA_admin_web3/src/pages/admin/AdminAccountManagement.tsx:326` |
| `GET /admin/accounts`                                      | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/admin/api/controller/AdminAccountController.java:49`                  | `MZTK_FE_QA_admin_web3/src/services/admin.ts:118`                                                                         |
| `POST /admin/accounts/{userId}/password/reset`             | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/admin/api/controller/AdminAccountController.java:58`                  | `MZTK_FE_QA_admin_web3/src/services/admin.ts:133`                                                                         |
| `GET /admin/users` with `search`, `status`, `page`, `size` | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/admin/user/infrastructure/external/user/AdminUserReadAdapter.java:38` | `MZTK_FE_QA_admin_web3/src/services/admin.ts:64`, `MZTK_FE_QA_admin_web3/src/store/adminStore.ts:265`                     |
| Admin board post list/search/moderation                    | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/admin/board/application/service/GetAdminBoardPostsService.java:99`    | `MZTK_FE_QA_admin_web3/src/services/admin.ts:74`, `MZTK_FE_QA_admin_web3/src/store/adminStore.ts:357`                     |

## Admin Web3

| Contract                                                                    | BE source locator                                                                                                      | FE evidence candidate                                                                                             |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `GET /admin/web3/treasury-keys`                                             | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/web3/admin/api/controller/TreasuryKeyController.java:62`           | `MZTK_FE_QA_admin_web3/src/services/admin.ts:236`, `MZTK_FE_QA_admin_web3/src/store/adminStore.ts:662`            |
| `POST /admin/web3/treasury-keys/provision`                                  | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/web3/admin/api/controller/TreasuryKeyController.java:47`           | `MZTK_FE_QA_admin_web3/src/services/admin.ts:207`, `MZTK_FE_QA_admin_web3/src/pages/admin/Web3Management.tsx:577` |
| `GET /admin/web3/nonce-slots` with `chainId`, `fromAddress`, `page`, `size` | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/web3/admin/api/controller/SponsorNonceSlotAdminController.java:24` | `MZTK_FE_QA_admin_web3/src/services/admin.ts:154`, `MZTK_FE_QA_admin_web3/src/pages/admin/Web3Management.tsx:112` |
| `POST /admin/web3/transactions/{txId}/mark-succeeded`                       | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/web3/admin/api/controller/TransactionController.java:29`           | `MZTK_FE_QA_admin_web3/src/services/admin.ts:143`, `MZTK_FE_QA_admin_web3/src/store/adminStore.ts:631`            |

## Community / QnA

| Contract                                         | BE source locator                                                                                     | FE evidence candidate                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `GET /posts`                                     | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/post/api/controller/PostController.java:100`      | `MZTK_FE/src/services/post.ts:48`                                            |
| `GET /v2/posts` cursor search                    | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/post/api/controller/PostV2Controller.java:24`     | `MZTK_FE/src/hooks/usePostBoard.ts:27`                                       |
| `POST /posts/free`                               | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/post/api/controller/PostController.java:80`       | `MZTK_FE/src/services/post.ts:18`, `MZTK_FE/src/hooks/usePostService.ts:127` |
| `GET /posts/{postId}`                            | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/post/api/controller/PostController.java:92`       | `MZTK_FE/src/services/post.ts:75`                                            |
| `POST /posts/{postId}/answers/{answerId}/accept` | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/post/api/controller/PostController.java:167`      | `MZTK_FE/src/services/post.ts:198`                                           |
| `POST /posts/{postId}/comments`                  | `MZTK-BE/src/main/java/momzzangseven/mztkbe/modules/comment/api/controller/CommentController.java:32` | `MZTK_FE/src/services/comment.ts:4`                                          |

Community gaps from this run:

- QA-002 publication status still needs BE behavior verification with a real or fixture post whose on-chain question creation is incomplete.
- QA-006 to QA-009 need FE implementation/test evidence beyond static source references.
