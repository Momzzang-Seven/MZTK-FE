import { render, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Market from "@pages/market/Market";

const mockGetMarketClasses = vi.fn();

vi.mock("@services", () => ({
  getMarketClasses: (...args: unknown[]) => mockGetMarketClasses(...args),
}));

vi.mock("@hooks", () => ({
  useTokenBalance: () => ({ balance: "1000", loading: false }),
}));

vi.mock("@store/userStore", () => ({
  useUserStore: <T,>(selector: (state: unknown) => T) =>
    selector({
      gymLocation: { lat: 37.5665, lng: 126.978 },
    }),
}));

const emptyPage = {
  items: [],
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
};

const renderMarket = () =>
  render(
    <BrowserRouter>
      <Market />
    </BrowserRouter>
  );

describe("Market API QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMarketClasses.mockResolvedValue(emptyPage);
  });

  it("sends search keyword to the marketplace classes API", async () => {
    const { container } = renderMarket();

    await waitFor(() => {
      expect(mockGetMarketClasses).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, lat: 37.5665, lng: 126.978 })
      );
    });

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInstanceOf(HTMLInputElement);

    fireEvent.change(input as HTMLInputElement, {
      target: { value: "pilates" },
    });

    await waitFor(
      () => {
        expect(mockGetMarketClasses).toHaveBeenCalledWith(
          expect.objectContaining({ page: 0, keyword: "pilates" })
        );
      },
      { timeout: 1500 }
    );
  });

  it("loads the next marketplace classes page when the sentinel intersects", async () => {
    class MockIntersectionObserver {
      private readonly callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }

      observe() {
        window.setTimeout(() => {
          this.callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
          );
        }, 0);
      }

      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockGetMarketClasses.mockImplementation(({ page }: { page: number }) =>
      Promise.resolve(
        page === 0
          ? {
              items: [
                {
                  classId: 1,
                  title: "First class",
                  category: "PT",
                  priceAmount: 100,
                  durationMinutes: 50,
                  thumbnailFinalObjectKey: null,
                  tags: [],
                  distance: null,
                },
              ],
              currentPage: 0,
              totalPages: 2,
              totalElements: 2,
            }
          : {
              items: [
                {
                  classId: 2,
                  title: "Second class",
                  category: "YOGA",
                  priceAmount: 200,
                  durationMinutes: 60,
                  thumbnailFinalObjectKey: null,
                  tags: [],
                  distance: null,
                },
              ],
              currentPage: 1,
              totalPages: 2,
              totalElements: 2,
            }
      )
    );

    renderMarket();

    await waitFor(() => {
      expect(mockGetMarketClasses).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    vi.unstubAllGlobals();
  });
});
