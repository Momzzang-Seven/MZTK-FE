import { describe, it, expect } from 'vitest';
import { getStatus, statusStyleMap } from '../getQuestionStatus';

describe('getQuestionStatus utils', () => {
  describe('getStatus', () => {
    it('isSolved가 true이면 "completed"를 반환한다', () => {
      expect(getStatus(true, 0)).toBe('completed');
      expect(getStatus(true, 5)).toBe('completed');
      expect(getStatus(true, 10)).toBe('completed');
    });

    it('isSolved가 false이고 answers가 0이면 "wating"을 반환한다', () => {
      expect(getStatus(false, 0)).toBe('wating');
    });

    it('isSolved가 false이고 answers가 1 이상이면 "answering"을 반환한다', () => {
      expect(getStatus(false, 1)).toBe('answering');
      expect(getStatus(false, 5)).toBe('answering');
      expect(getStatus(false, 100)).toBe('answering');
    });

    it('모든 가능한 상태를 반환한다', () => {
      const statuses = [
        getStatus(true, 0),
        getStatus(false, 0),
        getStatus(false, 1),
      ];
      
      expect(statuses).toContain('completed');
      expect(statuses).toContain('wating');
      expect(statuses).toContain('answering');
    });
  });

  describe('statusStyleMap', () => {
    it('wating 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.wating).toEqual({
        label: '답변대기',
        bg: 'bg-[#F59E0B]',
      });
    });

    it('answering 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.answering).toEqual({
        label: '답변중',
        bg: 'bg-[#9CA3AF]',
      });
    });

    it('completed 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.completed).toEqual({
        label: '채택완료',
        bg: 'bg-[#27DDA1]',
      });
    });

    it('모든 상태에 label과 bg 속성이 있다', () => {
      Object.values(statusStyleMap).forEach((style) => {
        expect(style).toHaveProperty('label');
        expect(style).toHaveProperty('bg');
        expect(typeof style.label).toBe('string');
        expect(typeof style.bg).toBe('string');
      });
    });

    it('3개의 상태를 정의한다', () => {
      expect(Object.keys(statusStyleMap)).toHaveLength(3);
    });
  });
});
