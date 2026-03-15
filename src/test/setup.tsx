import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Lottie 모킹 (JSDOM의 Canvas 미지원 대응)
vi.mock('lottie-react', () => ({
  default: () => <div data-testid="mock-lottie" />,
}));

afterEach(() => {
  cleanup();
});
