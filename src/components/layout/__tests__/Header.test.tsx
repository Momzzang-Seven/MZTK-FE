import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';

vi.mock('@constant', () => ({
  headerByPath: [
    { path: '/', label: '홈' },
    { path: '/exercise', label: '운동' },
    { path: '/community', label: '커뮤니티' },
    { path: '/my', label: '마이페이지' },
  ],
}));

const renderWithRouter = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
    </MemoryRouter>
  );
};

describe('Header', () => {
  it('헤더가 렌더링된다', () => {
    const { container } = renderWithRouter('/');
    
    const header = container.querySelector('.fixed.max-w-\\[420px\\]');
    expect(header).toBeInTheDocument();
  });

  it('현재 경로에 맞는 라벨이 표시된다', () => {
    renderWithRouter('/exercise');
    
    expect(screen.getByText('운동')).toBeInTheDocument();
  });

  it('headerByPath에서 라벨을 찾는다', () => {
    renderWithRouter('/community');
    
    expect(screen.getByText('커뮤니티')).toBeInTheDocument();
  });

  it('매칭되는 경로가 없을 때 빈 문자열을 표시한다', () => {
    const { container } = renderWithRouter('/unknown');
    
    const labelDiv = container.querySelector('.text-\\[32px\\].text-main.font-bold');
    expect(labelDiv?.textContent).toBe('');
  });

  it('고정 위치 스타일이 확인된다', () => {
    const { container } = renderWithRouter('/');
    
    const header = container.querySelector('.fixed.top-0');
    expect(header).toBeInTheDocument();
  });
});
