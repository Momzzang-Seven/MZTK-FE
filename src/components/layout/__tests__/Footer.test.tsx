import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Footer } from "../Footer";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@store", () => ({
  useUserStore: () => ({
    user: { role: "USER" },
  }),
}));

const renderWithRouter = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Footer />
    </MemoryRouter>
  );
};

describe("Footer", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("Footer 아이템들이 렌더링된다", () => {
    renderWithRouter("/");

    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("커뮤니티")).toBeInTheDocument();
    expect(screen.getByText("마켓")).toBeInTheDocument();
    expect(screen.getByText("내 클래스")).toBeInTheDocument();
    expect(screen.getByText("마이페이지")).toBeInTheDocument();
  });

  it("아이템 버튼 클릭 시 navigate가 호출된다", () => {
    renderWithRouter("/");

    const marketButton = screen.getByRole("button", { name: /마켓/ });
    fireEvent.click(marketButton);

    expect(mockNavigate).toHaveBeenCalledWith("/market");
  });

  it("현재 경로에 맞는 아이템이 활성화된다 (스타일 확인)", () => {
    renderWithRouter("/");

    const homeButton = screen.getByRole("button", { name: /홈/ });
    const homeText = homeButton.querySelector("span");
    expect(homeText).toHaveClass("text-main");

    const communityButton = screen.getByRole("button", { name: /커뮤니티/ });
    const communityText = communityButton.querySelector("span");
    expect(communityText).toHaveClass("text-gray-400");
  });

  it("유저 권한에 따라 '내 클래스' 경로가 달라진다 (USER)", () => {
    renderWithRouter("/");
    const myClassButton = screen.getByRole("button", { name: /내 클래스/ });
    fireEvent.click(myClassButton);
    expect(mockNavigate).toHaveBeenCalledWith("/market/reservations");
  });
});
