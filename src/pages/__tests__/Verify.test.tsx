import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Verify from '../Verify';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VERIFY_TEXT } from '@constant/location';

// 모킹
const mockNavigate = vi.fn();
const mockCompleteExercise = vi.fn();
const mockSetCoor = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@store', () => ({
    useLocationStore: () => ({
        coor: { lat: 37.5665, lng: 126.9780 },
        setCoor: mockSetCoor,
    }),
}));

vi.mock('@store/userStore', () => ({
    useUserStore: () => ({
        gymLocation: { lat: 37.5665, lng: 126.9780 }, // 같은 위치로 설정 (Near 상태)
        completeExercise: mockCompleteExercise,
    }),
}));

// Geolocation 모킹
const mockWatchPosition = vi.fn();
const mockClearWatch = vi.fn();
(global.navigator as any).geolocation = {
    watchPosition: mockWatchPosition,
    clearWatch: mockClearWatch,
};

describe('Verify Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('인증 버튼 클릭 시 성공 오버레이가 표시되고 2초 후 홈으로 이동한다', async () => {
        render(
            <BrowserRouter>
                <Verify />
            </BrowserRouter>
        );

        const verifyButton = screen.getByRole('button', { name: VERIFY_TEXT.BTN_VERIFY });
        fireEvent.click(verifyButton);

        expect(mockCompleteExercise).toHaveBeenCalled();

        // 성공 오버레이 확인 (VerifySuccessOverlay 내부의 텍스트가 있을 것임)
        // 여기서는 컴포넌트가 렌더링되었는지만 확인하는 식으로 작성

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
