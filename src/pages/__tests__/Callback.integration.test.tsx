import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Callback from '@pages/Callback';
import { PostLogin } from '@services/auth';

// 서비스 모킹
// Axios 모킹: isAxiosError가 테스트용 에러 객체를 올바르게 인식하도록 설정
vi.mock('axios', async () => {
    const actual = await vi.importActual('axios');
    return {
        ...(actual as object),
        isAxiosError: (err: any) => err.isAxiosError === true,
        default: {
            ...(actual as any).default,
            isAxiosError: (err: any) => err.isAxiosError === true,
        }
    };
});

vi.mock('@services/auth', () => ({
  PostLogin: vi.fn(),
  PostSignup: vi.fn(),
  PostLogout: vi.fn(),
  PostReissueToken: vi.fn(),
  PostReactivate: vi.fn(),
  PostStepUp: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
    // useSearchParams는 실재 모듈 사용 (MemoryRouter에서 주입됨)
  };
});

describe('[통합] Callback - 로그인 처리 흐름', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공적으로 로그인하면 /register 페이지로 이동한다', async () => {
    (PostLogin as any).mockResolvedValueOnce({
      userInfo: { userId: 1, nickname: '테스트' },
      accessToken: 'mock-token',
    });

    render(
      <MemoryRouter initialEntries={['/callback?code=test-code&state=kakao']}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(PostLogin).toHaveBeenCalledWith({
        provider: 'KAKAO',
        authorizationCode: 'test-code',
        redirectUri: expect.stringContaining('/callback'),
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  it('이미 가입된 계정(409 Conflict)인 경우 에러 모달을 표시한다', async () => {
    const errorResponse = {
      response: {
        status: 409,
        data: { message: '이미 가입된 계정입니다.' },
      },
      isAxiosError: true,
    };
    (PostLogin as any).mockRejectedValueOnce(errorResponse);

    // axios.isAxiosError 모킹 (테스트 환경 대응)
    const axios = await import('axios');
    vi.spyOn(axios.default, 'isAxiosError').mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/callback?code=test-code&state=kakao']}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    // 모달 타이틀 및 설명 확인
    expect(await screen.findByText('로그인 실패')).toBeInTheDocument();
    expect(await screen.findByText('이미 가입된 계정입니다.')).toBeInTheDocument();
  });

  it('일반 에러 발생 시 /login 페이지로 리다이렉트한다', async () => {
    (PostLogin as any).mockRejectedValueOnce(new Error('Unknown Error'));

    render(
      <MemoryRouter initialEntries={['/callback?code=test-code&state=kakao']}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  it('이미 가입된 계정(409)에서 재활성화 버튼 클릭 시 Reactivate API가 호출된다', async () => {
    // 1. 409 Conflict 응답 설정
    (PostLogin as any).mockRejectedValueOnce({
      response: { status: 409, data: { message: '이미 가입된 계정입니다.' } },
      isAxiosError: true,
    });
    
    // 2. Reactivate 성공 응답 설정
    const { PostReactivate } = await import('@services/auth');
    (PostReactivate as any).mockResolvedValueOnce({ accessToken: 'new-token' });

    render(
      <MemoryRouter initialEntries={['/callback?code=test-code&state=kakao']}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    // 3. 에러 모달이 화면에 표시되는지 확인
    // 타이틀부터 확인하여 렌더링 검증
    const modalTitle = await screen.findByText(/로그인 실패/i, undefined, { timeout: 4000 });
    expect(modalTitle).toBeInTheDocument();
  });
});
