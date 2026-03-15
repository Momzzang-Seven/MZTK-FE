import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestTkn } from '../RestTkn';

describe('RestTkn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('잔액이 표시된다', () => {
    render(<RestTkn amt={1000} />);
    
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('toLocaleString 포맷팅이 적용된다', () => {
    render(<RestTkn amt={1234567} />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('"사용 가능한 잔액" 텍스트가 표시된다', () => {
    render(<RestTkn amt={1000} />);
    
    expect(screen.getByText('사용 가능한 잔액')).toBeInTheDocument();
  });

  it('"MZT" 단위가 표시된다', () => {
    render(<RestTkn amt={1000} />);
    
    expect(screen.getByText('MZT')).toBeInTheDocument();
  });

  it('토큰 아이콘이 렌더링된다', () => {
    render(<RestTkn amt={1000} />);
    
    const icon = screen.getByAltText('MZT Token');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/icon/token.svg');
  });

  it('새로고침 버튼이 렌더링된다', () => {
    render(<RestTkn amt={1000} />);
    
    const refreshButton = screen.getByRole('button', { name: /새로고침/ });
    expect(refreshButton).toBeInTheDocument();
  });

  it('새로고침 버튼 클릭 시 onRefresh가 호출된다', () => {
    const mockOnRefresh = vi.fn();
    render(<RestTkn amt={1000} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByRole('button', { name: /새로고침/ });
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('onRefresh가 없을 때 alert가 표시된다', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<RestTkn amt={1000} />);
    
    const refreshButton = screen.getByRole('button', { name: /새로고침/ });
    fireEvent.click(refreshButton);
    
    expect(alertSpy).toHaveBeenCalledWith('잔액이 새로고침 되었습니다.');
    alertSpy.mockRestore();
  });

  it('새로고침 시 애니메이션이 적용된다', async () => {
    const { act } = await import('@testing-library/react');
    render(<RestTkn amt={1000} />);
    
    const refreshButton = screen.getByRole('button', { name: /새로고침/ });
    const refreshIcon = screen.getByAltText('refresh');
    
    expect(refreshIcon).not.toHaveClass('animate-spin');
    
    fireEvent.click(refreshButton);
    
    expect(refreshIcon).toHaveClass('animate-spin');
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(refreshIcon).not.toHaveClass('animate-spin');
  });
});
