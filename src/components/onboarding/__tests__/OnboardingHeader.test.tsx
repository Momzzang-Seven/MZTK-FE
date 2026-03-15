import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingHeader } from '../OnboardingHeader';

vi.mock('@constant/onboarding', () => ({
  ONBOARDING_TEXT: {
    TITLE_1: '몸짱코인과 함께',
    TITLE_2: '건강한 습관을 만들어요',
    DESC_1: '운동을 하고 토큰을 받아보세요.',
    DESC_2: '받은 토큰으로 다양한 혜택을 누리세요.',
    DESC_3: '건강도 챙기고 보상도 받는 일석이조!',
  },
}));

describe('OnboardingHeader', () => {
  it('제목이 렌더링된다', () => {
    render(<OnboardingHeader />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('TITLE_1과 TITLE_2가 표시된다', () => {
    render(<OnboardingHeader />);
    
    expect(screen.getByText(/몸짱코인과 함께/)).toBeInTheDocument();
    expect(screen.getByText(/건강한 습관을 만들어요/)).toBeInTheDocument();
  });

  it('설명 텍스트가 렌더링된다', () => {
    render(<OnboardingHeader />);
    
    expect(screen.getByText(/운동을 하고 토큰을 받아보세요/)).toBeInTheDocument();
    expect(screen.getByText(/받은 토큰으로 다양한 혜택을 누리세요/)).toBeInTheDocument();
    expect(screen.getByText(/건강도 챙기고 보상도 받는 일석이조/)).toBeInTheDocument();
  });

  it('제목 스타일 클래스가 적용된다', () => {
    render(<OnboardingHeader />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('font-gmarket', 'text-[28px]', 'text-black');
  });

  it('설명 스타일 클래스가 적용된다', () => {
    const { container } = render(<OnboardingHeader />);
    
    const description = container.querySelector('.text-color-grey-deep');
    expect(description).toBeInTheDocument();
  });
});
