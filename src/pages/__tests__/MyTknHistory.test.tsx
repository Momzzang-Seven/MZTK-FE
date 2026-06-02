import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MyTknHistory from "@pages/MyTknHistory";

const { mockFetchTokenTransfers, mockIsTokenTransferRateLimitError } =
  vi.hoisted(() => ({
    mockFetchTokenTransfers: vi.fn(),
    mockIsTokenTransferRateLimitError: vi.fn(),
  }));

vi.mock("@services", () => ({
  fetchTokenTransfers: (...args: unknown[]) => mockFetchTokenTransfers(...args),
  isTokenTransferRateLimitError: (error: unknown) =>
    mockIsTokenTransferRateLimitError(error),
}));

vi.mock("@store", () => ({
  useUserStore: () => ({
    user: {
      walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  }),
}));

vi.mock("@utils/network", () => ({
  getNetworkConfig: () => ({
    NAME: "Base Sepolia",
  }),
}));

vi.mock("ethers", () => ({
  ethers: {
    formatUnits: vi.fn(() => "1"),
  },
}));

const renderHistory = () =>
  render(
    <MemoryRouter>
      <MyTknHistory />
    </MemoryRouter>
  );

describe("MyTknHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchTokenTransfers.mockResolvedValue([]);
    mockIsTokenTransferRateLimitError.mockReturnValue(false);
  });

  it("shows a retryable error state instead of an empty history on RPC rate limits", async () => {
    const rateLimitError = new Error("429 Too Many Requests");
    mockFetchTokenTransfers.mockRejectedValueOnce(rateLimitError);
    mockIsTokenTransferRateLimitError.mockReturnValueOnce(true);

    renderHistory();

    expect(
      await screen.findByText("거래 내역을 불러오지 못했습니다")
    ).toBeInTheDocument();
    expect(
      screen.getByText("요청이 많아 잠시 후 다시 시도해주세요.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeEnabled();

    await waitFor(() => {
      expect(mockFetchTokenTransfers).toHaveBeenCalledWith(
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        50
      );
    });
  });
});
