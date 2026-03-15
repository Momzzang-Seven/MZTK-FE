import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeaderboardItem from '../LeaderboardItem';
import type { LeaderboardUser } from '@types';

describe('LeaderboardItem', () => {
  const mockUser: LeaderboardUser = {
    id: 1,
    rank: 1,
    nickname: '테스트유저',
    level: 10,
    xp: 5000,
  };

  it('기본 정보가 렌더링된다', () => {
    render(<LeaderboardItem user={mockUser} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('테스트유저')).toBeInTheDocument();
    expect(screen.getByText('레벨 10 / 5000XP')).toBeInTheDocument();
  });

  it('isMe=false일 때 기본 스타일이 적용된다', () => {
    const { container } = render(<LeaderboardItem user={mockUser} isMe={false} />);
    
    const wrapper = container.querySelector('.flex.items-center.gap-3');
    expect(wrapper).not.toHaveClass('bg-main');
  });

  it('isMe=true일 때 하이라이트 스타일이 적용된다', () => {
    const { container } = render(<LeaderboardItem user={mockUser} isMe={true} />);
    
    const wrapper = container.querySelector('.bg-main');
    expect(wrapper).toBeInTheDocument();
  });

  it('프로필 원이 렌더링된다', () => {
    const { container } = render(<LeaderboardItem user={mockUser} />);
    
    const profileCircle = container.querySelector('.w-10.h-10.rounded-full');
    expect(profileCircle).toBeInTheDocument();
  });

  it('랭킹 번호가 표시된다', () => {
    render(<LeaderboardItem user={mockUser} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('레벨 및 XP 정보가 표시된다', () => {
    render(<LeaderboardItem user={mockUser} />);
    
    expect(screen.getByText(/레벨 10/)).toBeInTheDocument();
    expect(screen.getByText(/5000XP/)).toBeInTheDocument();
  });

  it('isMe에 따라 텍스트 색상이 변경된다', () => {
    const { container: container1 } = render(<LeaderboardItem user={mockUser} isMe={false} />);
    const { container: container2 } = render(<LeaderboardItem user={mockUser} isMe={true} />);
    
    const nickname1 = container1.querySelector('.font-semibold');
    const nickname2 = container2.querySelector('.font-semibold');
    
    expect(nickname1).toHaveClass('text-main');
    expect(nickname2).toHaveClass('text-white');
  });

  it('isMe에 따라 프로필 원 색상이 변경된다', () => {
    const { container: container1 } = render(<LeaderboardItem user={mockUser} isMe={false} />);
    const { container: container2 } = render(<LeaderboardItem user={mockUser} isMe={true} />);
    
    const circle1 = container1.querySelector('.w-10.h-10.rounded-full');
    const circle2 = container2.querySelector('.w-10.h-10.rounded-full');
    
    expect(circle1).toHaveClass('bg-main');
    expect(circle2).toHaveClass('bg-white');
  });
});
