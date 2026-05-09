# AGENTS.md — MZTK_FE 에이전트 지침서

> **최종 업데이트:** 2026-05-09

---

## OVERVIEW

운동 인증 기반 토큰 보상 플랫폼 프론트엔드. 모바일 퍼스트 SPA.
백엔드 API(`localhost:8080`) + 블록체인(ethers.js) 이중 통신 구조.

---

## CODING STYLE

### 컴포넌트 작성

- **함수형 컴포넌트** + Hooks 패턴만 사용
- 컴포넌트 **150줄 이하** 유지 → 초과 시 커스텀 훅 또는 하위 컴포넌트로 분리
- **순수 함수** 선호
- **인라인 스타일 남용 금지** → TailwindCSS 클래스 사용

### TypeScript

- `strict: true` 모드 준수
- `verbatimModuleSyntax: true` → 타입 임포트 시 반드시 `import type` 사용
- `erasableSyntaxOnly: true`
- `as any`, `@ts-ignore` **사용 금지**

### Import

- **Path alias 사용 필수** (`@components`, `@hooks`, `@store`, `@utils` 등)
- 상대 경로 `../../../` **금지**

### 주석

- **why만 설명**, what은 설명 금지
- ❌ `// count를 1 증가`
- ✅ `// 최신 입력 반영을 위해 re-render 트리거`

### 포매팅 (Prettier)

- 세미콜론 O, 쌍따옴표, 탭 2칸, trailing comma es5, 80자
- VSCode 저장 시 자동 포맷 (`.vscode/settings.json`)

---

## FILE STRUCTURE

```
src/
├── abi/           # 스마트 컨트랙트 ABI (MZTK.ts, Voucher.ts)
├── assets/        # SVG, Lottie JSON
├── components/    # 재사용 컴포넌트 (17개 도메인별 하위 폴더)
├── constant/      # 상수 (단수형 폴더명 — 프로젝트 컨벤션, `constants`로 변경 금지)
├── hooks/         # 커스텀 훅
├── mocks/         # 테스트용 mock 데이터
├── pages/         # 라우트별 페이지 컴포넌트
├── services/      # Axios 클라이언트 + API 서비스
├── store/         # Zustand 스토어 (user, location, auth, admin)
├── test/          # Vitest 설정 (setup.tsx, vitest.d.ts)
├── types/         # TypeScript 타입 정의
└── utils/         # 유틸리티 함수
```

### Barrel Export 패턴

모든 주요 디렉토리에 `index.ts` 존재 → re-export 수행.
**새 파일 추가 시 반드시 해당 `index.ts`에 등록.**

---

## CONVENTION

### 네이밍

| 대상                | 규칙                   | 예시                                     |
| ------------------- | ---------------------- | ---------------------------------------- |
| 폴더                | lowercase              | `home`, `trainer`                        |
| React 컴포넌트 파일 | PascalCase             | `Header.tsx`, `TrainerStats.tsx`         |
| 유틸/헬퍼 파일      | camelCase              | `formatTimeAgo.ts`, `connectMetamask.ts` |
| 타입 파일           | PascalCase             | `Home.ts`, `My.ts`                       |
| Zustand 스토어      | camelCase              | `userStore.ts`, `authModal.ts`           |
| 커스텀 훅           | camelCase `use` 접두사 | `useVoucher.ts`, `useModal.ts`           |

### Anti-Patterns (금지 사항)

- `as any`, `@ts-ignore` 사용 금지 — strict mode 위반
- 상대경로 `../../..` 사용 금지 — path alias 사용
- 컴포넌트 150줄 초과 금지 — 분리 필수
- `index.ts` barrel 미등록 금지 — 새 파일 추가 시 반드시 등록
- what 주석 금지
- 인라인 스타일 남용 금지 — TailwindCSS 클래스 사용
- `constant` 폴더명 단수형 유지 (`constants`로 변경 금지)

---

## CONTEXT

### 코드 수정 시 반드시 확인할 파일

| 작업                | 확인 위치                                       | 비고                                       |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| 라우팅 추가/수정    | `src/App.tsx`                                   | 모든 Routes 중앙 정의, admin/user 분리     |
| 페이지 추가         | `src/pages/` + `src/pages/index.ts`             | 반드시 barrel export 등록                  |
| 공통 UI 변경        | `src/components/common/`                        | CommonButton, CommonModal, GlobalSnackbar  |
| 레이아웃 변경       | `src/components/layout/`                        | Layout(유저) / AdminLayout(관리자) 분리    |
| API 호출 추가       | `src/services/client.ts`                        | `api`, `authApi`, `walletApi` 3개 인스턴스 |
| 상태 추가/변경      | `src/store/`                                    | Zustand persist, `@store` alias            |
| 블록체인 연동       | `src/hooks/useVoucher.ts`, `useTokenBalance.ts` | ethers.js 직접 호출                        |
| 스마트 컨트랙트 ABI | `src/abi/`                                      | MZTK.ts, Voucher.ts                        |
| 글로벌 스타일/테마  | `src/index.css`                                 | TailwindCSS 4 `@theme` 토큰                |
| Path alias 설정     | `vite.config.ts` + `tsconfig.app.json`          | 13개 alias 동기화 필수                     |
| 환경 변수 추가      | `.env.example`                                  | `VITE_` 접두사 필수                        |
| 테스트 작성         | `src/*/__tests__/*.test.tsx`                    | 각 모듈 내 `__tests__/` 디렉토리           |

### 스토어 구성

| 스토어              | 파일                     | 설명                                             |
| ------------------- | ------------------------ | ------------------------------------------------ |
| `useUserStore`      | `store/userStore.ts`     | 인증, 유저 정보, XP/레벨, 출석 시스템, 분석 상태 |
| `useAuthModalStore` | `store/authModal.ts`     | 401 인증 모달 제어                               |
| `locationStore`     | `store/locationStore.ts` | 위치 상태                                        |
| `adminStore`        | `store/adminStore.ts`    | 관리자 대시보드 (현재 mock 데이터 기반)          |

### API 인스턴스

| 인스턴스    | Base URL                 | 용도        |
| ----------- | ------------------------ | ----------- |
| `api`       | `VITE_API_BASE_URL`      | 범용 API    |
| `authApi`   | `{BASE}/auth`            | 인증/로그인 |
| `walletApi` | `{BASE}/api/auth/wallet` | 지갑 연동   |

- **Request Interceptor**: `userStore`에서 `accessToken` 자동 주입 (`Bearer`)
- **Response Interceptor**: 401 → `authModal` 표시, 404 → `/404` 리디렉트

### 프로젝트 고유 패턴

- **게이미피케이션 시스템**: XP, 레벨, 연속 출석(7일 보너스), 운동 인증 보상이 `userStore`에 내장
- **분석 타이머**: `startAnalysis()` → 5초 후 `checkAnalysisCompletion()` 자동 완료 (1초 인터벌 폴링)
- **이중 인증**: 소셜 로그인(Kakao/Google) + 블록체인 지갑(MetaMask) 서명
- **관리자 분리**: `/admin` prefix, 별도 `AdminLayout`, 별도 `adminStore`
- **모바일 전용**: 유저 라우트 `max-w-[450px]` 강제
- **Vite proxy**: 개발환경에서 `/auth`, `/users`, `/api` → `localhost:8080` 프록시

---

## DESIGN SYSTEM: LUXURY MINIMALIST

### Core Philosophy

"불필요한 요소를 덜어내고, 공백과 그림자를 통해 깊이감을 부여하는 프리미엄 미니멀리즘"

### Visual Elements

- **Immersive Header**: 스크롤 시 유리 질감(`backdrop-blur-xl`)으로 변하며, 배경과 경계가 모호한 상단 디자인.
- **Glass-morphism**: 반투명 배경(`bg-white/90`), 미세한 테두리(`border-white/50`), 강력한 블러 효과.
- **Premium Shadow**: 단순한 `shadow-md` 대신 중첩된 그림자(`shadow-[0_20px_50px_rgba(0,0,0,0.04)]`) 사용.
- **Typography**: `font-black` (900)을 사용하여 정보 계층을 극명하게 구분.

### Component Rules

- **Header**: `RegisterHeader`, `CommonHeader` 등 몰입형 헤더 필수 사용.
- **Buttons**: `active:scale-95 transition-all`을 통한 즉각적인 피드백.
- **Radius**: 과감한 라운드 처리 (`rounded-[32px]`, `rounded-full`).
- **Icons**: `lucide-react`를 사용하되, `strokeWidth={3}` 또는 그라데이션 배경과 조합.

### Motion UX

- `animate-in fade-in slide-in-from-bottom-4 duration-700` 패턴을 모든 페이지 진입 시 적용.
- 상태 변화 시 `transition-all duration-500`을 통해 부드러운 전환 보장.
