import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExerciseAuth from '../ExerciseAuth';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EXERCISE_TEXT } from '@constant/exercise';

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

describe('ExerciseAuth Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        global.URL.createObjectURL = vi.fn(() => 'mock-url');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('초기 렌더링 시 가이드 문구와 업로드 버튼이 표시된다', () => {
        render(
            <BrowserRouter>
                <ExerciseAuth />
            </BrowserRouter>
        );

        expect(screen.getByText(EXERCISE_TEXT.TITLE)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("땀 흘린 당신"))).toBeInTheDocument();

        const registerBtn = screen.getByRole('button', { name: EXERCISE_TEXT.BTN_REGISTER });
        expect(registerBtn).toBeInTheDocument();
        expect(registerBtn).toBeDisabled();
    });

    it('파일 선택 시 등록 버튼이 활성화된다', async () => {
        render(
            <BrowserRouter>
                <ExerciseAuth />
            </BrowserRouter>
        );

        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('photo-input');

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        const registerBtn = screen.getByRole('button', { name: EXERCISE_TEXT.BTN_REGISTER });
        expect(registerBtn).not.toBeDisabled();
    });

    it('등록 버튼 클릭 시 분석 중 화면으로 전환되고 2초 뒤 이동한다', async () => {
        render(
            <BrowserRouter>
                <ExerciseAuth />
            </BrowserRouter>
        );

        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('photo-input');
        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });

        const registerBtn = screen.getByRole('button', { name: EXERCISE_TEXT.BTN_REGISTER });
        await act(async () => {
            fireEvent.click(registerBtn);
        });

        // 분석 중 텍스트 확인 (Regex 사용)
        expect(screen.getByText(/분석.*완료/i)).toBeInTheDocument();
        expect(mockStartAnalysis).toHaveBeenCalledWith("exercise");

        act(() => {
            vi.advanceTimersByTime(2000);
        });
    });
});
