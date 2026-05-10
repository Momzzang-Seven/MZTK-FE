import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BoardToggle from "../BoardToggle";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BoardToggle", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithRouter = (initialPath = "/community/free") => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/community/*" element={<BoardToggle />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("자유게시판과 질문게시판 버튼이 렌더링된다", () => {
    renderWithRouter();

    expect(screen.getByText("자유게시판")).toBeInTheDocument();
    expect(screen.getByText("질문게시판")).toBeInTheDocument();
  });

  it("자유게시판 경로일 때 자유게시판이 활성화된다", () => {
    renderWithRouter("/community/free");

    const freeBoard = screen.getByText("자유게시판").parentElement;
    const questionBoard = screen.getByText("질문게시판").parentElement;

    expect(freeBoard).toHaveClass("text-white");
    expect(questionBoard).toHaveClass("text-gray-400");
  });

  it("질문게시판 경로일 때 질문게시판이 활성화된다", () => {
    renderWithRouter("/community/question");

    const freeBoard = screen.getByText("자유게시판").parentElement;
    const questionBoard = screen.getByText("질문게시판").parentElement;

    expect(freeBoard).toHaveClass("text-gray-400");
    expect(questionBoard).toHaveClass("text-white");
  });

  it("자유게시판 클릭 시 navigate가 호출된다", () => {
    renderWithRouter("/community/question");

    const freeBoard = screen.getByText("자유게시판");
    fireEvent.click(freeBoard);

    expect(mockNavigate).toHaveBeenCalledWith("/community/free");
  });

  it("질문게시판 클릭 시 navigate가 호출된다", () => {
    renderWithRouter("/community/free");

    const questionBoard = screen.getByText("질문게시판");
    fireEvent.click(questionBoard);

    expect(mockNavigate).toHaveBeenCalledWith("/community/question");
  });

  it("슬라이드 배경이 올바른 위치에 있다 (자유게시판)", () => {
    const { container } = renderWithRouter("/community/free");

    const slideBackground = container.querySelector(
      ".absolute.top-1\\.5.left-1\\.5"
    );
    expect(slideBackground).toHaveClass("translate-x-0");
    expect(slideBackground).not.toHaveClass("translate-x-full");
  });

  it("슬라이드 배경이 올바른 위치에 있다 (질문게시판)", () => {
    const { container } = renderWithRouter("/community/question");

    const slideBackground = container.querySelector(
      ".absolute.top-1\\.5.left-1\\.5"
    );
    expect(slideBackground).toHaveClass("translate-x-full");
  });
});
