# SKILLS.md — MZTK_FE 기술 스택 명세

> **최종 업데이트:** 2026-03-16

---

## Core

| 기술                 | 버전 | 역할                                                                      |
| -------------------- | ---- | ------------------------------------------------------------------------- |
| **React**            | 19.2 | 함수형 컴포넌트 + Hooks 기반 UI 라이브러리                                |
| **React DOM**        | 19.2 | 브라우저 렌더링                                                           |
| **TypeScript**       | 5.9  | 정적 타입 시스템 (`strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| **Vite**             | 7.2  | 번들러 & 개발 서버 (SWC 기반 `@vitejs/plugin-react-swc`)                  |
| **React Router DOM** | 7.9  | SPA 클라이언트 라우팅                                                     |
| **pnpm**             | —    | 패키지 매니저 (`pnpm-lock.yaml`)                                          |

---

## Styling

| 기술            | 버전 | 역할                                                    |
| --------------- | ---- | ------------------------------------------------------- |
| **TailwindCSS** | 4.1  | 유틸리티 퍼스트 CSS (`@tailwindcss/vite` 플러그인 통합) |

### 폰트

- **Pretendard Variable** — 본문 폰트 (CDN)
- **GMarketSans Bold** — 강조 폰트 (CDN)

### 디자인 토큰 (`src/index.css` `@theme`)

| 토큰                | 값        |
| ------------------- | --------- |
| `--color-main`      | `#fab12f` |
| `--color-sub`       | `#ffcc00` |
| `--color-grey-main` | `#a09cab` |
| `--color-grey-pale` | `#f9fafb` |
| `--color-grey-deep` | `#4b5563` |

### 타이포그래피 유틸리티

`.title` (18px/700) · `.label-bold` (16px/700) · `.label` (16px/400) · `.body-bold` (14px/700) · `.body` (14px/400) · `.caption` (12px/400)

---

## State Management

| 기술        | 버전 | 역할                                                        |
| ----------- | ---- | ----------------------------------------------------------- |
| **Zustand** | 5.0  | 글로벌 상태 관리 (`persist` 미들웨어 → localStorage 영속화) |

---

## Data Fetching & API

| 기술      | 버전 | 역할                                                     |
| --------- | ---- | -------------------------------------------------------- |
| **Axios** | 1.13 | HTTP 클라이언트 (interceptors로 토큰 주입 / 에러 핸들링) |

---

## Blockchain / Web3

| 기술          | 버전 | 역할                                     |
| ------------- | ---- | ---------------------------------------- |
| **ethers.js** | 6.15 | EVM 스마트 컨트랙트 통신 · MetaMask 연동 |

---

## Charts & Visualization

| 기술                          | 버전 | 역할                  |
| ----------------------------- | ---- | --------------------- |
| **Chart.js**                  | 4.5  | 차트 렌더링 엔진      |
| **react-chartjs-2**           | 5.3  | Chart.js React 바인딩 |
| **chartjs-plugin-datalabels** | 2.2  | 데이터 라벨 플러그인  |

---

## Maps & Location

| 기술                          | 버전 | 역할                       |
| ----------------------------- | ---- | -------------------------- |
| **@vis.gl/react-google-maps** | 1.7  | Google Maps React 컴포넌트 |
| **react-daum-postcode**       | 4.0  | 다음 우편번호 검색         |

---

## Animation & Media

| 기술             | 버전 | 역할                          |
| ---------------- | ---- | ----------------------------- |
| **lottie-react** | 2.4  | Lottie JSON 애니메이션 렌더링 |

---

## Security

| 기술          | 버전 | 역할                       |
| ------------- | ---- | -------------------------- |
| **DOMPurify** | 3.3  | HTML 새니타이징 (XSS 방지) |

---

## Testing / Linting

| 기술                          | 버전 | 역할                                                                 |
| ----------------------------- | ---- | -------------------------------------------------------------------- |
| **Vitest**                    | 4.0  | 테스트 러너 (Vite 네이티브 통합, `globals: true`, `jsdom`)           |
| **@testing-library/react**    | 16.3 | React 컴포넌트 테스트 유틸리티                                       |
| **@testing-library/jest-dom** | 6.9  | DOM 매처 확장                                                        |
| **jsdom**                     | 28.1 | 브라우저 환경 시뮬레이션                                             |
| **ESLint**                    | 9.39 | Flat Config, TS recommended, React hooks/refresh                     |
| **Prettier**                  | 3.7  | 코드 포매터 (`semi`, `doubleQuote`, `tabWidth: 2`, `printWidth: 80`) |

---

## Infrastructure

| 영역            | 기술                       | 설정                                              |
| --------------- | -------------------------- | ------------------------------------------------- |
| **번들러**      | Vite 7.2                   | SWC 플러그인, HMR, dev port 3000                  |
| **배포**        | Vercel                     | `vercel.json` SPA rewrite (`/(.*) → /index.html`) |
| **개발 프록시** | Vite `server.proxy`        | `/auth`, `/users`, `/api` → `localhost:8080`      |
| **인증**        | Kakao OAuth · Google OAuth | 소셜 로그인 + MetaMask 지갑 이중 인증             |

---

## Environment Variables

모든 변수는 `VITE_` 접두사 필수. `.env.example` 참조.

| 변수                        | 용도                       |
| --------------------------- | -------------------------- |
| `VITE_API_BASE_URL`         | 백엔드 API URL             |
| `VITE_TOKEN_ADDRESS`        | MZTK 토큰 컨트랙트 주소    |
| `VITE_VOUCHER_ADDRESS`      | 바우처 컨트랙트 주소       |
| `VITE_RPC_URL`              | 블록체인 RPC 엔드포인트    |
| `VITE_CHAIN_ID`             | 체인 ID                    |
| `VITE_ADMIN_ADDRESS`        | 관리자 지갑 주소           |
| `VITE_ETHERSCAN_API_KEY`    | Etherscan API 키           |
| `VITE_ETHERSCAN_API_URL`    | Etherscan API URL          |
| `VITE_GOOGLE_CLIENT_ID`     | Google OAuth 클라이언트 ID |
| `VITE_GOOGLE_CLIENT_SECRET` | Google OAuth 시크릿        |
| `VITE_KAKAO_NATIVE_APP_KEY` | Kakao 네이티브 앱 키       |
| `VITE_KAKAO_CLIENT_ID`      | Kakao 클라이언트 ID        |
| `VITE_KAKAO_JS_KEY`         | Kakao JS 키                |
| `VITE_GOOGLE_MAP_API`       | Google Maps API 키         |
| `VITE_GOOGLE_MAP_ID`        | Google Maps 맵 ID          |

---

## Scripts

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (port 3000)
pnpm build            # tsc -b && vite build
pnpm lint             # ESLint 실행
pnpm preview          # 빌드 결과 미리보기
pnpm test             # Vitest 실행
pnpm test:ui          # Vitest UI 모드
pnpm test:coverage    # Vitest 커버리지
```
