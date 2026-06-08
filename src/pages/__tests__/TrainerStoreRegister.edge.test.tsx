import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrainerStoreRegister from "../trainer/TrainerStoreRegister";

const mockGetTrainerStore = vi.fn();
const mockUpsertTrainerStore = vi.fn();

vi.mock("@services", () => ({
  getTrainerStore: (...args: unknown[]) => mockGetTrainerStore(...args),
  upsertTrainerStore: (...args: unknown[]) => mockUpsertTrainerStore(...args),
}));

const existingStore = {
  storeName: "QA Store",
  address: "Seoul Jung-gu",
  detailAddress: "2F",
  latitude: 37.5,
  longitude: 127.0,
  phoneNumber: "02-1234-5678",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <TrainerStoreRegister />
    </MemoryRouter>
  );

const getSaveButton = () => {
  const button = screen
    .getAllByRole("button")
    .find((candidate) => candidate.className.includes("shadow-xl"));
  if (!button) throw new Error("save button not found");
  return button;
};

describe("TrainerStoreRegister edge validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsertTrainerStore.mockResolvedValue(undefined);
  });

  it("shows a visible error and blocks incomplete Korean phone numbers", async () => {
    mockGetTrainerStore.mockResolvedValue({
      ...existingStore,
      phoneNumber: "010",
    });

    renderPage();

    expect(
      await screen.findByText("올바른 국내 전화번호를 끝까지 입력해 주세요.")
    ).toBeInTheDocument();
    expect(getSaveButton()).toBeDisabled();
    expect(mockUpsertTrainerStore).not.toHaveBeenCalled();
  });

  it("rejects unsafe URLs before saving the trainer store", async () => {
    mockGetTrainerStore.mockResolvedValue({
      ...existingStore,
      homepageUrl: "https://example.com/",
    });

    renderPage();

    const homepageInput = await screen.findByDisplayValue(
      "https://example.com/"
    );
    fireEvent.change(homepageInput, {
      target: { value: "ftp://example.com/<script>" },
    });
    fireEvent.click(getSaveButton());

    expect(await screen.findByText("URL 형식 오류")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockUpsertTrainerStore).not.toHaveBeenCalled();
    });
  });
});
