import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MarketDetail from "@pages/market/MarketDetail";

const mockGetMarketplaceClassDetail = vi.fn();
const mockGetImagesByIds = vi.fn();

vi.mock("@services", () => ({
  getMarketplaceClassDetail: (...args: unknown[]) =>
    mockGetMarketplaceClassDetail(...args),
  imageService: {
    getImagesByIds: (...args: unknown[]) => mockGetImagesByIds(...args),
  },
}));

const renderMarketDetail = () =>
  render(
    <MemoryRouter initialEntries={["/market/101"]}>
      <Routes>
        <Route path="/market/:id" element={<MarketDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe("MarketDetail image handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMarketplaceClassDetail.mockResolvedValue({
      classId: 101,
      title: "Public Class",
      category: "PT",
      description: "description",
      priceAmount: 300,
      durationMinutes: 60,
      tags: [],
      images: [
        {
          imageId: 1,
          imgOrder: 1,
          finalObjectKey: "market/classes/missing.jpg",
        },
      ],
      thumbnailFinalObjectKey: "market/classes/thumb.jpg",
      classTimes: [],
      store: {
        storeName: "Test Store",
        address: "Seoul",
        detailAddress: "2F",
        latitude: 37.5,
        longitude: 127.0,
      },
    });
  });

  it("uses public class image keys without protected metadata lookup", async () => {
    renderMarketDetail();

    const image = await screen.findByAltText("Public Class-0");

    expect(mockGetImagesByIds).not.toHaveBeenCalled();
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("market/classes/thumb.jpg")
    );
  });

  it("falls back to the placeholder when a public class image fails to load", async () => {
    renderMarketDetail();

    const image = await screen.findByAltText("Public Class-0");
    fireEvent.error(image);

    expect(image).toHaveAttribute("src", "/icon/gallery.svg");
  });
});
