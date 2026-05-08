import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Onboarding from "../Onboarding";
import { describe, it, expect, vi, beforeEach } from "vitest";

// useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

describe("Onboarding Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("온보딩 제목과 설명이 올바르게 렌더링된다", () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/지갑을.*생성\/연결 해볼까요\?/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/이미 사용 중인 지갑이 없다면/)
    ).toBeInTheDocument();
  });

  it("지갑 생성하기 버튼 클릭 시 /create-wallet으로 이동한다", () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    const createButton = screen.getByRole("button", { name: "지갑 생성하기" });
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/create-wallet");
  });

  it("지갑 등록하기 버튼 클릭 시 /register-wallet으로 이동한다", () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole("button", {
      name: "지갑 등록하기",
    });
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register-wallet");
  });
});
