import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from '@mocks/server';

expect.extend(matchers);

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

