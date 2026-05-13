import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CreatePostButton from "../CreatePostButton";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("CreatePostButton", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithRouter = (initialPath = "/community/free") => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/community/*" element={<CreatePostButton />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("버튼이 렌더링된다", () => {
    renderWithRouter();

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("자유게시판 경로에서 클릭 시 새 글 작성 페이지로 이동한다", () => {
    renderWithRouter("/community/free");

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/community/free/new/select-image"
    );
  });

  it("질문게시판 경로에서 클릭 시 새 질문 작성 페이지로 이동한다", () => {
    renderWithRouter("/community/question");

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/community/question/new");
  });

  it("버튼이 고정 위치에 있다", () => {
    const { container } = renderWithRouter();

    const wrapper = container.querySelector(".fixed.bottom-\\[110px\\]");
    expect(wrapper).toBeInTheDocument();
  });

  it("버튼이 특정 라운드값과 shadow를 가진다", () => {
    renderWithRouter();

    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-[24px]");
    expect(button).toHaveClass("shadow-[0_20px_40px_rgba(250,177,47,0.3)]");
  });

  it("버튼 크기가 64x64(h-16 w-16)이다", () => {
    renderWithRouter();

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-16");
    expect(button).toHaveClass("h-16");
  });
});
