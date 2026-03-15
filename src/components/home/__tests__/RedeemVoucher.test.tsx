import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RedeemVoucher } from '../RedeemVoucher';

describe('RedeemVoucher', () => {
  it('제목이 렌더링된다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    expect(screen.getByText('Redeem Voucher')).toBeInTheDocument();
  });

  it('입력 필드가 렌더링된다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    const input = screen.getByPlaceholderText('Enter voucher code');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('입력 시 state가 업데이트된다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    const input = screen.getByPlaceholderText('Enter voucher code') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'REDEEM123' } });
    
    expect(input.value).toBe('REDEEM123');
  });

  it('Redeem 버튼 클릭 시 onRedeem 콜백이 호출된다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    const input = screen.getByPlaceholderText('Enter voucher code');
    fireEvent.change(input, { target: { value: 'TESTCODE' } });
    
    const redeemButton = screen.getByRole('button', { name: 'Redeem' });
    fireEvent.click(redeemButton);
    
    expect(mockOnRedeem).toHaveBeenCalledWith('TESTCODE');
  });

  it('빈 코드로 Redeem 시도가 가능하다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    const redeemButton = screen.getByRole('button', { name: 'Redeem' });
    fireEvent.click(redeemButton);
    
    expect(mockOnRedeem).toHaveBeenCalledWith('');
  });

  it('Redeem 버튼이 올바른 스타일을 가진다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    const button = screen.getByRole('button', { name: 'Redeem' });
    expect(button).toHaveClass('bg-green-500', 'text-white', 'p-2', 'rounded');
  });

  it('입력 필드가 올바른 스타일을 가진다', () => {
    const mockOnRedeem = vi.fn();
    render(<RedeemVoucher onRedeem={mockOnRedeem} />);
    
    const input = screen.getByPlaceholderText('Enter voucher code');
    expect(input).toHaveClass('border', 'p-1', 'mr-2');
  });
});
