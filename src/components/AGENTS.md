# src/components — 재사용 컴포넌트 허브

**Generated:** 2026-03-08

## OVERVIEW

17개 도메인별 하위 폴더로 분리된 재사용 컴포넌트. 각 폴더는 해당 도메인의 UI 파트를 담당.

## STRUCTURE

```
components/
├── admin/              # 관리자 전용 UI
│   ├── board/          #   게시글 관리 (DeleteConfirmModal, PostItem)
│   ├── common/         #   관리자 공통 (AdminSearchBar)
│   ├── Dashboard/      #   대시보드 위젯 (SummaryCard, ReportStatsSection, TokenLogsSection)
│   └── user/           #   유저 관리 (UserTable)
├── auth/               # 인증 (MnemonicDisplay/Form/Verify, PinPad, ProtectedRoute)
├── common/             # 전역 공통 (CommonButton, CommonModal, GlobalSnackbar, PhotoUploader)
├── community/          # 커뮤니티 게시판
│   ├── newPost/        #   글작성 (TitleInput, ContentInput, ImageUploader, TokenSelect, RewardToken)
│   └── postActions/    #   글 액션 (ActionList, ConfirmDelete/Report/Select, EditComment, Share)
├── exercise/           # 운동 인증 (ExerciseAnalyzing, ExerciseHeader)
├── home/               # 홈 화면 (AttendanceBanner, AuthActionButtons, LevelProgress, Voucher 발행/환불)
├── layout/             # 레이아웃 (Layout, AdminLayout, Header, Footer, SimpleHeader, FullScreenPage)
├── leaderboard/        # 리더보드 (LeaderboardItem)
├── location/           # 위치 등록 (LocationHeader, LocationMap, LocationMapOverlay)
├── market/             # 마켓 (detail/MarketTabs)
├── my/                 # 마이페이지 (UserProfile, CurrentTkn, TxTkn, LevelProgress, LevelReward)
├── onboarding/         # 온보딩 (OnboardingAnimation, OnboardingHeader)
├── record/             # 기록 인증 (RecordAnalyzing, RecordHeader)
├── token/              # 토큰 관리 (RestTkn, WithdrawAddr, WithdrawAmt, MyTxMainSection, MyTxPinSection)
├── trainer/            # 트레이너 (TrainerHeader, TrainerStats, TrainerTicketList)
├── verify/             # 위치 인증 (MapView, RangeCircle, VerifyHeader, VerifyStatusOverlay, VerifySuccessOverlay)
└── wallet/             # 지갑 (WalletSuccessSection)
```

## WHERE TO LOOK

| Task                 | Location                                          | Notes                                                     |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| 공통 버튼/모달       | `common/`                                         | CommonButton, CommonModal — 전역 재사용                   |
| 글로벌 알림          | `common/GlobalSnackbar.tsx`                       | userStore.snackbar와 연동                                 |
| 유저 레이아웃 수정   | `layout/Layout.tsx`                               | max-w-450px 모바일 래퍼 포함                              |
| 관리자 레이아웃 수정 | `layout/AdminLayout.tsx`                          | AdminHeader + AdminSidebar 포함                           |
| 게시판 기능          | `community/`                                      | 글 목록, 상세, 작성, 액션 모두 여기                       |
| 바우처 발행/환불     | `home/IssueVoucher.tsx`, `home/RedeemVoucher.tsx` | ethers.js 훅 사용                                         |
| 인증 플로우          | `auth/`                                           | 니모닉 + PIN 입력 + 라우트 보호                           |
| 토큰 출금            | `token/`                                          | WithdrawAddr(주소) → WithdrawAmt(금액) → PinSection(인증) |

## CONVENTIONS

- 각 도메인 폴더에 `index.ts` 있으면 반드시 barrel export 등록
- `__tests__/` 폴더는 해당 컴포넌트 폴더 내에 배치 (co-location)
- 컴포넌트 파일 PascalCase, 150줄 이하 엄수
- 하위 기능 그룹은 서브폴더로 분리 (예: `community/newPost/`, `community/postActions/`)

## ANTI-PATTERNS

- `common/`의 컴포넌트를 도메인 폴더에 중복 구현 금지
- layout 컴포넌트에 비즈니스 로직 삽입 금지
- 도메인 간 직접 import 금지 — 공유 필요 시 `common/`으로 승격

## NOTES

- `admin/` 하위는 PascalCase 폴더명 (`Dashboard/`) — 프로젝트 내 유일한 예외
- `market/`은 현재 `detail/MarketTabs.tsx` 1개만 존재 — 확장 예정
- `my/`에 `__tests__/` 없음 — 테스트 커버리지 갭
- `home/AuthChoiceModal.tsx`는 운동인증/기록인증 선택 모달 — 홈에서만 사용
