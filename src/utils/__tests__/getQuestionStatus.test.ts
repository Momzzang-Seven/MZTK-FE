import { describe, it, expect } from 'vitest';
import { getQuestionStatus, statusStyleMap } from '../parsePostFields';

describe('getQuestionStatus utils', () => {
  describe('getStatus', () => {
    it('moderationStatus가 BLOCKED이면 "blocked"를 반환한다', () => {
      expect(getQuestionStatus('VISIBLE', 'BLOCKED', false, 0)).toBe('blocked');
      expect(getQuestionStatus('VISIBLE', 'BLOCKED', true, 5)).toBe('blocked');
    });

    it('publicationStatus가 PENDING이면 "pending"을 반환한다', () => {
      expect(getQuestionStatus('PENDING', 'NORMAL', false, 0)).toBe('pending');
      expect(getQuestionStatus('PENDING', 'NORMAL', true, 5)).toBe('pending');
    });

    it('publicationStatus가 FAILED이면 "failed"를 반환한다', () => {
      expect(getQuestionStatus('FAILED', 'NORMAL', false, 0)).toBe('failed');
      expect(getQuestionStatus('FAILED', 'NORMAL', true, 5)).toBe('failed');
    });

    it('publicationStatus가 VISIBLE이고 isSolved가 true이면 "completed"를 반환한다', () => {
      expect(getQuestionStatus('VISIBLE', 'NORMAL', true, 0)).toBe('completed');
      expect(getQuestionStatus('VISIBLE', 'NORMAL', true, 5)).toBe('completed');
    });

    it('publicationStatus가 VISIBLE이고 isSolved가 false이고 commentCount가 0이면 "waiting"을 반환한다', () => {
      expect(getQuestionStatus('VISIBLE', 'NORMAL', false, 0)).toBe('waiting');
    });

    it('publicationStatus가 VISIBLE이고 isSolved가 false이고 commentCount가 1 이상이면 "answering"을 반환한다', () => {
      expect(getQuestionStatus('VISIBLE', 'NORMAL', false, 1)).toBe('answering');
      expect(getQuestionStatus('VISIBLE', 'NORMAL', false, 5)).toBe('answering');
      expect(getQuestionStatus('VISIBLE', 'NORMAL', false, 100)).toBe('answering');
    });

    it('모든 가능한 상태를 반환한다', () => {
      const statuses = [
        getQuestionStatus('VISIBLE', 'BLOCKED', false, 0),
        getQuestionStatus('PENDING', 'NORMAL', false, 0),
        getQuestionStatus('FAILED', 'NORMAL', false, 0),
        getQuestionStatus('VISIBLE', 'NORMAL', true, 0),
        getQuestionStatus('VISIBLE', 'NORMAL', false, 0),
        getQuestionStatus('VISIBLE', 'NORMAL', false, 1),
      ];

      expect(statuses).toContain('blocked');
      expect(statuses).toContain('pending');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('waiting');
      expect(statuses).toContain('answering');
    });
  });

  describe('statusStyleMap', () => {
    it('waiting 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.waiting).toEqual({
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

    it('pending 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.pending).toEqual({
        label: '처리 중',
        bg: 'bg-[#9CA3AF]',
      });
    });

    it('failed 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.failed).toEqual({
        label: '실패',
        bg: 'bg-[#EF4444]',
      });
    });

    it('blocked 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.blocked).toEqual({
        label: '차단됨',
        bg: 'bg-[#1F2937]',
      });
    });

    it('unknown 상태의 스타일을 정의한다', () => {
      expect(statusStyleMap.unknown).toEqual({
        label: '상태 확인중',
        bg: 'bg-[#E5E7EB]',
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

    it('7개의 상태를 정의한다', () => {
      expect(Object.keys(statusStyleMap)).toHaveLength(7);
    });
  });
});
