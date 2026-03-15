import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletSuccessSection } from '../WalletSuccessSection';

vi.mock('lottie-react', () => ({
  default: ({ className }: { className?: string }) => (
    <div className={className} data-testid="lottie-animation">Lottie Animation</div>
  ),
}));

vi.mock('@components/common', () => ({
  CommonButton: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
}));

describe('WalletSuccessSection', () => {
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
  });

  it('기본 title이 렌더링된다', () => {
    render(<WalletSuccessSection onConfirm={mockOnConfirm} />);
    
    expect(screen.getByText(/모든 설정이/)).toBeInTheDocument();
    expect(screen.getByText(/완료되었습니다!/)).toBeInTheDocument();
  });

  it('커스텀 title prop이 표시된다', () => {
    render(
      <WalletSuccessSection
        title="지갑 생성 완료!"
        onConfirm={mockOnConfirm}
      />
    );
    
    expect(screen.getByText('지갑 생성 완료!')).toBeInTheDocument();
  });

  it('description prop이 표시된다', () => {
    render(
      <WalletSuccessSection
        description="이제 토큰을 받을 수 있습니다."
        onConfirm={mockOnConfirm}
      />
    );
    
    expect(screen.getByText('이제 토큰을 받을 수 있습니다.')).toBeInTheDocument();
  });

  it('description이 없을 때 렌더링되지 않는다', () => {
    render(<WalletSuccessSection onConfirm={mockOnConfirm} />);
    
    const description = screen.queryByText(/이제 토큰을/);
    expect(description).not.toBeInTheDocument();
  });

  it('children이 렌더링된다', () => {
    render(
      <WalletSuccessSection onConfirm={mockOnConfirm}>
        <div>추가 정보</div>
      </WalletSuccessSection>
    );
    
    expect(screen.getByText('추가 정보')).toBeInTheDocument();
  });

  it('Lottie 애니메이션이 렌더링된다', () => {
    render(<WalletSuccessSection onConfirm={mockOnConfirm} />);
    
    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });

  it('기본 버튼 라벨이 표시된다', () => {
    render(<WalletSuccessSection onConfirm={mockOnConfirm} />);
    
    expect(screen.getByRole('button', { name: '모두 이해했어요' })).toBeInTheDocument();
  });

  it('커스텀 buttonLabel prop이 표시된다', () => {
    render(
      <WalletSuccessSection
        buttonLabel="다음으로"
        onConfirm={mockOnConfirm}
      />
    );
    
    expect(screen.getByRole('button', { name: '다음으로' })).toBeInTheDocument();
  });

  it('버튼 클릭 시 onConfirm이 호출된다', () => {
    render(<WalletSuccessSection onConfirm={mockOnConfirm} />);
    
    const button = screen.getByRole('button', { name: '모두 이해했어요' });
    fireEvent.click(button);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
