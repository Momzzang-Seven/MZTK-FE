import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommonModal } from '../CommonModal';

describe('CommonModal', () => {
  it('제목과 설명이 올바르게 렌더링된다', () => {
    render(
      <CommonModal
        title="테스트 제목"
        desc="테스트 설명"
        confirmLabel="확인"
      />
    );
    
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirmClick이 호출된다', () => {
    const handleConfirm = vi.fn();
    render(
      <CommonModal
        title="확인 모달"
        confirmLabel="확인"
        onConfirmClick={handleConfirm}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: '확인' });
    fireEvent.click(confirmButton);
    
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 시 onCancelClick이 호출된다', () => {
    const handleCancel = vi.fn();
    render(
      <CommonModal
        title="취소 모달"
        confirmLabel="확인"
        cancelLabel="취소"
        onCancelClick={handleCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);
    
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('cancelLabel이 없으면 취소 버튼이 렌더링되지 않는다', () => {
    render(
      <CommonModal
        title="확인만 있는 모달"
        confirmLabel="확인"
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('확인');
  });

  it('confirmLabel이 없으면 확인 버튼이 렌더링되지 않는다', () => {
    render(
      <CommonModal
        title="취소만 있는 모달"
        cancelLabel="취소"
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('취소');
  });

  it('children이 올바르게 렌더링된다', () => {
    render(
      <CommonModal title="커스텀 컨텐츠 모달" confirmLabel="확인">
        <div data-testid="custom-content">커스텀 컨텐츠</div>
      </CommonModal>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('커스텀 컨텐츠')).toBeInTheDocument();
  });

  it('HTML이 포함된 desc가 sanitize되어 렌더링된다', () => {
    render(
      <CommonModal
        title="HTML 테스트"
        desc="<strong>강조된 텍스트</strong>"
        confirmLabel="확인"
      />
    );
    
    const strongElement = screen.getByText('강조된 텍스트');
    expect(strongElement).toBeInTheDocument();
  });

  it('모달 배경이 올바른 스타일을 가진다', () => {
    const { container } = render(
      <CommonModal title="스타일 테스트" confirmLabel="확인" />
    );
    
    const backdrop = container.firstChild as HTMLElement;
    expect(backdrop).toHaveClass('z-[999]', 'fixed', 'inset-0', 'bg-black/38');
  });

  it('모달 컨텐츠 영역이 올바른 스타일을 가진다', () => {
    const { container } = render(
      <CommonModal title="스타일 테스트" confirmLabel="확인" />
    );
    
    const modalContent = container.querySelector('.rounded-\\[12px\\]');
    expect(modalContent).toBeInTheDocument();
    expect(modalContent).toHaveClass('bg-white', 'w-[350px]');
  });
});
