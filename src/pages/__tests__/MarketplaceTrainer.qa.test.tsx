import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Market from "@pages/market/Market";
import MarketDetail from "@pages/market/MarketDetail";
import ReviewWrite from "@pages/market/ReviewWrite";
import TrainerStoreRegister from "@pages/trainer/TrainerStoreRegister";
import TrainerList from "@pages/trainer/TrainerList";
import RegisterTicket from "@pages/trainer/RegisterTicket";
import EditTicket from "@pages/trainer/EditTicket";
import TrainerReviews from "@pages/trainer/TrainerReviews";

const {
  mockGetMarketClasses,
  mockGetMarketplaceClassDetail,
  mockGetTrainerStore,
  mockUpsertTrainerStore,
  mockGetTrainerClasses,
  mockToggleTrainerClassStatus,
  mockRegisterTrainerClass,
  mockUpdateTrainerClass,
} = vi.hoisted(() => ({
  mockGetMarketClasses: vi.fn(),
  mockGetMarketplaceClassDetail: vi.fn(),
  mockGetTrainerStore: vi.fn(),
  mockUpsertTrainerStore: vi.fn(),
  mockGetTrainerClasses: vi.fn(),
  mockToggleTrainerClassStatus: vi.fn(),
  mockRegisterTrainerClass: vi.fn(),
  mockUpdateTrainerClass: vi.fn(),
}));

const sampleStore = {
  storeId: 1,
  storeName: "테스트 스토어",
  address: "서울시 중구",
  detailAddress: "2층",
  latitude: 37.5665,
  longitude: 126.978,
  phoneNumber: "02-1234-5678",
  homepageUrl: "https://example.com",
  instagramUrl: null,
  xProfileUrl: null,
};

const ptClass = {
  classId: 101,
  title: "아침 PT 클래스",
  category: "PT",
  priceAmount: 300,
  durationMinutes: 50,
  thumbnailFinalObjectKey: null,
  tags: ["근력", "초보"],
  distance: 1200,
};

const pilatesClass = {
  classId: 102,
  title: "저녁 필라테스",
  category: "PILATES",
  priceAmount: 250,
  durationMinutes: 40,
  thumbnailFinalObjectKey: null,
  tags: ["필라", "코어"],
  distance: 800,
};

const sampleClassDetail = {
  classId: 101,
  trainerId: 7,
  store: sampleStore,
  title: "아침 PT 클래스",
  category: "PT",
  description: "기초 근력과 자세를 함께 잡는 수업입니다.",
  priceAmount: 300,
  thumbnailFinalObjectKey: null,
  images: [],
  tags: ["근력", "초보"],
  features: ["1:1 자세 교정", "초보자 가능"],
  durationMinutes: 50,
  personalItems: "운동복",
  classTimes: [
    {
      timeId: 1,
      daysOfWeek: ["MONDAY", "WEDNESDAY"],
      startTime: "10:00:00",
      capacity: 4,
    },
  ],
};

const trainerClass = {
  classId: 101,
  title: "아침 PT 클래스",
  category: "PT",
  priceAmount: 300,
  tags: ["근력", "초보"],
  active: true,
  thumbnailFinalObjectKey: null,
};

vi.mock("@hooks", () => ({
  useTokenBalance: () => ({ balance: "1200" }),
}));

vi.mock("@services", () => ({
  getMarketClasses: mockGetMarketClasses,
  getMarketplaceClassDetail: mockGetMarketplaceClassDetail,
  getTrainerStore: mockGetTrainerStore,
  upsertTrainerStore: mockUpsertTrainerStore,
  getTrainerClasses: mockGetTrainerClasses,
  toggleTrainerClassStatus: mockToggleTrainerClassStatus,
  registerTrainerClass: mockRegisterTrainerClass,
  updateTrainerClass: mockUpdateTrainerClass,
}));

vi.mock("react-daum-postcode", () => ({
  default: () => <div data-testid="postcode" />,
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AdvancedMarker: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Map: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="google-map">{children}</div>
  ),
  Pin: () => <div data-testid="google-pin" />,
  useApiIsLoaded: () => true,
  useMap: () => ({ panTo: vi.fn() }),
}));

const renderWithRouter = (ui: React.ReactNode, route = "/") =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);

const renderRoute = (route: string, path: string, element: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();

  mockGetMarketClasses.mockResolvedValue({
    items: [ptClass, pilatesClass],
    currentPage: 0,
    totalPages: 1,
    totalElements: 2,
  });
  mockGetMarketplaceClassDetail.mockResolvedValue(sampleClassDetail);
  mockGetTrainerStore.mockResolvedValue(sampleStore);
  mockUpsertTrainerStore.mockResolvedValue({ storeId: 1 });
  mockGetTrainerClasses.mockResolvedValue({
    isSuspended: false,
    suspendedUntil: null,
    items: [trainerClass],
    currentPage: 0,
    totalPages: 1,
    totalElements: 1,
  });
  mockToggleTrainerClassStatus.mockResolvedValue({
    classId: 101,
    active: false,
  });
  mockRegisterTrainerClass.mockResolvedValue({ classId: 101 });
  mockUpdateTrainerClass.mockResolvedValue({ classId: 101 });
});

describe("예약 외 마켓플레이스/트레이너 QA", () => {
  it("마켓 목록에서 검색어와 카테고리 필터가 카드 표시를 좁힌다", async () => {
    renderWithRouter(<Market />, "/market");

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
      expect(screen.getByText("저녁 필라테스")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "요가/필라테스" }));

    expect(screen.queryByText("아침 PT 클래스")).not.toBeInTheDocument();
    expect(screen.getByText("저녁 필라테스")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("원하는 클래스나 태그를 검색해 보세요."),
      { target: { value: "없는 클래스" } }
    );

    expect(screen.getByText("등록된 클래스가 없습니다")).toBeInTheDocument();
  });

  it("마켓 상세에서 위치/후기 탭 상태를 렌더링한다", async () => {
    renderRoute("/market/101", "/market/:id", <MarketDetail />);

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "위치" }));
    expect(screen.getByText("서울시 중구 2층")).toBeInTheDocument();
    expect(screen.getByText("(테스트 스토어)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "후기(0)" }));
    expect(
      screen.getByText("리뷰 API가 아직 연결되지 않아 표시할 후기가 없습니다.")
    ).toBeInTheDocument();
  });

  it("수강평 작성 화면에서 빈 내용 검증 후 제출 성공 시 예약 내역으로 이동한다", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    try {
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

      fireEvent.click(screen.getByRole("button", { name: "후기 등록하기" }));
      expect(alertSpy).toHaveBeenCalledWith("후기 내용을 입력해주세요.");

      const submitButton = screen.getByRole("button", {
        name: "후기 등록하기",
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "트레이너님의 수업 방식이나 장소의 쾌적함 등 솔직한 후기를 남겨주세요!"
        ),
        { target: { value: "수업이 꼼꼼해서 좋았습니다." } }
      );

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      fireEvent.click(submitButton);

      expect(alertSpy).toHaveBeenCalledWith(
        "후기가 성공적으로 등록되었습니다!"
      );
      expect(await screen.findByText("예약 내역 화면")).toBeInTheDocument();
    } finally {
      alertSpy.mockRestore();
    }
  });

  it("트레이너 매장 수정 화면이 기존 값을 채우고 저장 요청을 보낸다", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    try {
      renderWithRouter(<TrainerStoreRegister />, "/trainer/store-register");

      await waitFor(() => {
        expect(screen.getByDisplayValue("테스트 스토어")).toBeInTheDocument();
      });

      fireEvent.change(screen.getByDisplayValue("테스트 스토어"), {
        target: { value: "수정 스토어" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "매장 정보 수정하기" })
      );

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
    } finally {
      alertSpy.mockRestore();
    }
  });

  it("트레이너 클래스 목록에서 활성 상태 토글 결과가 반영된다", async () => {
    renderWithRouter(<TrainerList />, "/trainer/list");

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });

    expect(screen.getByText("판매중")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(mockToggleTrainerClassStatus).toHaveBeenCalledWith(101);
      expect(screen.getByText("판매중지")).toBeInTheDocument();
    });
  });

  it("클래스 등록 화면은 매장 확인 후 사진 선택 단계로 진입한다", async () => {
    renderWithRouter(<RegisterTicket />, "/trainer/register-ticket");

    await waitFor(() => {
      expect(screen.getByText("클래스 등록")).toBeInTheDocument();
    });

    expect(mockGetTrainerStore).toHaveBeenCalled();
    expect(screen.getByText("사진을 선택해 주세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("클래스 수정 화면은 기존 클래스 정보를 초기값으로 채운다", async () => {
    renderRoute("/trainer/edit/101", "/trainer/edit/:id", <EditTicket />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("아침 PT 클래스")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("300")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
    expect(screen.getByDisplayValue("운동복")).toBeInTheDocument();
    expect(screen.getAllByText("10:00 ~ 10:50").length).toBeGreaterThan(0);
  });

  it("트레이너 후기 화면은 클래스별 필터링 상태를 반영한다", () => {
    renderWithRouter(<TrainerReviews />, "/trainer/reviews");

    expect(screen.getByText("전체 강좌 리뷰 평점")).toBeInTheDocument();
    expect(
      screen.getByText("체형 교정 & 코어 강화 소그룹 PT")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "1:1 집중 웨이트 트레이닝" },
    });

    expect(screen.getByText("선택한 클래스 평점")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "거북목이랑 라운드 숄더가 심해서 신청했는데 한 달 만에 어깨 통증이 많이 줄어든 게 느껴집니다. 그룹 수업이지만 개인별로 신경을 잘 써주십니다."
      )
    ).not.toBeInTheDocument();
  });
});
