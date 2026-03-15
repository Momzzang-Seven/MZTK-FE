import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationHeader } from '../LocationHeader';

vi.mock('@constant/index', () => ({
  UI_TEXT: {
    HEADER_TITLE: '운동 장소',
    HEADER_TIP: '가까운 운동 장소를 찾아보세요!',
  },
}));

describe('LocationHeader', () => {
  it('제목이 렌더링된다', () => {
    render(<LocationHeader />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('UI_TEXT.HEADER_TITLE이 표시된다', () => {
    render(<LocationHeader />);
    
    expect(screen.getByText('운동 장소')).toBeInTheDocument();
  });

  it('팁 메시지가 렌더링된다', () => {
    render(<LocationHeader />);
    
    expect(screen.getByText('가까운 운동 장소를 찾아보세요!')).toBeInTheDocument();
  });

  it('UI_TEXT.HEADER_TIP이 표시된다', () => {
    render(<LocationHeader />);
    
    const tipElement = screen.getByText(/가까운 운동 장소/);
    expect(tipElement).toBeInTheDocument();
  });

  it('올바른 스타일 클래스가 적용된다', () => {
    const { container } = render(<LocationHeader />);
    
    const header = container.querySelector('.absolute.top-0.left-0.right-0');
    expect(header).toBeInTheDocument();
    
    const tipBox = container.querySelector('.bg-main.text-white');
    expect(tipBox).toBeInTheDocument();
  });
});
