import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import GlobalSnackbar from "../GlobalSnackbar";
import { useUserStore } from "@store/userStore";

describe("GlobalSnackbar", () => {
  beforeEach(() => {
    useUserStore.getState().reset();
  });

  it("느낌표가 없는 메시지에 느낌표를 추가하지 않는다", () => {
    useUserStore.getState().showSnackbar("다시 업로드해 주세요.");

    render(
      <BrowserRouter>
        <GlobalSnackbar />
      </BrowserRouter>
    );

    expect(screen.getByText("다시 업로드해 주세요.")).toBeInTheDocument();
    expect(
      screen.queryByText("다시 업로드해 주세요.!")
    ).not.toBeInTheDocument();
  });
});
