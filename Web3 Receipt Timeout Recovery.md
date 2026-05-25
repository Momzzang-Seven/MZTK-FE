# MOM-450 Web3 Receipt Timeout Recovery FE 공유

카테고리: 조회 조건 수정에 따른 변경점 문서화
진행상태: 시작 전

# MOM-450 Web3 Receipt Timeout Recovery FE 공유 문서

- 카테고리: Web3 / Wallet Registration / QnA / Marketplace
- 설명: MOM-450 receipt timeout recovery FE 전달용 변경 안내
- 기준 문서: `docs.local/api/user/MOM-439 지갑 등록 EIP-7702 승인 플로우.md`
- 진행상태: 완료
- Method: Multiple
- URL:
  - `/web3/wallet-registrations/{registrationId}`
  - `/web3/wallet-registrations/{registrationId}/approval-intent`
  - QnA `web3Execution`을 포함하는 기존 조회 API
  - Marketplace reservation `web3Execution`을 포함하는 기존 조회 API
  - `/admin/web3/wallet-registrations/replay-confirmed-approval`
- param: `registrationId`, `transactionId`, `executionIntentId`
- 사용자(시스템, 관리자, 유저 중 1): 유저, 관리자

### Description

MOM-450은 Web3 transaction receipt 조회가 timeout 되어 `UNCONFIRMED`로 남는 경우를 FE가 구분할 수 있도록 지갑 등록, QnA, Marketplace 응답을 보강한 변경이다. 지갑 등록 approval은 receipt timeout 이후 더 이상 `APPROVAL_PENDING_ONCHAIN`에서 무한 polling하지 않고, TTL에 따라 `APPROVAL_RETRYABLE` 또는 `APPROVAL_FAILED`로 노출된다. QnA/Marketplace처럼 토큰 예치, 결제, 정산, 환불이 걸린 flow는 같은 `UNCONFIRMED`라도 사용자 retry를 허용하지 않고 `ONCHAIN_UNCERTAIN / RECEIPT_TIMEOUT` recovery hint를 내려준다. 운영 복구용으로 지갑 등록 approval confirmed hook을 다시 실행하는 admin API가 추가되었다.

FE는 기존 MOM-439 지갑 등록 EIP-7702 승인 플로우를 유지하되, `RECEIPT_TIMEOUT` 상태 분기와 QnA/Marketplace `web3Execution` recovery hint 표시를 추가하면 된다. 이 문서는 MOM-439의 API 명세를 대체하지 않고, MOM-439를 기준으로 FE가 추가로 연결해야 하는 변경점만 정리한다.

## 0. 읽는 순서

| 순서 | 문서                                                            | 목적                                                                                               |
| ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1    | `docs.local/api/user/MOM-439 지갑 등록 EIP-7702 승인 플로우.md` | 지갑 등록 시작, approval 서명, execute, polling의 기본 플로우 확인                                 |
| 2    | 이 문서                                                         | receipt timeout이 발생했을 때 polling을 언제 멈추고, retry/재시작/지원 문의를 어떻게 분기할지 확인 |
| 3    | 기존 QnA/Marketplace API 문서                                   | 각 화면의 기존 `web3Execution` 위치 확인                                                           |
| 4    | 이 문서의 QnA/Marketplace 섹션                                  | 새로 추가된 recovery hint를 보고 CTA를 어떻게 숨길지 확인                                          |

## 1. FE가 먼저 이해해야 하는 핵심

`RECEIPT_TIMEOUT`은 “트랜잭션이 실패했다”가 아니라 “BE가 정해진 시간 안에 receipt를 확인하지 못했다”는 뜻이다. 따라서 tx hash가 이미 발급된 상태에서는 실제 on-chain 성공/실패가 나중에 확인될 수 있다.

지갑 등록 approval은 재시도가 가능하다. 지갑 approval은 allowance 승인 목적이고, MOM-450에서는 timeout이 발생하면 기존 registration을 재사용해서 새 approval intent를 발급할 수 있게 했다. FE는 `nextAction=RETRY_APPROVAL`을 보고 기존 retry API를 호출하면 된다.

반대로 QnA와 Marketplace는 사용자 재시도를 막아야 한다. 질문 보상 예치, 답변 채택, 예약 결제, 환불, 정산은 토큰 이동/잠금과 연결되기 때문에 timeout 상태에서 같은 action을 다시 만들면 중복 예치/중복 결제/중복 환불 위험이 있다. 이 경우 FE는 `ONCHAIN_UNCERTAIN` 상태를 표시하고, 새 Web3 action CTA를 숨겨야 한다.

늦은 성공(late success)은 BE가 복구할 수 있다. FE는 “내가 이미 실패/재시작 UI를 보여줬는데 나중에 `REGISTERED`가 내려오는” 상황을 이상 케이스로 처리하지 말고, 마지막 조회 응답을 기준으로 화면 상태를 갱신하면 된다.

## 2. FE 작업 순서 추천

| 순서 | 작업                            | 수정 기준                                                                                                                                                         |
| ---- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 공통 Web3 response 타입 확장    | QnA/Answer/Marketplace `web3Execution`에 `recoveryStatus`, `recoveryReason`, `retryAllowed` nullable 필드 추가                                                    |
| 2    | 지갑 등록 polling 로직 수정     | `APPROVAL_PENDING_ONCHAIN`만 계속 기다리지 말고 `APPROVAL_RETRYABLE`, `APPROVAL_FAILED`, `REGISTERED`, `FINALIZATION_FAILED`, `LOCAL_CONFLICT`를 종료 상태로 처리 |
| 3    | 지갑 approval retry 연결        | `nextAction=RETRY_APPROVAL`이면 `POST /web3/wallet-registrations/{registrationId}/approval-intent` 호출 후 새 `web3.signRequest`로 다시 서명                      |
| 4    | 지갑 등록 실패/재시작 UX 추가   | `APPROVAL_FAILED + RECEIPT_TIMEOUT + nextAction=NONE`이면 현재 `registrationId` polling 중단 후 새 지갑 등록 flow 시작 CTA 표시                                   |
| 5    | QnA Web3 pending UI 수정        | `recoveryStatus=ONCHAIN_UNCERTAIN`이면 일반 pending과 다른 “확인 지연” 상태로 표시하고 재시도 CTA 숨김                                                            |
| 6    | Marketplace action guard 수정   | `web3Execution.retryAllowed=false` 또는 `recoveryStatus=ONCHAIN_UNCERTAIN`이면 purchase/cancel/confirm/refund/recover 계열 CTA 숨김                               |
| 7    | QA 케이스 추가                  | 지갑 retry 가능, 지갑 재시작 필요, QnA/Marketplace retry 차단, late success 반영 확인                                                                             |
| 8    | Admin FE가 있으면 운영 API 연결 | transaction success mark 이후 지갑 finalization 미완료 건에 replay API 연결                                                                                       |

## 3. 화면/상태별 연결 가이드

### 3-1. 지갑 등록 화면

기존 MOM-439 문서의 지갑 등록 흐름은 그대로 유지한다. MOM-450에서 바뀐 부분은 5번 polling 단계 이후의 분기다.

| 단계 | FE 동작                      | 사용 API                                                            |
| ---- | ---------------------------- | ------------------------------------------------------------------- |
| 1    | challenge message 서명       | 기존 challenge API                                                  |
| 2    | 지갑 등록 시작               | `POST /web3/wallets`                                                |
| 3    | `data.web3.signRequest` 서명 | FE wallet 서명                                                      |
| 4    | 서명 제출                    | `POST /users/me/web3/execution-intents/{executionIntentId}/execute` |
| 5    | 등록 상태 polling            | `GET /web3/wallet-registrations/{registrationId}`                   |

MOM-450에서 polling 분기를 아래처럼 바꾸면 된다.

| 응답 조건                                                                                 | FE 처리                                                          |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `status=APPROVAL_SIGNED` 또는 `APPROVAL_PENDING_ONCHAIN`                                  | 계속 polling                                                     |
| `status=APPROVAL_RETRYABLE`, `lastErrorCode=RECEIPT_TIMEOUT`, `nextAction=RETRY_APPROVAL` | polling 중단, “승인 다시 시도” CTA 표시                          |
| `status=APPROVAL_FAILED`, `lastErrorCode=RECEIPT_TIMEOUT`, `nextAction=NONE`              | polling 중단, 현재 registration 종료, 새 지갑 등록 시작 CTA 표시 |
| `status=REGISTERED`, `nextAction=DONE`                                                    | 완료 처리                                                        |
| `status=FINALIZATION_FAILED` 또는 `LOCAL_CONFLICT`                                        | 지원 문의/운영 복구 안내                                         |
| `status=EXPIRED` 또는 `CANCELED`                                                          | 현재 flow 종료, 처음부터 다시 시작                               |

`RETRY_APPROVAL` 연결 순서:

| 단계 | FE 동작                                                                     |
| ---- | --------------------------------------------------------------------------- |
| 1    | 사용자가 “승인 다시 시도” 클릭                                              |
| 2    | `POST /web3/wallet-registrations/{registrationId}/approval-intent` 호출     |
| 3    | 응답의 새 `data.latestExecutionIntentId`, `data.web3.signRequest` 사용      |
| 4    | 이전 `executionIntentId`, 이전 `signRequest`, 이전 서명값은 재사용하지 않음 |
| 5    | 새 서명 제출 후 다시 status polling                                         |

### 3-2. QnA 질문/답변 화면

QnA에서 `web3Execution`이 내려오는 화면은 아래 값을 공통으로 확인한다.

| 조건                                             | FE 처리                                                |
| ------------------------------------------------ | ------------------------------------------------------ |
| `web3Execution == null`                          | 기존처럼 Web3 pending 표시 없음                        |
| `web3Execution.transaction.status=UNCONFIRMED`   | tx hash는 있지만 receipt 확인이 지연된 상태            |
| `web3Execution.recoveryStatus=ONCHAIN_UNCERTAIN` | 일반 pending과 구분해서 “확인 지연” 상태 표시          |
| `web3Execution.recoveryReason=RECEIPT_TIMEOUT`   | receipt timeout 안내 문구 사용                         |
| `web3Execution.retryAllowed=false`               | 질문/답변 create/update/delete/accept/recover CTA 숨김 |

QnA에서는 timeout 상태에서 새 intent를 만들면 안 된다. 특히 기존 recover-create/recover-update 같은 API가 있더라도 `retryAllowed=false`이면 FE에서 호출하지 않는다.

### 3-3. Marketplace 예약 화면

Marketplace reservation은 top-level viewer action과 `web3Execution`을 함께 본다.

| 조건                                                                                                         | FE 처리                            |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `web3Execution.recoveryStatus=ONCHAIN_UNCERTAIN`                                                             | 결제/환불/정산 확인 지연 상태 표시 |
| `web3Execution.retryAllowed=false`                                                                           | 사용자 action CTA 숨김             |
| `web3Execution.viewerCanRecover=false`                                                                       | 기존 recover CTA 숨김              |
| `web3Execution.transaction.txHash != null`                                                                   | explorer 링크는 표시 가능          |
| top-level `viewerCanCancel`, `viewerCanComplete`, `viewerCanClaimDeadlineRefund`, `viewerCanRecover`가 false | 버튼 숨김 또는 disabled            |

Marketplace에서는 timeout 상태에서 purchase, cancel, confirm, deadline-refund, trainer reject, recover를 새로 진행하지 않는다. 사용자는 대기하거나 지원 문의로 안내한다.

### 3-4. Admin/운영 화면

Admin FE가 없다면 이 절은 FE 작업 범위에서 제외해도 된다. Admin 화면이 있다면 운영 복구 순서는 아래처럼 잡으면 된다.

| 순서 | 운영 동작                                                    | API                                                               |
| ---- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1    | explorer/RPC에서 tx receipt success 확인                     | 외부 확인                                                         |
| 2    | `UNCONFIRMED` transaction을 success로 mark                   | `POST /admin/web3/transactions/{txId}/mark-succeeded`             |
| 3    | 지갑 등록이 아직 `REGISTERED`가 아니면 confirmed hook replay | `POST /admin/web3/wallet-registrations/replay-confirmed-approval` |
| 4    | replay response의 `outcome` 확인                             | `REGISTERED`, `FINALIZATION_FAILED`, `LOCAL_CONFLICT` 등          |

## 4. FE에서 수정해야 하는 포인트

| 수정 대상                           | 해야 할 일                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Wallet registration 상태 enum/type  | `APPROVAL_RETRYABLE`, `APPROVAL_FAILED`, `FINALIZATION_FAILED`, `LOCAL_CONFLICT` 분기 확인                  |
| Wallet registration nextAction 처리 | `RETRY_APPROVAL`, `NONE`, `DONE`, `CONTACT_SUPPORT` 분기 확인                                               |
| Wallet polling hook/query           | terminal/retry/support 상태에서 polling interval 중단                                                       |
| Wallet retry handler                | retry API 호출 후 새 `web3.executionIntent.id` 기준으로 execute                                             |
| Web3Execution 타입                  | `recoveryStatus?: string \| null`, `recoveryReason?: string \| null`, `retryAllowed?: boolean \| null` 추가 |
| QnA question detail                 | `question.web3Execution.recoveryStatus` 기준 확인 지연 UI                                                   |
| QnA answer list                     | `answer.web3Execution.recoveryStatus` 기준 pending/failed row UI                                            |
| Marketplace reservation list/detail | `web3Execution.recoveryStatus`, `retryAllowed`, `viewerCanRecover` 기준 CTA guard                           |
| 공통 tx hash 표시                   | `UNCONFIRMED`이어도 tx hash가 있으면 explorer 링크 표시 가능                                                |
| QA/mock data                        | `UNCONFIRMED + ONCHAIN_UNCERTAIN`, `APPROVAL_RETRYABLE + RECEIPT_TIMEOUT` 케이스 추가                       |

## 5. 변경 요약

| 영역                               | 변경 전                                                          | 변경 후                                                                                 | FE 영향                                             |
| ---------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 지갑 등록 approval receipt timeout | `APPROVAL_PENDING_ONCHAIN`에서 계속 대기할 수 있음               | TTL이 남으면 `APPROVAL_RETRYABLE`, TTL이 끝나면 `APPROVAL_FAILED`                       | polling 종료 조건과 retry CTA 추가                  |
| 지갑 등록 retry                    | 실패/만료 일부 케이스만 retry 가능                               | `transactionStatus=UNCONFIRMED` timeout도 기존 retry API로 새 approval intent 발급 가능 | `nextAction=RETRY_APPROVAL`이면 기존 retry API 호출 |
| 지갑 등록 late success             | timeout 이후 성공 receipt가 늦게 들어오면 finalization 누락 가능 | 현재/latest unsuperseded attempt면 `REGISTERED`로 회복 가능                             | FE는 상태 재조회 결과를 그대로 반영                 |
| QnA Web3 execution 조회            | timeout인지 단순 pending인지 구분 어려움                         | `recoveryStatus`, `recoveryReason`, `retryAllowed` 추가                                 | `ONCHAIN_UNCERTAIN` 표시, 사용자 retry 차단         |
| Marketplace reservation Web3 조회  | timeout retry/recover 판단 어려움                                | `recoveryStatus`, `recoveryReason`, `retryAllowed` 추가, `viewerCanRecover=false` 유지  | 결제/환불/정산 재시도 CTA 숨김                      |
| 운영 복구                          | transaction mark-succeeded만 존재                                | 지갑 등록 approval confirmed hook replay admin API 추가                                 | admin FE가 있다면 운영 버튼/API 연동 가능           |

## 6. 지갑 등록 상태 조회 변경

- Method: `GET`
- URL: `/web3/wallet-registrations/{registrationId}`
- 사용자: 유저
- 기존 MOM-439 API와 같은 response DTO를 사용한다.

### Request Header

| 필드 명       | 타입   | 필수 여부 | 설명                   |
| ------------- | ------ | --------- | ---------------------- |
| Authorization | String | 필수      | `Bearer {accessToken}` |

### Request Body

Request Body 없음

### Response

MOM-450에서 새로 중요해진 필드는 아래와 같다. 기존 필드는 MOM-439 문서를 그대로 따른다.

| key                                | 설명 및 제약조건                                                            | value 타입 | 옵션                | Nullable | 예시                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------- | ---------- | ------------------- | -------- | -------------------------------------------------------------------------- |
| data.status                        | receipt timeout 반영 후의 effective registration 상태                       | String     | 성공 시 필수        | N        | `"APPROVAL_RETRYABLE"`                                                     |
| data.transaction.transactionStatus | 제출된 approval tx 상태. timeout이면 `UNCONFIRMED`                          | String     | transaction 포함 시 | Y        | `"UNCONFIRMED"`                                                            |
| data.lastErrorCode                 | timeout이면 `RECEIPT_TIMEOUT`                                               | String     | timeout/실패 시     | Y        | `"RECEIPT_TIMEOUT"`                                                        |
| data.lastErrorReason               | timeout 설명                                                                | String     | timeout/실패 시     | Y        | `"Receipt was not confirmed before the backend polling window timed out."` |
| data.nextAction                    | FE 다음 행동. timeout retry 가능 시 `RETRY_APPROVAL`, 재시작 필요 시 `NONE` | String     | 성공 시 필수        | N        | `"RETRY_APPROVAL"`                                                         |
| data.web3                          | 현재 서명 가능한 approval payload. timeout 상태 조회에서는 보통 null        | Object     | 조건부              | Y        | `null`                                                                     |

**Example**

**CASE 1: receipt timeout, approval TTL 남음 - retry 가능**

```json
{
  "status": "SUCCESS",
  "data": {
    "registrationId": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
    "status": "APPROVAL_RETRYABLE",
    "walletAddress": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "registeredWalletId": null,
    "latestExecutionIntentId": "2d6e70db-61c9-47ad-92b8-cfbe5b5c871e",
    "latestExecutionStatus": "PENDING_ONCHAIN",
    "approvalExpiresAt": "2026-05-23T10:30:00",
    "transaction": {
      "transactionId": 42,
      "transactionStatus": "UNCONFIRMED",
      "txHash": "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    },
    "lastErrorCode": "RECEIPT_TIMEOUT",
    "lastErrorReason": "Receipt was not confirmed before the backend polling window timed out.",
    "signRequestUnavailableReason": null,
    "nextAction": "RETRY_APPROVAL",
    "web3": null
  }
}
```

FE 처리:

| 조건                             | 처리                                                                    |
| -------------------------------- | ----------------------------------------------------------------------- |
| `data.status=APPROVAL_RETRYABLE` | polling 중단                                                            |
| `data.nextAction=RETRY_APPROVAL` | “승인 다시 시도” CTA 표시                                               |
| CTA 클릭                         | `POST /web3/wallet-registrations/{registrationId}/approval-intent` 호출 |

**CASE 2: receipt timeout, approval TTL 만료 - 현재 registration 종료**

```json
{
  "status": "SUCCESS",
  "data": {
    "registrationId": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
    "status": "APPROVAL_FAILED",
    "walletAddress": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "registeredWalletId": null,
    "latestExecutionIntentId": "2d6e70db-61c9-47ad-92b8-cfbe5b5c871e",
    "latestExecutionStatus": "PENDING_ONCHAIN",
    "approvalExpiresAt": "2026-05-23T09:00:00",
    "transaction": {
      "transactionId": 42,
      "transactionStatus": "UNCONFIRMED",
      "txHash": "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    },
    "lastErrorCode": "RECEIPT_TIMEOUT",
    "lastErrorReason": "Receipt was not confirmed before the backend polling window timed out.",
    "signRequestUnavailableReason": null,
    "nextAction": "NONE",
    "web3": null
  }
}
```

FE 처리:

| 조건                                                                                        | 처리                                                           |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `data.status=APPROVAL_FAILED`, `data.lastErrorCode=RECEIPT_TIMEOUT`, `data.nextAction=NONE` | 현재 `registrationId` polling 중단, 새 지갑 등록 시작 CTA 표시 |

주의: 이 상태에서도 나중에 receipt success가 확인되면 BE가 `REGISTERED`로 회복할 수 있다. FE는 사용자가 같은 화면에 머무르는 동안 재조회 결과가 `REGISTERED`로 바뀌면 완료 상태로 갱신하면 된다.

## 7. Approval Intent 재발급 변경

- Method: `POST`
- URL: `/web3/wallet-registrations/{registrationId}/approval-intent`
- 사용자: 유저

### Request Header

| 필드 명       | 타입   | 필수 여부 | 설명                   |
| ------------- | ------ | --------- | ---------------------- |
| Authorization | String | 필수      | `Bearer {accessToken}` |

### Request Body

Request Body 없음

### Response

기존 MOM-439 retry API와 response shape는 동일하다. MOM-450에서는 `APPROVAL_PENDING_ONCHAIN + transactionStatus=UNCONFIRMED` 상태도 retry command에서 먼저 reconciliation한 뒤 새 approval intent를 만들 수 있다.

| key                          | 설명 및 제약조건                       | value 타입 | 옵션         | Nullable | 예시                                     |
| ---------------------------- | -------------------------------------- | ---------- | ------------ | -------- | ---------------------------------------- |
| data.status                  | retry 성공 시 보통 `APPROVAL_REQUIRED` | String     | 성공 시 필수 | N        | `"APPROVAL_REQUIRED"`                    |
| data.latestExecutionIntentId | 새 approval execution intent id        | String     | 성공 시 필수 | Y        | `"4d19b4fa-37fb-4ee0-aa92-c5e8b8f95e72"` |
| data.nextAction              | 서명 가능하면 `SIGN_APPROVAL`          | String     | 성공 시 필수 | N        | `"SIGN_APPROVAL"`                        |
| data.web3                    | 새 approval 서명 payload               | Object     | 서명 가능 시 | Y        | `{...}`                                  |
| data.web3.existing           | 기존 signable intent 재사용 여부       | Boolean    | web3 포함 시 | N        | `false`                                  |

**Example**

**CASE 1: receipt timeout retry 후 새 approval intent 생성**

```json
{
  "status": "SUCCESS",
  "data": {
    "registrationId": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
    "status": "APPROVAL_REQUIRED",
    "walletAddress": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "registeredWalletId": null,
    "latestExecutionIntentId": "4d19b4fa-37fb-4ee0-aa92-c5e8b8f95e72",
    "latestExecutionStatus": "AWAITING_SIGNATURE",
    "approvalExpiresAt": "2026-05-23T10:30:00",
    "transaction": null,
    "lastErrorCode": "APPROVAL_RETRY_REQUESTED",
    "lastErrorReason": "approval retry requested",
    "signRequestUnavailableReason": null,
    "nextAction": "SIGN_APPROVAL",
    "web3": {
      "resource": {
        "type": "WALLET_REGISTRATION",
        "id": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
        "status": "PENDING_EXECUTION"
      },
      "actionType": "WALLET_ESCROW_APPROVE",
      "executionIntent": {
        "id": "4d19b4fa-37fb-4ee0-aa92-c5e8b8f95e72",
        "status": "AWAITING_SIGNATURE",
        "expiresAt": "2026-05-23T10:10:00",
        "expiresAtEpochSeconds": 1779502200
      },
      "execution": {
        "mode": "EIP7702",
        "signCount": 2
      },
      "signRequest": {
        "authorization": {
          "chainId": 11155420,
          "delegateTarget": "0x1111111111111111111111111111111111111111",
          "authorityNonce": 8,
          "payloadHashToSign": "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
        },
        "submit": {
          "executionDigest": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "deadlineEpochSeconds": 1779502200
        },
        "transaction": null
      },
      "signRequestUnavailableReason": null,
      "existing": false
    }
  }
}
```

## 8. QnA Web3 조회 응답 필드 추가

대상은 기존 QnA 조회 응답에서 `question.web3Execution` 또는 `answer.web3Execution`이 포함되는 API다.

대표 대상:

| Method | URL                           | 위치                          |
| ------ | ----------------------------- | ----------------------------- |
| `GET`  | `/posts/{postId}`             | `data.question.web3Execution` |
| `GET`  | `/questions/{postId}/answers` | `data[].web3Execution`        |

### Request Header

| 필드 명       | 타입   | 필수 여부                 | 설명                                  |
| ------------- | ------ | ------------------------- | ------------------------------------- |
| Authorization | String | endpoint별 기존 정책 유지 | 작성자 pending/failed row 조회에 필요 |

### Request Body

Request Body 없음

### Response

`QuestionWeb3ExecutionResponse`, `AnswerWeb3ExecutionResponse`에 아래 필드가 추가된다.

| key                              | 설명 및 제약조건                                         | value 타입 | 옵션                | Nullable | 예시                  |
| -------------------------------- | -------------------------------------------------------- | ---------- | ------------------- | -------- | --------------------- |
| web3Execution.recoveryStatus     | receipt timeout으로 on-chain 결과가 불확실한 상태        | String     | 조건부              | Y        | `"ONCHAIN_UNCERTAIN"` |
| web3Execution.recoveryReason     | recovery status 사유                                     | String     | 조건부              | Y        | `"RECEIPT_TIMEOUT"`   |
| web3Execution.retryAllowed       | FE/user retry 허용 여부. `ONCHAIN_UNCERTAIN`에서는 false | Boolean    | 조건부              | Y        | `false`               |
| web3Execution.transaction.status | linked transaction 상태                                  | String     | transaction 포함 시 | Y        | `"UNCONFIRMED"`       |
| web3Execution.transaction.txHash | on-chain tx hash                                         | String     | transaction 포함 시 | Y        | `"0xcccc..."`         |

**Example**

**CASE 1: QnA question execution receipt timeout**

```json
{
  "web3Execution": {
    "resource": {
      "type": "QUESTION",
      "id": "321",
      "status": "PENDING_EXECUTION"
    },
    "actionType": "QNA_QUESTION_CREATE",
    "executionIntent": {
      "id": "question-create-intent-321",
      "status": "PENDING_ONCHAIN",
      "expiresAt": "2026-05-23T10:05:00",
      "expiresAtEpochSeconds": 1779501900
    },
    "execution": {
      "mode": "EIP7702",
      "signCount": 2
    },
    "transaction": {
      "id": 1001,
      "status": "UNCONFIRMED",
      "txHash": "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    },
    "recoveryStatus": "ONCHAIN_UNCERTAIN",
    "recoveryReason": "RECEIPT_TIMEOUT",
    "retryAllowed": false
  }
}
```

FE 처리:

| 조건                                             | 처리                                                          |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `web3Execution.recoveryStatus=ONCHAIN_UNCERTAIN` | 일반 pending과 구분되는 “확인 지연/지원 필요” 상태 표시       |
| `web3Execution.recoveryReason=RECEIPT_TIMEOUT`   | receipt 확인 timeout 안내                                     |
| `web3Execution.retryAllowed=false`               | 질문/답변 create/update/delete/accept/recover 재시도 CTA 숨김 |

## 9. Marketplace Reservation Web3 조회 응답 필드 추가

대상은 reservation 조회 응답에서 `web3Execution`이 포함되는 API다.

대표 대상:

| Method | URL                                      | 위치                                |
| ------ | ---------------------------------------- | ----------------------------------- |
| `GET`  | `/marketplace/me/reservations`           | `data.reservations[].web3Execution` |
| `GET`  | `/marketplace/reservations/{id}`         | `data.web3Execution`                |
| `GET`  | `/marketplace/trainer/reservations`      | `data.reservations[].web3Execution` |
| `GET`  | `/marketplace/trainer/reservations/{id}` | `data.web3Execution`                |

### Request Header

| 필드 명       | 타입   | 필수 여부 | 설명                   |
| ------------- | ------ | --------- | ---------------------- |
| Authorization | String | 필수      | `Bearer {accessToken}` |

### Request Body

Request Body 없음

### Response

`ReservationWeb3ExecutionResponseDTO`에 아래 필드가 추가된다.

| key                              | 설명 및 제약조건                                                         | value 타입 | 옵션                | Nullable | 예시                  |
| -------------------------------- | ------------------------------------------------------------------------ | ---------- | ------------------- | -------- | --------------------- |
| web3Execution.recoveryStatus     | receipt timeout으로 on-chain 결과가 불확실한 상태                        | String     | 조건부              | Y        | `"ONCHAIN_UNCERTAIN"` |
| web3Execution.recoveryReason     | recovery status 사유                                                     | String     | 조건부              | Y        | `"RECEIPT_TIMEOUT"`   |
| web3Execution.retryAllowed       | FE/user retry 허용 여부. `ONCHAIN_UNCERTAIN`에서는 false                 | Boolean    | 조건부              | Y        | `false`               |
| web3Execution.viewerAction       | viewer 기준 가능한 action. timeout 불확실 상태에서는 null 가능           | String     | 조건부              | Y        | `null`                |
| web3Execution.viewerCanExecute   | viewer가 서명/실행할 수 있는지                                           | Boolean    | 성공 시 필수        | N        | `false`               |
| web3Execution.viewerCanRecover   | viewer가 recover API를 호출할 수 있는지. timeout 불확실 상태에서는 false | Boolean    | 성공 시 필수        | N        | `false`               |
| web3Execution.transaction.status | linked transaction 상태                                                  | String     | transaction 포함 시 | Y        | `"UNCONFIRMED"`       |

**Example**

**CASE 1: Marketplace purchase execution receipt timeout**

```json
{
  "web3Execution": {
    "resource": {
      "type": "MARKETPLACE_RESERVATION",
      "id": "501",
      "status": "PENDING_EXECUTION"
    },
    "actionType": "MARKETPLACE_CLASS_PURCHASE",
    "executionIntent": {
      "id": "marketplace-purchase-intent-501",
      "status": "PENDING_ONCHAIN",
      "expiresAt": "2026-05-23T10:05:00",
      "expiresAtEpochSeconds": 1779501900
    },
    "execution": {
      "mode": "EIP7702",
      "signCount": 2
    },
    "transaction": {
      "id": 2001,
      "status": "UNCONFIRMED",
      "txHash": "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
    },
    "viewerAction": null,
    "viewerCanExecute": false,
    "viewerCanRecover": false,
    "recoveryStatus": "ONCHAIN_UNCERTAIN",
    "recoveryReason": "RECEIPT_TIMEOUT",
    "retryAllowed": false
  }
}
```

FE 처리:

| 조건                                             | 처리                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `web3Execution.recoveryStatus=ONCHAIN_UNCERTAIN` | 결제/정산/환불 결과 확인 지연 상태 표시                                 |
| `web3Execution.retryAllowed=false`               | purchase/cancel/confirm/deadline-refund/recover 버튼 숨김               |
| `web3Execution.viewerCanRecover=false`           | 기존 recover CTA도 숨김                                                 |
| `transaction.status=UNCONFIRMED`                 | tx hash가 있으면 explorer 링크 제공 가능. 단, retry CTA는 제공하지 않음 |

## 10. 새 Admin API: 지갑 등록 approval confirmed hook replay

- Method: `POST`
- URL: `/admin/web3/wallet-registrations/replay-confirmed-approval`
- 사용자: 관리자

이 API는 운영/CS용이다. transaction receipt success가 확인되었거나 execution intent가 이미 confirmed 되었는데 지갑 등록 finalization이 끝나지 않은 경우, `WALLET_ESCROW_APPROVE` confirmed hook을 다시 실행하고 replay 후 지갑 등록 상태를 반환한다.

### Request Header

| 필드 명       | 타입   | 필수 여부 | 설명                        |
| ------------- | ------ | --------- | --------------------------- |
| Authorization | String | 필수      | `Bearer {adminAccessToken}` |
| Content-Type  | String | 필수      | `application/json`          |

### Request Body

`registrationId`, `transactionId`, `executionIntentId` 중 하나 이상은 필수다. 여러 값을 같이 보내면 서로 같은 target을 가리켜야 하며, 맞지 않으면 `TARGET_MISMATCH`가 반환된다.

| key               | 설명 및 제약조건                         | value 타입 | 옵션 | Nullable | 예시                                                          |
| ----------------- | ---------------------------------------- | ---------- | ---- | -------- | ------------------------------------------------------------- |
| registrationId    | wallet registration public id. 최대 36자 | String     | 선택 | Y        | `"9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10"`                      |
| transactionId     | web3 transaction id. 양수                | Long       | 선택 | Y        | `42`                                                          |
| executionIntentId | execution intent public id. 최대 100자   | String     | 선택 | Y        | `"2d6e70db-61c9-47ad-92b8-cfbe5b5c871e"`                      |
| reason            | replay 사유. 최대 500자                  | String     | 필수 | N        | `"receipt success confirmed but wallet finalization missing"` |
| evidence          | 운영 증빙. 최대 1000자                   | String     | 필수 | N        | `"CS-1234"`                                                   |

**Example**

**CASE 1: transactionId 기준 replay**

```json
{
  "transactionId": 42,
  "reason": "receipt success confirmed but wallet finalization missing",
  "evidence": "CS-1234"
}
```

**CASE 2: registrationId 기준 replay**

```json
{
  "registrationId": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
  "reason": "registered wallet did not finalize after confirmed approval",
  "evidence": "ops-ticket-450"
}
```

### Response

| key                                | 설명 및 제약조건                                                | value 타입 | 옵션         | Nullable | 예시                                     |
| ---------------------------------- | --------------------------------------------------------------- | ---------- | ------------ | -------- | ---------------------------------------- |
| status                             | 응답 상태                                                       | String     | 성공 시 필수 | N        | `"SUCCESS"`                              |
| data.outcome                       | replay 결과 분류                                                | String     | 성공 시 필수 | N        | `"REGISTERED"`                           |
| data.replayInvoked                 | confirmed hook replay 호출 여부                                 | Boolean    | 성공 시 필수 | N        | `true`                                   |
| data.registrationId                | resolved wallet registration id                                 | String     | 조건부       | Y        | `"9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10"` |
| data.transactionId                 | resolved transaction id                                         | Long       | 조건부       | Y        | `42`                                     |
| data.txHash                        | resolved tx hash                                                | String     | 조건부       | Y        | `"0xcccc..."`                            |
| data.executionIntentId             | resolved execution intent id                                    | String     | 조건부       | Y        | `"2d6e70db-61c9-47ad-92b8-cfbe5b5c871e"` |
| data.executionIntentStatus         | replay 전/대상 execution intent 상태                            | String     | 조건부       | Y        | `"CONFIRMED"`                            |
| data.transactionStatus             | 대상 transaction 상태                                           | String     | 조건부       | Y        | `"SUCCEEDED"`                            |
| data.walletRegistrationStatus      | replay 후 wallet registration 상태                              | String     | 조건부       | Y        | `"REGISTERED"`                           |
| data.newerWalletRegistrationExists | 같은 user/wallet의 더 최신 authoritative registration 존재 여부 | Boolean    | 성공 시 필수 | N        | `false`                                  |
| data.walletLastErrorCode           | replay 후 wallet registration error code                        | String     | 조건부       | Y        | `null`                                   |
| data.walletLastErrorReason         | replay 후 wallet registration error reason                      | String     | 조건부       | Y        | `null`                                   |

`data.outcome` 주요 값:

| 값                            | 의미                                                      | Admin FE 처리                                 |
| ----------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| `REGISTERED`                  | replay 후 지갑 등록 완료                                  | 성공 처리                                     |
| `FINALIZATION_FAILED`         | replay 했지만 local finalization 실패                     | 운영 확인 필요                                |
| `LOCAL_CONFLICT`              | replay 했지만 active wallet 충돌                          | 운영 확인 필요                                |
| `NEWER_ATTEMPT_EXISTS`        | 더 최신 지갑 등록 시도가 있어 replay 결과를 적용하지 않음 | 최신 registration 기준으로 안내               |
| `STALE_SUPERSEDED`            | 요청 target이 최신 approval intent가 아님                 | 최신 intent 확인                              |
| `REPLAYED_NO_TERMINAL_CHANGE` | replay는 호출됐지만 terminal 상태 변화 없음               | 운영 로그/상태 재확인                         |
| `NOT_REPLAYABLE`              | replay 선행 조건 불충족                                   | receipt success mark 또는 상태 확인 필요      |
| `TARGET_NOT_FOUND`            | identifier로 target을 찾지 못함                           | 입력값 확인                                   |
| `TARGET_MISMATCH`             | 보낸 identifier들이 서로 다른 target을 가리킴             | 입력값 확인                                   |
| `NOT_WALLET_APPROVAL_TARGET`  | wallet approval replay 대상이 아님                        | API 사용 대상 확인                            |
| `TARGET_AMBIGUOUS`            | registrationId 기준 target이 모호함                       | transactionId 또는 executionIntentId로 재요청 |

**Example**

**CASE 1: replay 후 REGISTERED**

```json
{
  "status": "SUCCESS",
  "data": {
    "outcome": "REGISTERED",
    "replayInvoked": true,
    "registrationId": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
    "transactionId": 42,
    "txHash": "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    "executionIntentId": "2d6e70db-61c9-47ad-92b8-cfbe5b5c871e",
    "executionIntentStatus": "CONFIRMED",
    "transactionStatus": "SUCCEEDED",
    "walletRegistrationStatus": "REGISTERED",
    "newerWalletRegistrationExists": false,
    "walletLastErrorCode": null,
    "walletLastErrorReason": null
  }
}
```

**CASE 2: replay 불가**

```json
{
  "status": "SUCCESS",
  "data": {
    "outcome": "NOT_REPLAYABLE",
    "replayInvoked": false,
    "registrationId": "9a4f98b6-0b8a-4e3a-ae44-f5d46a47ed10",
    "transactionId": 42,
    "txHash": "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    "executionIntentId": "2d6e70db-61c9-47ad-92b8-cfbe5b5c871e",
    "executionIntentStatus": "PENDING_ONCHAIN",
    "transactionStatus": "UNCONFIRMED",
    "walletRegistrationStatus": "APPROVAL_RETRYABLE",
    "newerWalletRegistrationExists": false,
    "walletLastErrorCode": "RECEIPT_TIMEOUT",
    "walletLastErrorReason": "Receipt was not confirmed before the backend polling window timed out."
  }
}
```

**CASE 3: validation 실패**

```json
{
  "status": "FAIL",
  "message": "registrationId, transactionId, or executionIntentId is required",
  "code": "WEB3_001"
}
```

## 11. 운영/FE 상태 판단 표

| 상황                                    | FE가 보는 신호                                                                                   | 사용자 CTA         | 비고                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------- |
| 지갑 approval tx pending                | `status=APPROVAL_PENDING_ONCHAIN`, `transactionStatus=PENDING`                                   | polling 유지       | 기존과 동일                                           |
| 지갑 approval receipt timeout, TTL 남음 | `status=APPROVAL_RETRYABLE`, `lastErrorCode=RECEIPT_TIMEOUT`, `nextAction=RETRY_APPROVAL`        | approval 다시 시도 | retry API 호출                                        |
| 지갑 approval receipt timeout, TTL 만료 | `status=APPROVAL_FAILED`, `lastErrorCode=RECEIPT_TIMEOUT`, `nextAction=NONE`                     | 새 지갑 등록 시작  | 현재 registration polling 중단                        |
| 지갑 approval late success              | 이후 조회에서 `status=REGISTERED`, `nextAction=DONE`                                             | 완료               | FE는 최신 조회 상태 반영                              |
| QnA receipt timeout                     | `web3Execution.recoveryStatus=ONCHAIN_UNCERTAIN`, `retryAllowed=false`                           | 지원 문의/대기     | 새 QnA Web3 action 재시도 금지                        |
| Marketplace receipt timeout             | `web3Execution.recoveryStatus=ONCHAIN_UNCERTAIN`, `viewerCanRecover=false`, `retryAllowed=false` | 지원 문의/대기     | purchase/cancel/confirm/refund/settlement 재시도 금지 |
| 운영자가 success receipt 확인           | transaction mark-succeeded 후 필요시 replay                                                      | admin 전용         | user FE action 아님                                   |

## 12. QA 시나리오

| 시나리오                                                                 | 기대 결과                                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 지갑 등록 approval execute 후 receipt timeout 발생                       | 상태 조회가 `APPROVAL_RETRYABLE + RECEIPT_TIMEOUT + RETRY_APPROVAL` 또는 `APPROVAL_FAILED + RECEIPT_TIMEOUT + NONE`으로 내려온다     |
| retry CTA 클릭                                                           | retry API가 `APPROVAL_REQUIRED + SIGN_APPROVAL + web3.signRequest`를 반환한다                                                        |
| retry 후 이전 tx가 늦게 성공                                             | 최신/유효한 attempt만 `REGISTERED`로 반영되고 stale attempt는 최신 session을 덮지 않는다                                             |
| QnA create/update/delete/accept tx가 `UNCONFIRMED`                       | 관련 조회의 `web3Execution`에 `ONCHAIN_UNCERTAIN / RECEIPT_TIMEOUT / retryAllowed=false`가 표시된다                                  |
| Marketplace purchase/cancel/confirm/refund/settlement tx가 `UNCONFIRMED` | reservation 조회의 `web3Execution`에 `ONCHAIN_UNCERTAIN / RECEIPT_TIMEOUT / retryAllowed=false`, `viewerCanRecover=false`가 표시된다 |
| Admin replay 성공                                                        | `outcome=REGISTERED`, `walletRegistrationStatus=REGISTERED`가 반환된다                                                               |
