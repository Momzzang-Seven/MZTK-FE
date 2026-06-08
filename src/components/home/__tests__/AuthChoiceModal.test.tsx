import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthChoiceModal } from "../AuthChoiceModal";
import { HOME_TEXT } from "@constant/home";

const mockNavigate = vi.hoisted(() => vi.fn());

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

describe("AuthChoiceModal", () => {
  let appRoot: HTMLDivElement;

  beforeEach(() => {
    mockNavigate.mockClear();
    appRoot = document.createElement("div");
    appRoot.id = "app-root";
    document.body.appendChild(appRoot);
  });

  afterEach(() => {
    appRoot.remove();
  });

  it("앱 루트 안에 인증 선택 모달을 렌더링한다", () => {
    render(
      <MemoryRouter>
        <AuthChoiceModal isOpen onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(appRoot).toHaveTextContent("어떤 방법으로 인증하시겠어요?");
    expect(
      screen.getByRole("button", { name: "운동인증" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "기록인증" })
    ).toBeInTheDocument();
  });

  it("운동 인증을 선택하면 운동 인증 페이지로 이동하고 모달을 닫는다", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <AuthChoiceModal isOpen onClose={onClose} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "운동인증" }));

    expect(mockNavigate).toHaveBeenCalledWith("/exercise-auth");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("위치 인증을 선택하면 위치 인증 페이지로 이동하고 모달을 닫는다", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <AuthChoiceModal isOpen onClose={onClose} />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: HOME_TEXT.MODAL.LOCATION })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/verify");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("기록 인증을 선택하면 기록 업로드 페이지로 이동하고 모달을 닫는다", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <AuthChoiceModal isOpen onClose={onClose} />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: HOME_TEXT.MODAL.RECORD })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/record-auth");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
