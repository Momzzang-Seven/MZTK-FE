import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifyHeader } from '../VerifyHeader';

vi.mock('@constant/location', () => ({
  VERIFY_TEXT: {
    TITLE: '운동 인증',
  },
}));

describe('VerifyHeader', () => {
  it('제목이 렌더링된다', () => {
    render(<VerifyHeader />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('VERIFY_TEXT.TITLE이 표시된다', () => {
    render(<VerifyHeader />);
    
    expect(screen.getByText('운동 인증')).toBeInTheDocument();
  });

  it('absolute 위치 스타일이 적용된다', () => {
    const { container } = render(<VerifyHeader />);
    
    const header = container.querySelector('.absolute.top-0.left-0.right-0');
    expect(header).toBeInTheDocument();
  });

  it('shadow 스타일이 적용된다', () => {
    const { container } = render(<VerifyHeader />);
    
    const header = container.querySelector('.shadow-sm');
    expect(header).toBeInTheDocument();
  });
});
