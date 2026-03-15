import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecordAuth from '../RecordAuth';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RECORD_TEXT } from '@constant/record';

// 모킹
const mockNavigate = vi.fn();
const mockStartAnalysis = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('@store/userStore', () => ({
    useUserStore: () => ({
        user: { id: 1, nickname: 'testuser' },
        startAnalysis: mockStartAnalysis,
    }),
}));

describe('RecordAuth Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        global.URL.createObjectURL = vi.fn(() => 'mock-url');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('초기 렌더링 시 가이드 문구와 버튼이 표시된다', () => {
        render(
            <BrowserRouter>
                <RecordAuth />
            </BrowserRouter>
        );

        expect(screen.getByText(RECORD_TEXT.TITLE)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("러닝 기록"))).toBeInTheDocument();

        const registerBtn = screen.getByRole('button', { name: RECORD_TEXT.BTN_REGISTER });
        expect(registerBtn).toBeInTheDocument();
        expect(registerBtn).toBeDisabled();
    });

    it('파일 선택 시 등록 버튼이 활성화된다', async () => {
        render(
            <BrowserRouter>
                <RecordAuth />
            </BrowserRouter>
        );

        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('photo-input');

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        const registerBtn = screen.getByRole('button', { name: RECORD_TEXT.BTN_REGISTER });
        expect(registerBtn).not.toBeDisabled();
    });

    it('등록 버튼 클릭 시 분석 중 화면으로 전환된다', async () => {
        render(
            <BrowserRouter>
                <RecordAuth />
            </BrowserRouter>
        );

        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('photo-input');
        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        const registerBtn = screen.getByRole('button', { name: RECORD_TEXT.BTN_REGISTER });
        await act(async () => {
            fireEvent.click(registerBtn);
        });

        expect(screen.getByText(/분석.*완료/i)).toBeInTheDocument();
        expect(mockStartAnalysis).toHaveBeenCalledWith("record");

        act(() => {
            vi.advanceTimersByTime(2000);
        });
    });
});
