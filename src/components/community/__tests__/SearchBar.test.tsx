import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchBar from "../SearchBar";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SearchBar", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithRouter = (initialPath = "/community/free") => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/community/*" element={<SearchBar />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("기본 렌더링 및 placeholder 확인", () => {
    renderWithRouter();

    const input = screen.getByPlaceholderText("태그 검색...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "search");
  });

  it("검색 아이콘이 표시된다", () => {
    renderWithRouter();

    const icon = screen.getByAltText("search");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "/icon/search.svg");
  });

  it("검색어 입력 시 state가 업데이트된다", () => {
    renderWithRouter();

    const input = screen.getByPlaceholderText(
      "태그 검색..."
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "운동" } });

    expect(input.value).toBe("운동");
  });

  it("Enter 키 입력 시 검색이 실행된다 (자유게시판)", () => {
    renderWithRouter("/community/free");

    const input = screen.getByPlaceholderText("태그 검색...");
    fireEvent.change(input, { target: { value: "헬스" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/community/free?tag=%ED%97%AC%EC%8A%A4"
    );
  });

  it("Enter 키 입력 시 검색이 실행된다 (질문게시판)", () => {
    renderWithRouter("/community/question");

    const input = screen.getByPlaceholderText(
      "제목 검색: 검색어만 / 태그 검색: #운동"
    );
    fireEvent.change(input, { target: { value: "다이어트" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/community/question?keyword=%EB%8B%A4%EC%9D%B4%EC%96%B4%ED%8A%B8"
    );
  });

  it("빈 검색어로 검색 시 기본 경로로 이동 (자유게시판)", () => {
    renderWithRouter("/community/free?tag=test");

    const input = screen.getByPlaceholderText("태그 검색...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/community/free", {
      replace: true,
    });
  });

  it("빈 검색어로 검색 시 기본 경로로 이동 (질문게시판)", () => {
    renderWithRouter("/community/question?tag=test");

    const input = screen.getByPlaceholderText(
      "제목 검색: 검색어만 / 태그 검색: #운동"
    );
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("/community/question", {
      replace: true,
    });
  });

  it("검색어가 trim 처리된다", () => {
    renderWithRouter("/community/free");

    const input = screen.getByPlaceholderText("태그 검색...");
    fireEvent.change(input, { target: { value: "  운동  " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/community/free?tag=%EC%9A%B4%EB%8F%99"
    );
  });

  it("URL 쿼리 파라미터에서 초기 검색어를 로드한다", () => {
    render(
      <MemoryRouter initialEntries={["/community/free?tag=헬스"]}>
        <Routes>
          <Route path="/community/*" element={<SearchBar />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "태그 검색..."
    ) as HTMLInputElement;
    expect(input.value).toBe("#헬스");
  });
});
