# Kakao FE Follow-Up QA/수정 계획

## Summary

- 기준 브랜치는 `MZTK_FE` `develop`이며, BE는 계약 확인용으로 `MZTK-BE` `develop`만 참조한다.
- 기존 4개 수정 계획에 KakaoTalk 로그에서 확인된 FE follow-up 항목 `QA-021`~`QA-027`을 추가한다.
- 이 문서는 작업 계획만 정의한다. 코드 수정, 테스트 추가, QA 실행은 이 문서 작성 범위에 포함하지 않는다.
- 실제 토큰 서명, 결제, 환불, 정산, 온체인 실행은 누르지 않는다. 화면 진입, API 조회, 오류/재시도 안내, pre-sign 상태까지만 검증 대상으로 둔다.

## Key Changes

### QA-021 마켓 목록 반영

- 증상: 상세 링크로는 클래스가 열리지만 마켓 목록에는 보이지 않는 케이스를 확인한다.
- FE 마켓 목록 요청은 BE가 실제 지원하는 파라미터(`lat`, `lng`, `category`, `sort`, `trainerId`, `startTime`, `endTime`, `page`) 기준으로 검증한다.
- `keyword` 또는 `status`처럼 BE 목록 API 계약에 없는 파라미터로 문제를 우회하지 않는다.
- 검색어, 카테고리, active 목록, 페이지네이션, 새로 만든 클래스 반영 여부를 분리해서 확인한다.
- 상세 API는 200인데 목록 API에도 없으면 FE 문제가 아니라 BE active list 또는 데이터 반영 문제로 분류한다.

### QA-022 마켓 상세 뒤로가기 fallback

- 증상: `/market/:id`를 직접 링크로 진입한 뒤 뒤로가기를 누르면 마켓 메인으로 돌아가지 않는 케이스를 확인한다.
- 상세 화면의 뒤로가기는 브라우저 history가 있으면 이전 페이지로 이동한다.
- 직접 진입, 외부 링크 진입, history가 불명확한 경우에는 `/market`으로 fallback 이동하도록 계획한다.

### QA-023 이미지/파일 선택

- 커뮤니티 이미지, 운동 인증 이미지 선택 팝업, 마켓 클래스 이미지, S3 object key/absolute URL 렌더링을 함께 확인한다.
- 이미지 URL 처리와 fallback 렌더링이 목록/상세/커뮤니티/운동 인증 화면에서 일관적인지 검증한다.
- 커뮤니티 QnA는 본문에 inline `<img>`가 없고 첨부 이미지만 있는 경우도 이미지가 보여야 한다.
- 운동 인증은 파일 선택, 미리보기, invalid file 차단, presigned upload 직전 상태까지만 확인한다.
- 실제 S3 업로드 검증은 별도 승인된 QA 범위가 아니면 제외한다.

### QA-024 QnA Web3 오류 안내

- QnA 답변 등록, 답변 채택 시 지갑 재등록 필요 메시지 또는 이상한 화면 상태가 반복되는지 확인한다.
- 실제 토큰 서명은 하지 않고, `VerifyWallet` 진입 직전과 오류 안내 화면까지만 검증한다.
- 지갑 없음, 복구 필요, 재시도 불가, Web3 recovery 상태에서 사용자가 이해 가능한 안내와 재시도/등록 경로를 받는지 확인한다.

### QA-025 stale wallet/localStorage 상태

- BE 지갑 상태는 `UNLINKED`인데 FE localStorage에 `wallet_address` 또는 `encrypted_wallet`이 남아 재등록 흐름이 막히는지 확인한다.
- 로그인/로그아웃 후 localStorage 지갑 값이 정리되는지 확인한다.
- 같은 mnemonic 또는 같은 local wallet 때문에 재등록이 하드 블록되지 않고, 브라우저 저장 지갑 초기화 후 재등록하는 경로가 필요한지 점검한다.
- 실제 지갑 등록 서명은 제외하고, 화면 상태와 안내 흐름까지만 다룬다.

### QA-026 관리자 Web3 read-only 조회

- 관리자 Web3 화면에서 treasury key list와 nonce monitoring 조회가 가능한지 확인한다.
- 브라우저가 Etherscan을 직접 호출하는 방식이 아니라 BE read API를 통해 조회하는지 확인한다.
- 조회 실패 시 CORS 에러나 빈 화면 대신 unavailable/error 안내가 표시되어야 한다.
- provision, disable, archive, refund, settlement execute 같은 실행성 작업은 누르지 않는다.

### QA-027 QA 계정 준비

- 배포 QA 전에 일반 사용자, 트레이너, 관리자 테스트 계정이 각각 필요하다.
- admin 회원가입 플로우가 없다면 관리자 계정은 seed, DB, 운영자가 제공하는 안전 채널 중 하나로 준비되어야 한다.
- 계정 비밀번호, 토큰, private key, mnemonic은 이 문서나 repo에 저장하지 않는다.
- 계정이 없어서 실행하지 못한 항목은 기능 실패가 아니라 `blocked-test-account`로 기록한다.

## Test Plan

- Vitest 대상:
  - 마켓 목록 요청 파라미터, 검색/카테고리 필터, 상세 뒤로가기 fallback.
  - 이미지 URL 변환, 이미지 fallback, QnA 첨부 이미지 렌더링, 운동 인증 파일 선택/미리보기.
  - QnA 답변/채택 Web3 pre-sign 라우팅과 오류 메시지.
  - stale localStorage 지갑 상태와 로그아웃 cleanup.
  - 관리자 Web3 treasury/nonce read-only 상태.

- Playwright mocked contract 대상:
  - `/market` 목록 로딩.
  - `/market/:id` 직접 진입 뒤로가기 fallback.
  - QnA 답변/채택 pre-sign 진입.
  - `/admin/web3` treasury key list와 nonce monitoring read-only 조회.

- Real BE/DB smoke 대상:
  - 새로 만든 클래스의 detail API가 200인지 확인한다.
  - 같은 `classId`가 paginated market list에 노출되는지 확인한다.
  - 관리자 Web3는 조회 API만 호출한다.
  - 실제 S3 업로드, 온체인 서명, 결제, 환불, 정산 실행은 제외한다.

- 권장 검증 명령:
  - `pnpm exec vitest run ...`
  - `pnpm exec playwright test e2e/qa-api-contract.spec.ts --reporter=list`
  - `pnpm run build`
  - real-BE smoke는 QA 계정과 env가 준비된 경우에만 실행한다.

## Assumptions

- 이번 문서 작성 작업은 계획 MD 파일 생성만 포함한다.
- FE 구현, 테스트 작성, QA 실행은 후속 작업으로 분리한다.
- BE 마켓 목록 API에는 새 public 파라미터를 추가하지 않는 것을 기본값으로 둔다.
- 상세은 열리지만 목록에서 누락되는 클래스가 BE 목록 API에도 없으면 BE 또는 데이터 반영 이슈로 분류한다.
- Web3 관련 실제 서명, 결제, 환불, 정산, 온체인 실행은 명시적으로 제외한다.
- 테스트 계정 정보와 민감 정보는 문서화하지 않는다.
