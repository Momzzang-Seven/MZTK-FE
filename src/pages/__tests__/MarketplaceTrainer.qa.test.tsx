import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import Market from "@pages/market/Market";
import MarketDetail from "@pages/market/MarketDetail";
import ReviewWrite from "@pages/market/ReviewWrite";
import TrainerStoreRegister from "@pages/trainer/TrainerStoreRegister";
import TrainerList from "@pages/trainer/TrainerList";
import RegisterTicket from "@pages/trainer/RegisterTicket";
import TrainerReviews from "@pages/trainer/TrainerReviews";
import EditTicket from "@pages/trainer/EditTicket";

// Mocking Services
const mockGetMarketClasses = vi.fn();
const mockGetMarketplaceClassDetail = vi.fn();
const mockUpsertTrainerStore = vi.fn();
const mockGetTrainerStore = vi.fn();
const mockGetTrainerClasses = vi.fn();
const mockToggleTrainerClassStatus = vi.fn();

vi.mock("@services", () => ({
  getMarketClasses: (...args: unknown[]) => mockGetMarketClasses(...args),
  getMarketplaceClassDetail: (...args: unknown[]) =>
    mockGetMarketplaceClassDetail(...args),
  upsertTrainerStore: (...args: unknown[]) => mockUpsertTrainerStore(...args),
  getTrainerStore: (...args: unknown[]) => mockGetTrainerStore(...args),
  getTrainerClasses: (...args: unknown[]) => mockGetTrainerClasses(...args),
  toggleTrainerClassStatus: (...args: unknown[]) =>
    mockToggleTrainerClassStatus(...args),
}));

// Mocking Hooks
vi.mock("@hooks", () => ({
  useTokenBalance: () => ({ balance: "1000", isLoading: false }),
}));

// Mocking Store
vi.mock("@store/userStore", () => ({
  useUserStore: <T,>(selector: (state: unknown) => T) =>
    selector({
      gymLocation: { lat: 37.5665, lng: 126.978 },
    }),
}));

const renderWithRouter = (ui: React.ReactElement, route = "/") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/market/:id" element={ui} />
        <Route path="/market/review/:id" element={ui} />
        <Route path="/trainer/edit/:id" element={ui} />
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe("예약 외 마켓플레이스/트레이너 QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Google Maps mock
    (window as unknown as { google: unknown }).google = {
      maps: {
        Geocoder: class {
          geocode(_: unknown, cb: (results: unknown, status: string) => void) {
            cb(
              [
                {
                  geometry: { location: { lat: () => 37.5, lng: () => 127.0 } },
                },
              ],
              "OK"
            );
          }
        },
        GeocoderStatus: { OK: "OK" },
        LatLng: class {
          lat: number;
          lng: number;
          constructor(lat: number, lng: number) {
            this.lat = lat;
            this.lng = lng;
          }
        },
      },
    };

    // Default mock returns
    mockGetMarketClasses.mockResolvedValue({ items: [] });
    mockGetTrainerStore.mockResolvedValue({ storeName: "테스트 스토어" });
    mockGetTrainerClasses.mockResolvedValue([]);
  });

  it("마켓 목록에서 검색어와 카테고리 필터가 카드 표시를 좁힌다", async () => {
    mockGetMarketClasses.mockResolvedValue({
      items: [
        {
          classId: 101,
          title: "아침 PT 클래스",
          category: "PT",
          priceAmount: 300,
          tags: ["다이어트"],
          distance: 500,
        },
        {
          classId: 102,
          title: "저녁 필라테스",
          category: "PILATES",
          priceAmount: 500,
          tags: ["재활"],
          distance: 800,
        },
      ],
    });

    render(
      <BrowserRouter>
        <Market />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });

    // 카테고리 필터링 (필라테스 탭 클릭)
    fireEvent.click(screen.getByRole("button", { name: "필라테스" }));
    expect(screen.queryByText("아침 PT 클래스")).not.toBeInTheDocument();
    expect(screen.getByText("저녁 필라테스")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("어떤 운동을 찾으시나요?");
    fireEvent.change(searchInput, { target: { value: "없는 클래스" } });

    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  it("마켓 상세에서 위치/후기 탭 상태를 렌더링한다", async () => {
    mockGetMarketplaceClassDetail.mockResolvedValue({
      classId: 101,
      title: "아침 PT 클래스",
      category: "PT",
      description: "설명",
      priceAmount: 300,
      durationMinutes: 60,
      tags: ["태그"],
      images: [],
      classTimes: [],
      store: {
        storeName: "테스트 스토어",
        address: "서울시 중구",
        detailAddress: "2층",
        latitude: 37.5,
        longitude: 127.0,
      },
    });

    renderWithRouter(<MarketDetail />, "/market/101");

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("위치 정보"));
    expect(screen.getByText("주소 및 연락처")).toBeInTheDocument();
    expect(screen.getAllByText(/테스트 스토어/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("이용 후기"));
    expect(
      screen.getByText("리뷰 API가 아직 연결되지 않아 표시할 후기가 없습니다.")
    ).toBeInTheDocument();
  });

  it("수강평 작성 화면에서 빈 내용 검증 후 제출 성공 시 예약 내역으로 이동한다", async () => {
    render(
      <MemoryRouter initialEntries={["/market/review/101"]}>
        <Routes>
          <Route path="/market/review/:id" element={<ReviewWrite />} />
          <Route
            path="/market/reservations"
            element={<div>예약 내역 화면</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("후기 등록 완료"));
    expect(screen.getByText("내용 미입력")).toBeInTheDocument();
    fireEvent.click(screen.getByText("확인"));

    fireEvent.change(
      screen.getByPlaceholderText(
        "수업 방식이나 장소의 쾌적함 등 다른 회원들에게 도움이 될 만한 이야기를 들려주세요!"
      ),
      { target: { value: "수업이 꼼꼼해서 좋았습니다." } }
    );

    fireEvent.click(screen.getByText("후기 등록 완료"));
    expect(screen.getByText("등록 완료")).toBeInTheDocument();
    fireEvent.click(screen.getByText("확인"));

    expect(await screen.findByText("예약 내역 화면")).toBeInTheDocument();
  });

  it("트레이너 매장 수정 화면이 기존 값을 채우고 저장 요청을 보낸다", async () => {
    mockGetTrainerStore.mockResolvedValue({
      storeName: "테스트 스토어",
      address: "서울시 중구",
      detailAddress: "2층",
      latitude: 37.5,
      longitude: 127.0,
      phoneNumber: "02-1234-5678",
    });

    renderWithRouter(<TrainerStoreRegister />, "/trainer/store-register");

    await waitFor(() => {
      expect(screen.getByDisplayValue("테스트 스토어")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue("테스트 스토어"), {
      target: { value: "수정 스토어" },
    });
    fireEvent.click(screen.getByText("정보 수정 완료"));

    await waitFor(() => {
      expect(mockUpsertTrainerStore).toHaveBeenCalledWith(
        expect.objectContaining({
          storeName: "수정 스토어",
          address: "서울시 중구",
          detailAddress: "2층",
          phoneNumber: "02-1234-5678",
        })
      );
    });
  });

  it("트레이너 클래스 목록에서 활성 상태 토글 결과가 반영된다", async () => {
    mockGetTrainerClasses.mockResolvedValue({
      items: [
        {
          classId: 101,
          title: "아침 PT 클래스",
          category: "PT",
          priceAmount: 300,
          active: true,
        },
      ],
      isSuspended: false,
    });
    mockToggleTrainerClassStatus.mockResolvedValue({ active: false });

    renderWithRouter(<TrainerList />, "/trainer/list");

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });

    expect(screen.getByText("수강생에게 공개 중")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(mockToggleTrainerClassStatus).toHaveBeenCalledWith(101);
      expect(screen.getByText("수강생에게 비공개")).toBeInTheDocument();
    });
  });

  it("클래스 등록 화면은 매장 확인 후 사진 선택 단계로 진입한다", async () => {
    renderWithRouter(<RegisterTicket />, "/trainer/register-ticket");

    expect(
      await screen.findByText("대표 사진을 선택하세요")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "다음으로" })).toBeDisabled();
  });

  it("클래스 수정 화면은 기존 클래스 정보를 초기값으로 채운다", async () => {
    mockGetMarketplaceClassDetail.mockResolvedValue({
      classId: 101,
      title: "기존 타이틀",
      category: "PT",
      description: "기존 설명",
      priceAmount: 300,
      capacity: 5,
      durationMinutes: 60,
      personalItems: "운동복",
      tags: ["기존태그"],
      features: ["특징1"],
      images: [],
      classTimes: [],
      store: { storeName: "스토어" },
    });

    // Use specific path for edit ticket
    renderWithRouter(<EditTicket />, "/trainer/edit/101");

    await waitFor(() => {
      expect(screen.getByDisplayValue("기존 타이틀")).toBeInTheDocument();
      expect(screen.getByDisplayValue("운동복")).toBeInTheDocument();
    });
  });

  it("트레이너 후기 화면이 준비 중임을 표시한다", () => {
    render(
      <BrowserRouter>
        <TrainerReviews />
      </BrowserRouter>
    );
    expect(screen.getByText(/후기 시스템 고도화 중/i)).toBeInTheDocument();
  });
});
