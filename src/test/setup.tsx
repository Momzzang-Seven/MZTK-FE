import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from '@mocks/server';

expect.extend(matchers);

// 환경 변수 모킹 (API Base URL을 빈 문자열로 고정하여 프록시/MSW 매칭 보장)
vi.stubEnv('VITE_API_BASE_URL', '');

// Lottie 모킹 (JSDOM의 Canvas 미지원 대응)
vi.mock('lottie-react', () => ({
  default: () => <div data-testid="mock-lottie" />,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
