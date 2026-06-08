import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("sends marketplace search to BE without unsupported params", async () => {
    mockGetMarketClasses.mockImplementation(
      ({ page, search }: { page: number; search?: string }) =>
        Promise.resolve(
          search === "pilates"
            ? {
                items: [
                  {
                    classId: 2,
                    title: "Evening Pilates",
                    category: "PILATES",
                    priceAmount: 200,
                    durationMinutes: 60,
                    thumbnailFinalObjectKey: null,
                    tags: ["balance"],
                    distance: null,
                  },
                ],
                currentPage: 0,
                totalPages: 1,
                totalElements: 1,
              }
            : page === 0
              ? {
                  items: [
                    {
                      classId: 1,
                      title: "Morning PT",
                      category: "PT",
                      priceAmount: 100,
                      durationMinutes: 50,
                      thumbnailFinalObjectKey: null,
                      tags: ["strength"],
                      distance: null,
                    },
                  ],
                  currentPage: 0,
                  totalPages: 1,
                  totalElements: 1,
                }
              : emptyPage
        )
    );

    const { container } = renderMarket();

    await waitFor(() => {
      expect(mockGetMarketClasses).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, lat: 37.5665, lng: 126.978 })
      );
    });
    mockGetMarketClasses.mockClear();

    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInstanceOf(HTMLInputElement);

    fireEvent.change(input as HTMLInputElement, {
      target: { value: "pilates" },
    });

    await waitFor(
      () => {
        expect(mockGetMarketClasses).toHaveBeenCalledWith(
          expect.objectContaining({ page: 0, search: "pilates" })
        );
      },
      { timeout: 1500 }
    );
    expect(await screen.findByText("Evening Pilates")).toBeInTheDocument();
    expect(screen.queryByText("Morning PT")).not.toBeInTheDocument();

    const params = mockGetMarketClasses.mock.calls.map(
      ([callParams]) => callParams as Record<string, unknown>
    );
    expect(
      params.every(
        (callParams) => !("keyword" in callParams) && !("status" in callParams)
      )
    ).toBe(true);
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

  it("binds marketplace thumbnail object keys to public image URLs", async () => {
    mockGetMarketClasses.mockResolvedValue({
      items: [
        {
          classId: 11,
          title: "Thumbnail PT",
          category: "PT",
          priceAmount: 100,
          durationMinutes: 50,
          thumbnailFinalObjectKey: "market/classes/thumb.jpg",
          tags: [],
          distance: null,
        },
      ],
      currentPage: 0,
      totalPages: 1,
      totalElements: 1,
    });

    renderMarket();

    const image = await screen.findByAltText("Thumbnail PT");
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining(
        "https://mztk-bucket.s3.ap-northeast-2.amazonaws.com/market/classes/thumb.jpg"
      )
    );
  });
});
