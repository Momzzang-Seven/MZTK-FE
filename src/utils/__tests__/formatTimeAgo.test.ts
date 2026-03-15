import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo } from '../formatTimeAgo';

describe('formatTimeAgo', () => {
  let mockNow: Date;

  beforeEach(() => {
    mockNow = new Date('2024-01-01T12:00:00');
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1분 미만일 때 "방금 전"을 반환한다', () => {
    const dateString = '2024-01-01T11:59:30';
    expect(formatTimeAgo(dateString)).toBe('방금 전');
  });

  it('정확히 1분 전일 때 "1분 전"을 반환한다', () => {
    const dateString = '2024-01-01T11:59:00';
    expect(formatTimeAgo(dateString)).toBe('1분 전');
  });

  it('30분 전일 때 "30분 전"을 반환한다', () => {
    const dateString = '2024-01-01T11:30:00';
    expect(formatTimeAgo(dateString)).toBe('30분 전');
  });

  it('59분 전일 때 "59분 전"을 반환한다', () => {
    const dateString = '2024-01-01T11:01:00';
    expect(formatTimeAgo(dateString)).toBe('59분 전');
  });

  it('정확히 1시간 전일 때 "1시간 전"을 반환한다', () => {
    const dateString = '2024-01-01T11:00:00';
    expect(formatTimeAgo(dateString)).toBe('1시간 전');
  });

  it('5시간 전일 때 "5시간 전"을 반환한다', () => {
    const dateString = '2024-01-01T07:00:00';
    expect(formatTimeAgo(dateString)).toBe('5시간 전');
  });

  it('23시간 전일 때 "23시간 전"을 반환한다', () => {
    const dateString = '2023-12-31T13:00:00';
    expect(formatTimeAgo(dateString)).toBe('23시간 전');
  });

  it('정확히 1일 전일 때 "1일 전"을 반환한다', () => {
    const dateString = '2023-12-31T12:00:00';
    expect(formatTimeAgo(dateString)).toBe('1일 전');
  });

  it('7일 전일 때 "7일 전"을 반환한다', () => {
    const dateString = '2023-12-25T12:00:00';
    expect(formatTimeAgo(dateString)).toBe('7일 전');
  });

  it('30일 전일 때 "30일 전"을 반환한다', () => {
    const dateString = '2023-12-02T12:00:00';
    expect(formatTimeAgo(dateString)).toBe('30일 전');
  });

  it('ISO 8601 형식의 날짜 문자열을 처리한다', () => {
    const dateString = '2024-01-01T11:30:00.000Z';
    const result = formatTimeAgo(dateString);
    expect(result).toMatch(/^\d+(분|시간|일) 전$|^방금 전$/);
  });
});
