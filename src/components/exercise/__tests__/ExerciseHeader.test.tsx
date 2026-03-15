import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseHeader } from '../ExerciseHeader';

vi.mock('@constant/exercise', () => ({
  EXERCISE_TEXT: {
    TITLE: '운동 기록',
  },
}));

describe('ExerciseHeader', () => {
  it('제목이 렌더링된다', () => {
    render(<ExerciseHeader />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('EXERCISE_TEXT.TITLE이 표시된다', () => {
    render(<ExerciseHeader />);
    
    expect(screen.getByText('운동 기록')).toBeInTheDocument();
  });

  it('올바른 스타일 클래스가 적용된다', () => {
    render(<ExerciseHeader />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-4xl', 'font-bold', 'text-main');
  });
});
