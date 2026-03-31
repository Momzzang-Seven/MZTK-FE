import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '@mocks/server';
import { locationVerifyFailHandlers } from '@mocks/handlers/location';
import Verify from '@pages/Verify';
import { VERIFY_TEXT } from '@constant/location';

const mockNavigate = vi.fn();
const mockCompleteExercise = vi.fn();
const mockSetCoor = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock('@store', () => ({
  useLocationStore: () => ({
    coor: { lat: 37.5665, lng: 126.978 },
    setCoor: mockSetCoor,
  }),
}));

vi.mock('@store/userStore', () => ({
  useUserStore: () => ({
    gymLocation: { locationId: 1, lat: 37.5665, lng: 126.978 },
    completeExercise: mockCompleteExercise,
  }),
}));

vi.mock('@services/location', () => ({
  locationService: {
    verifyLocation: vi.fn().mockResolvedValue({ isVerified: true, grantedXp: 100 }),
  },
}));

const mockWatchPosition = vi.fn();
const mockClearWatch = vi.fn();
(global.navigator as unknown as { geolocation: object }).geolocation = {
  watchPosition: mockWatchPosition,
  clearWatch: mockClearWatch,
};

describe('[통합] Verify - 위치 인증 흐름', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('위치 인증 성공 시 completeExercise가 호출되고 홈으로 이동한다', async () => {
    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    const btn = screen.getByRole('button', { name: VERIFY_TEXT.BTN_VERIFY });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockCompleteExercise).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });

  it('위치 인증 실패(isVerified: false) 시 실패 모달이 표시된다', async () => {
    server.use(...locationVerifyFailHandlers);

    vi.mock('@services/location', () => ({
      locationService: {
        verifyLocation: vi.fn().mockResolvedValue({ isVerified: false, grantedXp: 0 }),
      },
    }));

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    const btn = screen.getByRole('button', { name: VERIFY_TEXT.BTN_VERIFY });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockCompleteExercise).not.toHaveBeenCalled();
    });
  });
});
