import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MnemonicForm } from "@components/auth/MnemonicForm";

const defaultProps = {
  mnemonics: Array(12).fill(""),
  onChange: vi.fn(),
  onBulkChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe("MnemonicForm", () => {
  beforeEach(() => {
    defaultProps.onChange.mockClear();
    defaultProps.onBulkChange.mockClear();
    defaultProps.onSubmit.mockClear();
  });

  it("12개 단어를 입력칸에 붙여넣으면 전체 칸을 한 번에 채운다", () => {
    const words = [
      "alpha",
      "bravo",
      "charlie",
      "delta",
      "echo",
      "foxtrot",
      "golf",
      "hotel",
      "india",
      "juliet",
      "kilo",
      "lima",
    ];

    render(<MnemonicForm {...defaultProps} />);

    fireEvent.paste(screen.getAllByRole("textbox")[0], {
      clipboardData: {
        getData: () => `  ${words.join(" ")}  `,
      },
    });

    expect(defaultProps.onBulkChange).toHaveBeenCalledWith(words);
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it("여러 단어이지만 12개가 아니면 안내 메시지를 보여준다", () => {
    render(<MnemonicForm {...defaultProps} />);

    fireEvent.paste(screen.getAllByRole("textbox")[0], {
      clipboardData: {
        getData: () => "alpha bravo",
      },
    });

    expect(defaultProps.onBulkChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("12개 단어를 붙여넣어 주세요.")
    ).toBeInTheDocument();
  });
});
