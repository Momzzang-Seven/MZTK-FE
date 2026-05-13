import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Callback from "@pages/Callback";
import { PostLogin } from "@services/auth";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...(actual as object),
    isAxiosError: (err: unknown) =>
      (err as { isAxiosError?: boolean }).isAxiosError === true,
    default: {
      ...(actual as { default: Record<string, unknown> }).default,
      isAxiosError: (err: unknown) =>
        (err as { isAxiosError?: boolean }).isAxiosError === true,
    },
  };
});

vi.mock("@services/auth", () => ({
  PostLogin: vi.fn(),
  PostSignup: vi.fn(),
  PostLogout: vi.fn(),
  PostReissueToken: vi.fn(),
  PostReactivate: vi.fn(),
  PostStepUp: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

describe("[통합] Callback - 로그인 처리 흐름", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PostLogin).mockReset();
  });

  it("기존 유저가 로그인하면 지갑 복구(/restore-wallet) 페이지로 이동한다", async () => {
    vi.mocked(PostLogin).mockResolvedValueOnce({
      userInfo: {
        userId: 1,
        nickname: "테스트",
        email: "test@example.com",
        profileImage: "",
        role: "USER",
        walletAddress: "0x123",
      },
      accessToken: "mock-token",
      grantType: "Bearer",
      expiresIn: 3600,
      isNewUser: false,
    });

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(PostLogin).toHaveBeenCalledWith({
        provider: "KAKAO",
        authorizationCode: "test-code",
        redirectUri: expect.stringContaining("/callback"),
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/restore-wallet");
    });
  });

  it("신규 유저가 로그인하면 회원가입(/register) 페이지로 이동한다", async () => {
    vi.mocked(PostLogin).mockResolvedValueOnce({
      userInfo: {
        userId: 1,
        nickname: "테스트",
        email: "test@example.com",
        profileImage: "",
        role: "USER",
        walletAddress: "0x123",
      },
      accessToken: "mock-token",
      grantType: "Bearer",
      expiresIn: 3600,
      isNewUser: true,
    });

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
  });

  it("기존 일반 유저가 성공적으로 로그인하면 지갑 복구(/restore-wallet)으로 이동한다", async () => {
    vi.mocked(PostLogin).mockResolvedValueOnce({
      userInfo: {
        userId: 1,
        nickname: "테스트",
        email: "test@example.com",
        profileImage: "",
        role: "USER",
        walletAddress: "0x123",
      },
      accessToken: "mock-token",
      grantType: "Bearer",
      expiresIn: 3600,
      isNewUser: false,
    });

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/restore-wallet");
    });
  });

  it("기존 트레이너가 성공적으로 로그인하면 /restore-wallet로 이동한다", async () => {
    vi.mocked(PostLogin).mockResolvedValueOnce({
      userInfo: {
        userId: 2,
        nickname: "트레이너",
        email: "trainer@example.com",
        profileImage: "",
        role: "TRAINER",
        walletAddress: "0x456",
      },
      accessToken: "mock-token",
      grantType: "Bearer",
      expiresIn: 3600,
      isNewUser: false,
    });

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/restore-wallet");
    });
  });

  it("이미 가입된 계정(409 Conflict)인 경우 에러 모달을 표시한다", async () => {
    const errorResponse = {
      response: {
        status: 409,
        data: { message: "이미 가입된 계정입니다." },
      },
      isAxiosError: true,
    };
    vi.mocked(PostLogin).mockRejectedValueOnce(errorResponse);

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("로그인 실패")).toBeInTheDocument();
    expect(
      await screen.findByText("이미 가입된 계정입니다.")
    ).toBeInTheDocument();
  });

  it("일반 에러 발생 시 /login 페이지로 리다이렉트한다", async () => {
    vi.mocked(PostLogin).mockRejectedValueOnce(new Error("Unknown Error"));

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("이미 가입된 계정(409)에서 재활성화 버튼 클릭 전 에러 모달이 표시된다", async () => {
    vi.mocked(PostLogin).mockRejectedValueOnce({
      response: { status: 409, data: { message: "이미 가입된 계정입니다." } },
      isAxiosError: true,
    });

    render(
      <MemoryRouter initialEntries={["/callback?code=test-code&state=kakao"]}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </MemoryRouter>
    );

    const modalTitle = await screen.findByText(/로그인 실패/i, undefined, {
      timeout: 4000,
    });
    expect(modalTitle).toBeInTheDocument();
  });
});
