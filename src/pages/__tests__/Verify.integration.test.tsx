import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Verify from '../Verify';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VERIFY_TEXT } from '@constant/location';
import { server } from '@mocks/server';
import { http, HttpResponse } from 'msw';

// 외부 의존성(스토어, 네비게이션) 모킹
const mockNavigate = vi.fn();
const mockCompleteExercise = vi.fn();
const mockSetCoor = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...(actual as object),
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@store', async () => {
    const actual = await vi.importActual('@store');
    return {
        ...(actual as object),
        useLocationStore: () => ({
            coor: { lat: 37.5665, lng: 126.9780 },
            setCoor: mockSetCoor,
        }),
        useAuthModalStore: Object.assign(
            () => ({}),
            {
                getState: () => ({ setUnauthorized: vi.fn() }),
            }
        ),
    };
});

vi.mock('@store/userStore', async () => {
    const actual = await vi.importActual('@store/userStore');
    return {
        ...(actual as object),
        useUserStore: Object.assign(
            () => ({
                gymLocation: { locationId: 1, lat: 37.5665, lng: 126.9780 },
                completeExercise: mockCompleteExercise,
            }),
            {
                getState: () => ({ accessToken: 'mock-token' }),
            }
        ),
    };
});

// Geolocation 모킹
const mockWatchPosition = vi.fn();
const mockClearWatch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global.navigator as any).geolocation = {
    watchPosition: mockWatchPosition,
    clearWatch: mockClearWatch,
};

describe('Verify Page API Integration (MSW)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('인증 API 성공 시, 성공 오버레이가 표시되고 홈으로 이동한다', async () => {
        // MSW 성공 모킹
        server.use(
            http.post('/locations/verify', () => {
                return HttpResponse.json({
                    status: 'SUCCESS',
                    data: {
                        isVerified: true,
                        grantedXp: 100
                    }
                });
            })
        );

        render(
            <BrowserRouter>
                <Verify />
            </BrowserRouter>
        );

        // 버튼이 활성화될 때까지 대기
        const verifyButton = await screen.findByRole('button', { name: VERIFY_TEXT.BTN_VERIFY });
        fireEvent.click(verifyButton);

        // 경험치 획득 함수 호출 확인
        await waitFor(() => {
            expect(mockCompleteExercise).toHaveBeenCalledWith(100);
        });

        // 네비게이션 (2초 뒤) 확인
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        }, { timeout: 2500 });
    });

    it('단순 인증 실패 (거절) 시, 에러 모달이 표시된다', async () => {
        // MSW 실패(isVerified: false) 모킹
        server.use(
            http.post('/locations/verify', () => {
                return HttpResponse.json({
                    status: 'SUCCESS',
                    data: {
                        isVerified: false,
                        grantedXp: 0
                    }
                });
            })
        );

        render(
            <BrowserRouter>
                <Verify />
            </BrowserRouter>
        );

        const verifyButton = await screen.findByRole('button', { name: VERIFY_TEXT.BTN_VERIFY });
        fireEvent.click(verifyButton);

        // 에러 모달 뜨는지 확인 (VERIFY_TEXT.MODAL_FAIL_TITLE)
        const failModalTitle = await screen.findByText(VERIFY_TEXT.MODAL_FAIL_TITLE);
        expect(failModalTitle).toBeInTheDocument();
    });

    it('네트워크 통신 에러 (500) 시에도 에러 모달이 표시되어야 한다', async () => {
        // MSW 500 에러 모킹
        server.use(
            http.post('/locations/verify', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(
            <BrowserRouter>
                <Verify />
            </BrowserRouter>
        );

        const verifyButton = await screen.findByRole('button', { name: VERIFY_TEXT.BTN_VERIFY });
        fireEvent.click(verifyButton);

        // 에러 모달 뜨는지 확인 (catch 블록에 의해 setFailModalOpen이 true가 됨)
        const failModalTitle = await screen.findByText(VERIFY_TEXT.MODAL_FAIL_TITLE);
        expect(failModalTitle).toBeInTheDocument();
    });
});
