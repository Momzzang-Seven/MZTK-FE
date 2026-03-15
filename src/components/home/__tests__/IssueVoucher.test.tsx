import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IssueVoucher } from '../IssueVoucher';

describe('IssueVoucher', () => {
  it('제목이 렌더링된다', () => {
    const mockOnIssue = vi.fn();
    render(<IssueVoucher onIssue={mockOnIssue} />);
    
    expect(screen.getByText('Issue Voucher')).toBeInTheDocument();
  });

  it('voucher code 입력 필드가 렌더링된다', () => {
    const mockOnIssue = vi.fn();
    render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const input = screen.getByPlaceholderText('Enter voucher code');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('amount 입력 필드가 렌더링된다', () => {
    const mockOnIssue = vi.fn();
    const { container } = render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    expect(amountInput).toBeInTheDocument();
    expect(amountInput.value).toBe('1');
  });

  it('voucher code 입력 시 state가 업데이트된다', () => {
    const mockOnIssue = vi.fn();
    render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const input = screen.getByPlaceholderText('Enter voucher code') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'VOUCHER123' } });
    
    expect(input.value).toBe('VOUCHER123');
  });

  it('amount 입력 시 state가 업데이트된다', () => {
    const mockOnIssue = vi.fn();
    const { container } = render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '5' } });
    
    expect(amountInput.value).toBe('5');
  });

  it('Issue 버튼 클릭 시 onIssue 콜백이 호출된다', () => {
    const mockOnIssue = vi.fn();
    const { container } = render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const codeInput = screen.getByPlaceholderText('Enter voucher code');
    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    
    fireEvent.change(codeInput, { target: { value: 'TEST123' } });
    fireEvent.change(amountInput, { target: { value: '10' } });
    
    const issueButton = screen.getByRole('button', { name: 'Issue' });
    fireEvent.click(issueButton);
    
    expect(mockOnIssue).toHaveBeenCalledWith('TEST123', '10');
  });

  it('Issue 버튼이 올바른 스타일을 가진다', () => {
    const mockOnIssue = vi.fn();
    render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const button = screen.getByRole('button', { name: 'Issue' });
    expect(button).toHaveClass('bg-blue-500', 'text-white', 'p-2', 'rounded');
  });

  it('amount 입력 필드가 최소값 1을 가진다', () => {
    const mockOnIssue = vi.fn();
    const { container } = render(<IssueVoucher onIssue={mockOnIssue} />);
    
    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    expect(amountInput).toHaveAttribute('min', '1');
  });
});
