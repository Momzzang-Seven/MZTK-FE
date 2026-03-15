import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WithdrawAmt } from '../WithdrawAmt';

describe('WithdrawAmt', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('입력 필드가 렌더링된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0');
    expect(input).toBeInTheDocument();
  });

  it('금액 입력 시 onChange가 호출된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0');
    fireEvent.change(input, { target: { value: '500' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('500');
  });

  it('placeholder가 표시된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('라벨 텍스트가 렌더링된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    expect(screen.getByText('출금 금액')).toBeInTheDocument();
  });

  it('잔액 정보가 표시된다', () => {
    render(<WithdrawAmt amt={1234} value="" onChange={mockOnChange} />);
    
    expect(screen.getByText(/잔액: 1,234 MZT/)).toBeInTheDocument();
  });

  it('숫자만 입력 가능하다 (type="number")', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('value prop이 반영된다', () => {
    render(<WithdrawAmt amt={1000} value="500" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('0') as HTMLInputElement;
    expect(input.value).toBe('500');
  });

  it('MZT 단위가 표시된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    const mztLabels = screen.getAllByText('MZT');
    expect(mztLabels.length).toBeGreaterThan(0);
  });

  it('퍼센트 버튼들이 렌더링된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    expect(screen.getByRole('button', { name: '25%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '75%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
  });

  it('퍼센트 버튼 클릭 시 계산된 금액으로 onChange가 호출된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    const button50 = screen.getByRole('button', { name: '50%' });
    fireEvent.click(button50);
    
    expect(mockOnChange).toHaveBeenCalledWith('500');
  });

  it('전체 버튼 클릭 시 전체 금액으로 onChange가 호출된다', () => {
    render(<WithdrawAmt amt={1000} value="" onChange={mockOnChange} />);
    
    const buttonAll = screen.getByRole('button', { name: '전체' });
    fireEvent.click(buttonAll);
    
    expect(mockOnChange).toHaveBeenCalledWith('1000');
  });
});
