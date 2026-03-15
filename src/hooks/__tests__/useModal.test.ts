import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';

describe('useModal', () => {
  it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.modalData.type).toBe(null);
    expect(result.current.modalData.targetId).toBe(null);
    expect(result.current.modalData.subTargetId).toBe(null);
  });

  it('openModal 호출 시 모달이 열린다', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('confirm', 123);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.modalData.type).toBe('confirm');
    expect(result.current.modalData.targetId).toBe(123);
  });

  it('openModal에 subTargetId를 전달할 수 있다', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('edit', 100, 200);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.modalData.type).toBe('edit');
    expect(result.current.modalData.targetId).toBe(100);
    expect(result.current.modalData.subTargetId).toBe(200);
  });

  it('openModal에 extraData를 전달할 수 있다', () => {
    interface ExtraData {
      title: string;
      description: string;
    }

    const { result } = renderHook(() => useModal<string, ExtraData>());

    const extraData: ExtraData = {
      title: '테스트 제목',
      description: '테스트 설명',
    };

    act(() => {
      result.current.openModal('custom', 1, undefined, extraData);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.modalData.extraData).toEqual(extraData);
  });

  it('closeModal 호출 시 모달이 닫히고 데이터가 초기화된다', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('delete', 456, 789);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.modalData.type).toBe(null);
    expect(result.current.modalData.targetId).toBe(null);
    expect(result.current.modalData.subTargetId).toBe(null);
    expect(result.current.modalData.extraData).toBe(undefined);
  });

  it('여러 번 openModal을 호출해도 정상 동작한다', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('first', 1);
    });

    expect(result.current.modalData.type).toBe('first');
    expect(result.current.modalData.targetId).toBe(1);

    act(() => {
      result.current.openModal('second', 2);
    });

    expect(result.current.modalData.type).toBe('second');
    expect(result.current.modalData.targetId).toBe(2);
  });

  it('제네릭 타입을 사용하여 다양한 타입의 모달을 지원한다', () => {
    type ModalType = 'confirm' | 'alert' | 'prompt';
    const { result } = renderHook(() => useModal<ModalType>());

    act(() => {
      result.current.openModal('confirm', 1);
    });

    expect(result.current.modalData.type).toBe('confirm');

    act(() => {
      result.current.openModal('alert', 2);
    });

    expect(result.current.modalData.type).toBe('alert');
  });

  it('subTargetId 없이 openModal을 호출하면 null로 설정된다', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('test', 100);
    });

    expect(result.current.modalData.subTargetId).toBe(null);
  });
});
