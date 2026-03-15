import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelProgress } from '../LevelProgress';

const mockLevelUp = vi.fn();
const mockUseUserStore = vi.fn();

vi.mock('@store', () => ({
  useUserStore: () => mockUseUserStore(),
}));

describe('LevelProgress', () => {
  beforeEach(() => {
    mockLevelUp.mockClear();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('현재 레벨이 표시된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 50,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    expect(screen.getByText('Lv.5')).toBeInTheDocument();
  });

  it('XP 진행도가 표시된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 3,
      xp: 75,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    expect(screen.getByText('75 / 100 XP')).toBeInTheDocument();
  });

  it('현재 레벨 텍스트가 표시된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 2,
      xp: 30,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    expect(screen.getByText('현재 레벨')).toBeInTheDocument();
  });

  it('레벨업 가능 시 "레벨업!" 버튼이 표시된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    const levelUpButton = screen.getByRole('button', { name: '레벨업!' });
    expect(levelUpButton).toBeInTheDocument();
  });

  it('레벨업 가능 시 현재 레벨 정보가 숨겨진다', () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    expect(screen.queryByText('현재 레벨')).not.toBeInTheDocument();
    expect(screen.queryByText('Lv.5')).not.toBeInTheDocument();
  });

  it('레벨업 버튼 클릭 시 levelUp 함수가 호출된다', () => {
    mockLevelUp.mockReturnValue(true);
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    const levelUpButton = screen.getByRole('button', { name: '레벨업!' });
    fireEvent.click(levelUpButton);
    
    expect(mockLevelUp).toHaveBeenCalledTimes(1);
  });

  it('레벨업 성공 시 alert가 표시된다', () => {
    mockLevelUp.mockReturnValue(true);
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    const levelUpButton = screen.getByRole('button', { name: '레벨업!' });
    fireEvent.click(levelUpButton);
    
    expect(window.alert).toHaveBeenCalledWith(
      '축하합니다! Lv.6 달성! 보상으로 토큰이 지급되었습니다.'
    );
  });

  it('레벨업 실패 시 alert가 표시되지 않는다', () => {
    mockLevelUp.mockReturnValue(false);
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    const levelUpButton = screen.getByRole('button', { name: '레벨업!' });
    fireEvent.click(levelUpButton);
    
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('SVG circle이 렌더링된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 3,
      xp: 50,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    const { container } = render(<LevelProgress />);
    
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('XP가 maxXp를 초과해도 100%로 제한된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 150,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    render(<LevelProgress />);
    
    expect(screen.getByRole('button', { name: '레벨업!' })).toBeInTheDocument();
  });
});
