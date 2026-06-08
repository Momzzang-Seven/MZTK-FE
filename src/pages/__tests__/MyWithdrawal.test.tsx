import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import My from "@pages/My";
import { PostWithdraw } from "@services/auth";
import { useUserStore } from "@store";

const mockNavigate = vi.fn();
const mockShowSnackbar = vi.fn();
const mockClearUser = vi.fn();
const mockInitLevel = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@components/my", () => ({
  CurrentTkn: () => <div />,
  LevelProgress: () => <div />,
  LevelReward: () => <div />,
  TokenActionButtons: () => <div />,
  UserProfile: () => <div />,
}));

vi.mock("@services/auth", () => ({
  PostWithdraw: vi.fn(),
}));

describe("My withdrawal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInitLevel.mockResolvedValue(undefined);
    vi.mocked(PostWithdraw).mockResolvedValue(undefined);
    useUserStore.setState({
      user: {
        userId: 1,
        email: "social@example.com",
        nickname: "소셜회원",
        profileImage: "",
        role: "USER",
        walletAddress: "",
      },
      isAuthenticated: true,
      accessToken: "access-token",
      authProvider: "KAKAO",
      initLevel: mockInitLevel,
      clearUser: mockClearUser,
      showSnackbar: mockShowSnackbar,
    });
  });

  it("asks only yes or no before withdrawal", async () => {
    render(
      <MemoryRouter>
        <My />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /회원탈퇴/ }));

    expect(screen.getByText(/정말 탈퇴하시겠습니까/)).toBeInTheDocument();
    expect(screen.getByText("아니요")).toBeInTheDocument();
    expect(screen.getByText("네")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("비밀번호")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("네"));

    await waitFor(() => expect(PostWithdraw).toHaveBeenCalledTimes(1));
    expect(mockClearUser).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
