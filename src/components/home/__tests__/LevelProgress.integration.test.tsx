import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '@mocks/server';
import { levelUpFailHandlers } from '@mocks/handlers/level';
import { walletNotFoundHandlers } from '@mocks/handlers/wallet';
import { LevelProgress } from '@components/home/LevelProgress';

const mockLevelUp = vi.fn();

vi.mock('@store', () => ({
  useUserStore: () => ({
    level: 5,
    xp: 100,
    maxXp: 100,
    levelUp: mockLevelUp,
  }),
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('[통합] LevelProgress - 레벨업 흐름', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('레벨업 성공 시 축하 메시지가 alert로 표시된다', async () => {
    mockLevelUp.mockResolvedValue({
      success: true,
      message: '축하합니다! Lv.6 달성! 보상으로 100 MZTK가 지급되었습니다.',
    });

    renderWithRouter(<LevelProgress />);

    const btn = screen.getByRole('button', { name: '레벨업!' });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        '축하합니다! Lv.6 달성! 보상으로 100 MZTK가 지급되었습니다.'
      );
    });
  });

  it('지갑이 없을 때 레벨업 실패 메시지가 표시된다', async () => {
    server.use(...walletNotFoundHandlers);
    mockLevelUp.mockResolvedValue({
      success: false,
      message: '연결된 지갑 주소가 없습니다. 지갑을 먼저 등록해주세요.',
    });

    renderWithRouter(<LevelProgress />);

    const btn = screen.getByRole('button', { name: '레벨업!' });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        '연결된 지갑 주소가 없습니다. 지갑을 먼저 등록해주세요.'
      );
    });
  });

  it('서버 오류 시 실패 메시지가 표시된다', async () => {
    server.use(...levelUpFailHandlers);
    mockLevelUp.mockResolvedValue({
      success: false,
      message: '연결된 지갑이 없습니다.',
    });

    renderWithRouter(<LevelProgress />);

    const btn = screen.getByRole('button', { name: '레벨업!' });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('연결된 지갑이 없습니다.');
    });
  });
});
