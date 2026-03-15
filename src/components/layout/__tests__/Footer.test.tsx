import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer';

const mockNavigate = vi.fn();

vi.mock('@constant', () => ({
  footerItem: [
    { path: '/', label: '홈', src: '/icon/home.svg', activeSrc: '/icon/home-active.svg' },
    { path: '/exercise', label: '운동', src: '/icon/exercise.svg', activeSrc: '/icon/exercise-active.svg' },
    { path: '/community', label: '커뮤니티', src: '/icon/community.svg', activeSrc: '/icon/community-active.svg' },
    { path: '/my', label: '마이', src: '/icon/my.svg', activeSrc: '/icon/my-active.svg' },
  ],
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Footer />
    </MemoryRouter>
  );
};

describe('Footer', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('Footer 아이템들이 렌더링된다', () => {
    renderWithRouter('/');
    
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('운동')).toBeInTheDocument();
    expect(screen.getByText('커뮤니티')).toBeInTheDocument();
    expect(screen.getByText('마이')).toBeInTheDocument();
  });

  it('아이템 버튼 클릭 시 navigate가 호출된다', () => {
    renderWithRouter('/');
    
    const exerciseButton = screen.getByRole('button', { name: /운동/ });
    fireEvent.click(exerciseButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/exercise');
  });

  it('현재 경로에 맞는 아이템이 활성화된다', () => {
    renderWithRouter('/exercise');
    
    const exerciseImg = screen.getByAltText('운동');
    expect(exerciseImg).toHaveAttribute('src', '/icon/exercise-active.svg');
  });

  it('활성 아이템은 activeSrc 이미지를 사용한다', () => {
    renderWithRouter('/community');
    
    const communityImg = screen.getByAltText('커뮤니티');
    expect(communityImg).toHaveAttribute('src', '/icon/community-active.svg');
  });

  it('비활성 아이템은 src 이미지를 사용한다', () => {
    renderWithRouter('/');
    
    const exerciseImg = screen.getByAltText('운동');
    expect(exerciseImg).toHaveAttribute('src', '/icon/exercise.svg');
  });

  it('홈 경로는 정확한 매칭을 사용한다', () => {
    renderWithRouter('/');
    
    const homeImg = screen.getByAltText('홈');
    expect(homeImg).toHaveAttribute('src', '/icon/home-active.svg');
  });

  it('다른 경로는 prefix 매칭을 사용한다', () => {
    renderWithRouter('/community/free');
    
    const communityImg = screen.getByAltText('커뮤니티');
    expect(communityImg).toHaveAttribute('src', '/icon/community-active.svg');
  });

  it('활성/비활성 텍스트 스타일이 적용된다', () => {
    const { container } = renderWithRouter('/my');
    
    const buttons = container.querySelectorAll('button');
    const myButton = Array.from(buttons).find(btn => btn.textContent?.includes('마이'));
    const homeButton = Array.from(buttons).find(btn => btn.textContent?.includes('홈'));
    
    const myText = myButton?.querySelector('.text-main.body-bold');
    const homeText = homeButton?.querySelector('.text-grey-main.body');
    
    expect(myText).toBeInTheDocument();
    expect(homeText).toBeInTheDocument();
  });
});
