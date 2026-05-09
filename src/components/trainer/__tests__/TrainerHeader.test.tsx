import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TrainerHeader from "../TrainerHeader";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("TrainerHeader", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("title prop이 표시된다", () => {
    render(
      <MemoryRouter>
        <TrainerHeader title="트레이너 목록" />
      </MemoryRouter>
    );

    expect(screen.getByText("트레이너 목록")).toBeInTheDocument();
  });

  it("showBack=false일 때 뒤로가기 버튼이 숨겨진다", () => {
    render(
      <MemoryRouter>
        <TrainerHeader title="트레이너 목록" showBack={false} />
      </MemoryRouter>
    );

    const backButton = screen.queryByLabelText("back");
    expect(backButton).not.toBeInTheDocument();
  });

  it("showBack=true일 때 뒤로가기 버튼이 표시된다", () => {
    render(
      <MemoryRouter>
        <TrainerHeader title="트레이너 상세" showBack={true} />
      </MemoryRouter>
    );

    const backButton = screen.getByLabelText("back");
    expect(backButton).toBeInTheDocument();
  });

  it("뒤로가기 버튼 클릭 시 navigate(-1)이 호출된다", () => {
    render(
      <MemoryRouter>
        <TrainerHeader title="트레이너 상세" showBack={true} />
      </MemoryRouter>
    );

    const backButton = screen.getByLabelText("back");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("sticky 헤더 스타일이 적용된다", () => {
    const { container } = render(
      <MemoryRouter>
        <TrainerHeader title="트레이너 목록" showBack={true} />
      </MemoryRouter>
    );

    const header = container.querySelector(".sticky");
    expect(header).toBeInTheDocument();
  });

  it("border-bottom 스타일이 적용된다", () => {
    const { container } = render(
      <MemoryRouter>
        <TrainerHeader title="트레이너 목록" isLarge={false} />
      </MemoryRouter>
    );
    const header = container.querySelector(".border-b");
    expect(header).toBeInTheDocument();
  });
});
