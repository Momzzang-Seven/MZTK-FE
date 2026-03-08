# MZTK_FE — 몸짱토큰 프론트엔드

**Generated:** 2026-03-08

## OVERVIEW

운동 인증 기반 토큰 보상 플랫폼 프론트엔드. React 19 + Vite 7 + TypeScript 5.9 + TailwindCSS 4 SPA.
모바일 퍼스트(max-w-450px), Vercel 배포, 백엔드 API(8080) + 블록체인(ethers.js) 이중 통신.

## STRUCTURE

```
./
├── src/
│   ├── abi/           # 스마트 컨트랙트 ABI (MZTK, Voucher)
│   ├── assets/        # SVG, Lottie JSON
│   ├── components/    # 재사용 컴포넌트 (17개 도메인별 하위 폴더) → 별도 AGENTS.md
│   ├── constant/      # 상수 (단수형 네이밍 — 프로젝트 컨벤션)
│   ├── hooks/         # 커스텀 훅 (토큰, 바우처, 무한스크롤 등)
│   ├── mocks/         # 테스트용 mock 데이터
│   ├── pages/         # 라우트별 페이지 컴포넌트
│   ├── services/      # Axios 클라이언트 + API 서비스
│   ├── store/         # Zustand 스토어 (user, location, auth, admin)
│   ├── test/          # Vitest 설정 (setup.tsx, vitest.d.ts)
│   ├── types/         # TypeScript 타입 정의
│   └── utils/         # 유틸리티 (MetaMask, 시간, 지리, 차트)
├── index.html         # SPA 엔트리
├── vite.config.ts     # Vite + Vitest + path alias + proxy
└── vercel.json        # SPA 라우팅 rewrite
```

## WHERE TO LOOK

| Task                | Location                                                  | Notes                                          |
| ------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| 라우팅 추가/수정    | `src/App.tsx`                                             | 모든 Routes 중앙 정의 (163줄), admin/user 분리 |
| 페이지 추가         | `src/pages/` + `src/pages/index.ts`                       | 반드시 index.ts barrel export에 등록           |
| 공통 UI             | `src/components/common/`                                  | CommonButton, CommonModal, GlobalSnackbar      |
| 레이아웃            | `src/components/layout/`                                  | Layout(유저), AdminLayout(관리자) 분리         |
| API 호출            | `src/services/client.ts`                                  | api, authApi, walletApi 3개 인스턴스           |
| 상태 관리           | `src/store/`                                              | Zustand persist, `@store` alias                |
| 블록체인 연동       | `src/hooks/useVoucher.ts`, `src/hooks/useTokenBalance.ts` | ethers.js 직접 호출                            |
| 스마트 컨트랙트 ABI | `src/abi/`                                                | MZTK.ts, Voucher.ts                            |
| 환경 변수           | `.env.example`                                            | `VITE_` 접두사 필수                            |
| 테스트              | `src/*/__tests__/*.test.tsx`                              | 각 모듈 내 `__tests__/` 디렉토리               |
| 글로벌 스타일/테마  | `src/index.css`                                           | TailwindCSS 4 `:root` 변수                     |
| path alias 설정     | `vite.config.ts` + `tsconfig.app.json`                    | 13개 alias (@, @pages, @components 등)         |

## CONVENTIONS

### 네이밍

| 대상                | 규칙                   | 예시                                     |
| ------------------- | ---------------------- | ---------------------------------------- |
| 폴더                | lowercase              | `home`, `trainer`                        |
| React 컴포넌트 파일 | PascalCase             | `Header.tsx`, `TrainerStats.tsx`         |
| 유틸/헬퍼 파일      | camelCase              | `formatTimeAgo.ts`, `connectMetamask.ts` |
| 타입 파일           | PascalCase             | `Home.ts`, `My.ts`                       |
| Zustand 스토어      | camelCase              | `userStore.ts`, `authModal.ts`           |
| 커스텀 훅           | camelCase `use` 접두사 | `useVoucher.ts`, `useModal.ts`           |

### Barrel Export 패턴

모든 주요 디렉토리에 `index.ts` 존재 → re-export 수행. 새 파일 추가 시 반드시 해당 `index.ts`에 등록.

### Import

- Path alias 사용 필수 (`@components`, `@hooks`, `@store` 등)
- 상대 경로 `../../../` 금지

### 코드 스타일

- Prettier: 세미콜론 O, 쌍따옴표, 탭 2칸, trailing comma es5, 80자
- ESLint: flat config, TypeScript recommended, React hooks recommended
- VSCode 저장 시 자동 포맷 (.vscode/settings.json)
- 컴포넌트 150줄 이하 유지 → 초과 시 hooks/하위 컴포넌트로 분리
- 주석: why만 설명, what은 설명 금지
- 순수 함수 선호

### TypeScript

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- `verbatimModuleSyntax: true` → `import type` 필수
- `erasableSyntaxOnly: true`

## ARCHITECTURE DECISIONS

| 영역           | 선택                              | 이유                                  |
| -------------- | --------------------------------- | ------------------------------------- |
| 상태 관리      | Zustand + persist                 | 경량, TS 친화적, localStorage 영속화  |
| API 클라이언트 | Axios + interceptors              | 토큰 자동 주입, 401/404 전역 처리     |
| 데이터 페칭    | Custom hooks (React Query 미사용) | 프로젝트 규모 대비 적절               |
| 블록체인       | ethers.js 6 직접 호출             | EVM 컨트랙트 직접 통신                |
| 라우팅         | React Router 7, App.tsx 중앙 정의 | 관리자/유저 라우트 완전 분리          |
| 스타일링       | TailwindCSS 4                     | 유틸리티 퍼스트, index.css :root 테마 |
| 테스트         | Vitest + Testing Library + jsdom  | Vite 통합, vite.config.ts 내 설정     |
| 배포           | Vercel                            | SPA rewrite, 프록시 불필요            |

## ANTI-PATTERNS (THIS PROJECT)

- `as any`, `@ts-ignore` 사용 금지 — strict mode 위반
- 상대경로 `../../..` 사용 금지 — path alias 사용
- 컴포넌트 150줄 초과 금지 — 분리 필수
- index.ts barrel 미등록 금지 — 새 파일 추가 시 반드시 등록
- what 주석 금지 (`// count를 1 증가` ❌, `// 최신 입력 반영을 위해 re-render 트리거` ✅)
- 인라인 스타일 남용 금지 — TailwindCSS 클래스 사용
- `constant` 폴더명은 단수형 유지 (프로젝트 컨벤션, `constants`로 변경 금지)

## UNIQUE STYLES

- **게이미피케이션 시스템**: XP, 레벨, 연속 출석(7일 보너스), 운동 인증 보상이 `userStore`에 내장
- **분석 타이머**: `startAnalysis()` → 5초 후 `checkAnalysisCompletion()` 자동 완료 (1초 인터벌 폴링)
- **이중 인증**: 소셜 로그인(Kakao/Google) + 블록체인 지갑(MetaMask) 서명
- **관리자 분리**: `/admin` prefix, 별도 `AdminLayout`, 별도 `adminStore`
- **모바일 전용**: 유저 라우트 `max-w-[450px]` 강제
- **Vite proxy**: 개발환경에서 `/auth`, `/users`, `/api` → `localhost:8080` 프록시

## COMMANDS

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (port 3000)
pnpm build            # tsc -b && vite build
pnpm test             # vitest
pnpm test:ui          # vitest --ui
pnpm test:coverage    # vitest --coverage
pnpm lint             # eslint .
pnpm preview          # vite preview (빌드 결과 미리보기)
```

## NOTES

- 백엔드: `127.0.0.1:8080` (Spring Boot 추정), 프록시 경유
- `.env.example` 참고하여 `.env` 설정 필수 (VITE_API_BASE_URL, VITE_CLIENT_ID, VITE_CONTRACT_ADDRESS 등)
- `src/store/adminStore.ts`는 현재 mock 데이터 기반 — 실제 API 연동 미완
- `src/pages/trainer/`, `src/pages/market/`에 TODO 4건 — 서버 API 연동 대기 중
- CI/CD 미설정 — GitHub Actions 워크플로우 부재
- `@interface` alias가 vite.config에 정의되어 있으나 실제 `src/interface/` 디렉토리 부재 (orphan alias)
- `@context` alias도 마찬가지 — `src/context/` 디렉토리 부재
