import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrainerStats from '../TrainerStats';

describe('TrainerStats', () => {
  const mockStats = [
    { label: '총 회원', value: '150', unit: '명' },
    { label: '이번 달', value: '12', unit: '명' },
    { label: '평균 평점', value: '4.8', unit: '점' },
  ];

  it('통계 데이터가 렌더링된다', () => {
    render(<TrainerStats stats={mockStats} />);
    
    expect(screen.getByText('총 회원')).toBeInTheDocument();
    expect(screen.getByText('이번 달')).toBeInTheDocument();
    expect(screen.getByText('평균 평점')).toBeInTheDocument();
  });

  it('각 stat 항목의 값이 표시된다', () => {
    render(<TrainerStats stats={mockStats} />);
    
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('각 stat 항목의 단위가 표시된다', () => {
    render(<TrainerStats stats={mockStats} />);
    
    const units = screen.getAllByText('명');
    expect(units).toHaveLength(2);
    expect(screen.getByText('점')).toBeInTheDocument();
  });

  it('그리드 레이아웃이 적용된다', () => {
    const { container } = render(<TrainerStats stats={mockStats} />);
    
    const grid = container.querySelector('.grid.grid-cols-3');
    expect(grid).toBeInTheDocument();
  });

  it('각 stat 카드에 스타일이 적용된다', () => {
    const { container } = render(<TrainerStats stats={mockStats} />);
    
    const cards = container.querySelectorAll('.bg-white.p-4.rounded-2xl');
    expect(cards).toHaveLength(3);
  });

  it('빈 stats 배열도 렌더링된다', () => {
    const { container } = render(<TrainerStats stats={[]} />);
    
    const grid = container.querySelector('.grid.grid-cols-3');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(0);
  });
});
