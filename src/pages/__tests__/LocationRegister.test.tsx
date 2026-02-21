import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LocationRegister from '../LocationRegister';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UI_TEXT } from '@constant/index';

// 모킹
const mockNavigate = vi.fn();
const mockRegisterGymLocation = vi.fn().mockResolvedValue(undefined);

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: { from: 'verify' } }),
    };
});

vi.mock('@store/userStore', () => ({
    useUserStore: () => ({
        registerGymLocation: mockRegisterGymLocation,
    }),
}));

// Geolocation 모킹
const mockGetCurrentPosition = vi.fn();
(global.navigator as any).geolocation = {
    getCurrentPosition: mockGetCurrentPosition,
};

describe('LocationRegister Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('현재 위치 정보를 가져오려고 시도한다', () => {
        render(
            <BrowserRouter>
                <LocationRegister />
            </BrowserRouter>
        );

        expect(mockGetCurrentPosition).toHaveBeenCalled();
    });

    it('등록 버튼 클릭 시 등록 로딩 화면이 표시되고 완료 후 이동한다', async () => {
        render(
            <BrowserRouter>
                <LocationRegister />
            </BrowserRouter>
        );

        const registerButton = screen.getByRole('button', { name: UI_TEXT.REGISTER_BTN });
        fireEvent.click(registerButton);

        // 로딩 화면의 타이틀 확인
        expect(screen.getByText(UI_TEXT.LOADING_TITLE)).toBeInTheDocument();

        // 2초 대기 (LOCATION_CONSTANTS.ANIMATION_DURATION 가 2000이라고 가정)
        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        expect(mockRegisterGymLocation).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/verify');
    });
});
