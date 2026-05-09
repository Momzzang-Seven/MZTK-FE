import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@pages/Home";
import ExerciseAuth from "@pages/ExerciseAuth";
import RecordAuth from "@pages/RecordAuth";
import Verify from "@pages/Verify";
import Market from "@pages/market/Market";
import MarketDetail from "@pages/market/MarketDetail";
import MarketPurchase from "@pages/market/MarketPurchase";
import MarketReservation from "@pages/market/MarketReservation";
import TrainerReservations from "@pages/trainer/TrainerReservations";
import TrainerList from "@pages/trainer/TrainerList";
import RegisterTicket from "@pages/trainer/RegisterTicket";
import AdminDashboard from "@pages/admin/Dashboard";
import UserManagement from "@pages/admin/UserManagement";
import PostManagement from "@pages/admin/PostManagement";
import { EXERCISE_TEXT } from "@constant/exercise";
import { RECORD_TEXT } from "@constant/record";
import { VERIFY_TEXT } from "@constant/location";

const {
  mockFetchPosts,
  mockFetchUsers,
  mockGetMarketClasses,
  mockGetMarketplaceClassDetail,
  mockGetClassReservationInfo,
  mockCreateClassReservation,
  mockGetMyReservations,
  mockGetReservationDetail,
  mockCancelMyReservation,
  mockCompleteMyReservation,
  mockGetTrainerReservations,
  mockGetTrainerReservationDetail,
  mockApproveTrainerReservation,
  mockRejectTrainerReservation,
  mockLocationStoreState,
  mockLevelUp,
  mockSearchPosts,
  mockSearchUsers,
  mockSetPostStatusFilter,
  mockSetRoleFilter,
  mockSetCoor,
  mockSetStatusFilter,
  mockBanUser,
  mockUnbanUser,
  mockGetTrainerClasses,
} = vi.hoisted(() => ({
  mockFetchPosts: vi.fn(),
  mockFetchUsers: vi.fn(),
  mockGetMarketClasses: vi.fn(),
  mockGetMarketplaceClassDetail: vi.fn(),
  mockGetClassReservationInfo: vi.fn(),
  mockCreateClassReservation: vi.fn(),
  mockGetMyReservations: vi.fn(),
  mockGetReservationDetail: vi.fn(),
  mockCancelMyReservation: vi.fn(),
  mockCompleteMyReservation: vi.fn(),
  mockGetTrainerReservations: vi.fn(),
  mockGetTrainerReservationDetail: vi.fn(),
  mockApproveTrainerReservation: vi.fn(),
  mockRejectTrainerReservation: vi.fn(),
  mockLocationStoreState: {
    coor: null as { lat: number; lng: number } | null,
  },
  mockLevelUp: vi.fn(),
  mockSearchPosts: vi.fn(),
  mockSearchUsers: vi.fn(),
  mockSetPostStatusFilter: vi.fn(),
  mockSetRoleFilter: vi.fn(),
  mockSetCoor: vi.fn(),
  mockSetStatusFilter: vi.fn(),
  mockBanUser: vi.fn(),
  mockUnbanUser: vi.fn(),
  mockGetTrainerClasses: vi.fn(),
}));

const mockUserStoreState = {
  gymLocation: {
    locationId: 1,
    lat: 37.5665,
    lng: 126.978,
    address: "서울시 중구",
  },
  initAttendance: vi.fn().mockResolvedValue(undefined),
  initLevel: vi.fn().mockResolvedValue(undefined),
  initLocation: vi.fn().mockResolvedValue(undefined),
  initWorkoutCompletion: vi.fn().mockResolvedValue(undefined),
  level: 5,
  xp: 80,
  maxXp: 100,
  levelUp: mockLevelUp,
  attendanceStreak: 3,
  hasAttendedToday: false,
  weeklyAttendance: { attendedCount: 3 },
  checkAttendance: vi.fn().mockResolvedValue(undefined),
  lastExerciseDate: null,
  analysisStatus: "idle",
  applyWorkoutVerificationSuccess: vi.fn(),
  completeExercise: vi.fn(),
  finishAnalysis: vi.fn(),
  showSnackbar: vi.fn(),
  startAnalysis: vi.fn(),
};

const sampleMarketClass = {
  classId: 101,
  title: "아침 PT 클래스",
  category: "PT",
  priceAmount: 300,
  durationMinutes: 50,
  thumbnailFinalObjectKey: null,
  tags: ["근력", "초보"],
  distance: 1200,
};

const sampleClassDetail = {
  classId: 101,
  trainerId: 7,
  store: {
    storeId: 1,
    storeName: "MZ 피트니스",
    address: "서울시 중구",
    detailAddress: "2층",
    latitude: 37.5665,
    longitude: 126.978,
  },
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

const sampleAdminPost = {
  id: 1,
  title: "관리자 테스트 게시글",
  content: "게시글 본문",
  author: "tester",
  profileColor: "#000000",
  date: "2026-04-30",
  category: "자유게시판",
  isBanned: false,
  likeCount: 0,
  commentCount: 0,
  comments: [],
};

const sampleAdminUser = {
  id: 1,
  nickname: "테스트회원",
  email: "fitness_lover@test.com",
  joinDate: "2026-04-30",
  status: "ACTIVE",
  role: "MEMBER",
  postCount: 3,
  commentCount: 7,
  profileColor: "#FAB12F",
};

vi.mock("@services", () => ({
  getMarketClasses: mockGetMarketClasses,
  getMarketplaceClassDetail: mockGetMarketplaceClassDetail,
  getClassReservationInfo: mockGetClassReservationInfo,
  createClassReservation: mockCreateClassReservation,
  getMyReservations: mockGetMyReservations,
  getReservationDetail: mockGetReservationDetail,
  cancelMyReservation: mockCancelMyReservation,
  completeMyReservation: mockCompleteMyReservation,
  getTrainerReservations: mockGetTrainerReservations,
  getTrainerReservationDetail: mockGetTrainerReservationDetail,
  approveTrainerReservation: mockApproveTrainerReservation,
  rejectTrainerReservation: mockRejectTrainerReservation,
  getTrainerClasses: mockGetTrainerClasses,
}));

vi.mock("@hooks", () => ({
  useTokenBalance: () => ({ balance: "1200" }),
  useAdminDashboardData: () => ({
    tokenLogs: [
      {
        id: "사용자 #0x1234",
        desc: "MZTK 전송",
        amount: "+100 MZTK",
      },
    ],
    ethBalance: "1.25",
    mztkBalance: "5000",
    userStats: {
      totalUserCount: 100,
      activeUserCount: 95,
      blockedUserCount: 5,
    },
    postStats: {
      postRemovalReasonStats: {
        SPAM: 10,
      },
      boardTypeSplit: {},
      targetTypeStats: {},
    },
    loading: false,
    error: null,
  }),
  useRegisterTicket: () => ({
    step: "photo",
    formData: {
      title: "",
      description: "",
      category: "PT",
      priceAmount: 0,
      durationMinutes: 60,
      personalItems: "",
      features: [],
      tags: [],
      classTimes: [],
    },
    imagePreviews: [],
    fileInputRef: { current: null },
    handleChange: vi.fn(),
    handleFeatureChange: vi.fn(),
    handleTagChange: vi.fn(),
    handleDayToggle: vi.fn(),
    handleAddTime: vi.fn(),
    handleRemoveTime: vi.fn(),
    handleImageChange: vi.fn(),
    removeImage: vi.fn(),
    triggerFileInput: vi.fn(),
    handleNext: vi.fn(),
    handleBack: vi.fn(),
    handleSubmit: vi.fn(),
    isSubmitDisabled: true,
    isCheckingStore: false,
    isSuccessModalOpen: false,
    setIsSuccessModalOpen: vi.fn(),
  }),
}));

vi.mock("@store", () => ({
  useUserStore: (selector?: (state: unknown) => unknown) =>
    selector ? selector(mockUserStoreState) : mockUserStoreState,
  useAuthModalStore: () => ({ isUnauthorized: false }),
  useLocationStore: () => ({
    ...mockLocationStoreState,
    setCoor: mockSetCoor,
  }),
  // AdminDashboard는 @store에서 useAdminStore를 import함
  useAdminStore: () => ({
    selectedChainId: "84532",
    setSelectedChainId: vi.fn(),
    fetchUsers: mockFetchUsers,
    filteredUsers: [],
    filteredPosts: [],
    fetchPosts: mockFetchPosts,
    isLoading: false,
  }),
}));

vi.mock("@store/userStore", () => ({
  useUserStore: (selector?: (state: unknown) => unknown) =>
    selector ? selector(mockUserStoreState) : mockUserStoreState,
}));

vi.mock("@store/adminStore", () => ({
  useAdminStore: () => ({
    fetchUsers: mockFetchUsers,
    totalUsers: 100,
    blockedUsers: 5,
    searchUsers: mockSearchUsers,
    statusFilter: "ALL",
    setStatusFilter: mockSetStatusFilter,
    roleFilter: "ALL",
    setRoleFilter: mockSetRoleFilter,
    filteredUsers: [sampleAdminUser],
    isLoading: false,
    banUser: mockBanUser,
    unbanUser: mockUnbanUser,
    filteredPosts: [sampleAdminPost],
    fetchPosts: mockFetchPosts,
    searchPosts: mockSearchPosts,
    banPost: vi.fn().mockResolvedValue(undefined),
    unbanPost: vi.fn().mockResolvedValue(undefined),
    deleteComment: vi.fn().mockResolvedValue(undefined),
    restoreComment: vi.fn().mockResolvedValue(undefined),
    hasMore: false,
    isFetchingPosts: false,
    postStatusFilter: "ALL",
    setPostStatusFilter: mockSetPostStatusFilter,
    // AdminDashboard에서 사용하는 필드
    selectedChainId: "84532",
    setSelectedChainId: vi.fn(),
  }),
}));

vi.mock("react-chartjs-2", () => ({
  Pie: () => <div data-testid="mock-pie-chart" />,
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

const getGuideText = (text: string) =>
  screen.getByText((_, element) => {
    return (
      element?.tagName.toLowerCase() === "p" &&
      (element.textContent?.includes(text) ?? false)
    );
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockLocationStoreState.coor = null;
  mockLevelUp.mockResolvedValue({
    success: true,
    message: "레벨업 완료",
  });
  mockGetMarketClasses.mockResolvedValue({
    items: [sampleMarketClass],
    currentPage: 0,
    totalPages: 1,
    totalElements: 1,
  });
  mockGetMarketplaceClassDetail.mockResolvedValue(sampleClassDetail);
  mockGetClassReservationInfo.mockResolvedValue({
    classId: 101,
    classTitle: "아침 PT 클래스",
    trainerId: 7,
    priceAmount: 300,
    durationMinutes: 50,
    availableDates: [
      {
        date: "2026-05-04",
        availableTimes: [
          {
            slotId: 1,
            startTime: "10:00:00",
            capacity: 4,
            availableCapacity: 3,
          },
        ],
      },
    ],
  });
  mockCreateClassReservation.mockResolvedValue({
    reservationId: 1,
    status: "PENDING",
  });
  mockGetMyReservations.mockResolvedValue({
    reservations: [],
    hasNext: false,
    nextCursor: null,
  });
  mockGetReservationDetail.mockResolvedValue({
    reservationId: 1,
    slotId: 1,
    trainerId: 7,
    userId: 2,
    reservationDate: "2026-05-04",
    reservationTime: "10:00:00",
    durationMinutes: 50,
    status: "PENDING",
    userRequest: null,
    orderId: null,
    txHash: null,
    createdAt: "2026-05-01T00:00:00",
    updatedAt: "2026-05-01T00:00:00",
  });
  mockCancelMyReservation.mockResolvedValue({
    reservationId: 1,
    status: "USER_CANCELLED",
  });
  mockCompleteMyReservation.mockResolvedValue({
    reservationId: 1,
    status: "SETTLED",
  });
  mockGetTrainerReservations.mockResolvedValue({
    reservations: [],
    hasNext: false,
    nextCursor: null,
  });
  mockGetTrainerReservationDetail.mockResolvedValue({
    reservationId: 1,
    slotId: 1,
    trainerId: 7,
    userId: 2,
    reservationDate: "2026-05-04",
    reservationTime: "10:00:00",
    durationMinutes: 50,
    status: "PENDING",
    userRequest: null,
    orderId: null,
    txHash: null,
    createdAt: "2026-05-01T00:00:00",
    updatedAt: "2026-05-01T00:00:00",
  });
  mockApproveTrainerReservation.mockResolvedValue({
    reservationId: 1,
    status: "APPROVED",
  });
  mockRejectTrainerReservation.mockResolvedValue({
    reservationId: 1,
    status: "REJECTED",
  });
  mockGetTrainerClasses.mockResolvedValue({
    items: [
      {
        classId: 1,
        title: "테스트 클래스",
        category: "PT",
        priceAmount: 100,
        active: true,
        thumbnailFinalObjectKey: null,
      },
    ],
    isSuspended: false,
  });
});

describe("주요 페이지 smoke test", () => {
  it("홈 화면이 핵심 CTA까지 렌더링된다", async () => {
    renderWithRouter(<Home />);

    // AttendanceBanner 텍스트
    expect(screen.getByText("출석 챌린지")).toBeInTheDocument();
    // AuthActionButtons aria-label match
    expect(
      screen.getByRole("button", { name: /운동 인증/i })
    ).toBeInTheDocument();
  });

  it("운동 사진 인증 화면이 업로드 CTA까지 렌더링된다", () => {
    renderWithRouter(<ExerciseAuth />, "/exercise-auth");

    expect(screen.getByText(EXERCISE_TEXT.TITLE)).toBeInTheDocument();
    expect(getGuideText(EXERCISE_TEXT.GUIDE_TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER })
    ).toBeDisabled();
  });

  it("운동 기록 인증 화면이 업로드 CTA까지 렌더링된다", () => {
    renderWithRouter(<RecordAuth />, "/record-auth");

    expect(screen.getByText(RECORD_TEXT.TITLE)).toBeInTheDocument();
    expect(getGuideText(RECORD_TEXT.GUIDE_TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: RECORD_TEXT.BTN_REGISTER })
    ).toBeDisabled();
  });

  it("위치 인증 화면이 거리 상태와 인증 CTA를 렌더링한다", async () => {
    mockLocationStoreState.coor = { lat: 37.5665, lng: 126.978 };

    renderWithRouter(<Verify />, "/verify");

    await waitFor(() => {
      expect(
        screen.getByText(
          `${VERIFY_TEXT.DISTANCE_PREFIX}0${VERIFY_TEXT.DISTANCE_UNIT}`
        )
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: VERIFY_TEXT.BTN_VERIFY })
    ).toBeInTheDocument();
  });

  it("마켓 목록 화면이 API 응답으로 클래스 카드를 렌더링한다", async () => {
    renderWithRouter(<Market />, "/market");

    // 마켓 헤더 텍스트
    expect(screen.getByText("완벽한 운동 클래스")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });
  });

  it("마켓 목록 화면이 빈 응답을 빈 상태로 렌더링한다", async () => {
    mockGetMarketClasses.mockResolvedValueOnce({
      items: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
    });

    renderWithRouter(<Market />, "/market");

    await waitFor(() => {
      expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
    });
  });

  it("마켓 목록 API 실패 시 에러 상태를 렌더링한다", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetMarketClasses.mockRejectedValueOnce(new Error("network error"));

    try {
      renderWithRouter(<Market />, "/market");

      await waitFor(() => {
        expect(
          screen.getByText(/클래스 목록을 불러오지 못했습니다/i)
        ).toBeInTheDocument();
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("마켓 상세 화면이 클래스 상세 정보를 렌더링한다", async () => {
    renderRoute("/market/101", "/market/:id", <MarketDetail />);

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });
    expect(screen.getByText("프로그램 소개")).toBeInTheDocument();
    // 실제 버튼 텍스트
    expect(screen.getByText("지금 예약하기")).toBeInTheDocument();
  });

  it("마켓 상세 API 실패 시 에러 상태를 렌더링한다", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetMarketplaceClassDetail.mockRejectedValueOnce(
      new Error("detail network error")
    );

    try {
      renderRoute("/market/101", "/market/:id", <MarketDetail />);

      await waitFor(() => {
        expect(
          screen.getByText(/클래스 상세를 불러오지 못했습니다/i)
        ).toBeInTheDocument();
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("마켓 구매 화면이 예약 날짜와 결제 버튼을 렌더링한다", async () => {
    renderRoute(
      "/market/purchase/101",
      "/market/purchase/:id",
      <MarketPurchase />
    );

    await waitFor(() => {
      expect(screen.getByText("아침 PT 클래스")).toBeInTheDocument();
    });
    // 실제 컴포넌트의 날짜 섹션 및 버튼 텍스트 확인
    expect(screen.getByText("예약 날짜 선택")).toBeInTheDocument();
  });

  it("마켓 구매 API 실패 시 에러 상태를 렌더링한다", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetMarketplaceClassDetail.mockRejectedValueOnce(
      new Error("purchase network error")
    );

    try {
      renderRoute(
        "/market/purchase/101",
        "/market/purchase/:id",
        <MarketPurchase />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/클래스 정보를 불러오지 못했습니다/i)
        ).toBeInTheDocument();
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("마켓 예약 내역 화면이 탭과 빈 상태를 렌더링한다", async () => {
    renderWithRouter(<MarketReservation />, "/market/reservations");

    expect(screen.getByText("예약 및 이용 내역")).toBeInTheDocument();
    expect(screen.getByText("진행 중")).toBeInTheDocument();
    expect(screen.getByText("지난 내역")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("내역이 없습니다")).toBeInTheDocument();
    });
  });

  it("트레이너 예약 확인 화면이 탭과 빈 상태를 렌더링한다", async () => {
    renderWithRouter(<TrainerReservations />, "/trainer/reservations");

    expect(screen.getByText("예약 확인하기")).toBeInTheDocument();
    expect(screen.getByText("승인 대기")).toBeInTheDocument();
    expect(screen.getByText("확정")).toBeInTheDocument();
    await waitFor(() => {
      // 빈 상태 메시지
      expect(screen.getByText("내역이 없습니다")).toBeInTheDocument();
    });
  });

  it("트레이너 클래스 목록 화면이 운영 중인 클래스를 렌더링한다", async () => {
    renderWithRouter(<TrainerList />, "/trainer/list");

    expect(screen.getByText("내 클래스 목록")).toBeInTheDocument();
    expect(screen.getByText("운영 중인 클래스")).toBeInTheDocument();
    expect(screen.getByText("매니지먼트 가이드")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("테스트 클래스")).toBeInTheDocument();
    });
  });

  it("트레이너 클래스 등록 화면이 멀티스텝의 첫 단계를 렌더링한다", () => {
    renderWithRouter(<RegisterTicket />, "/trainer/register-ticket");

    expect(screen.getByText("사진 등록")).toBeInTheDocument();
    expect(
      screen.getByText("수업의 분위기를 보여줄 사진을 등록해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByText("PRO TIP")).toBeInTheDocument();
  });

  it("관리자 대시보드가 주요 카드와 차트 영역을 렌더링한다", () => {
    renderWithRouter(<AdminDashboard />, "/admin/dashboard");

    // 실제 렌더링되는 텍스트 확인 (영문)
    expect(screen.getByTestId("mock-pie-chart")).toBeInTheDocument();
    // 토큰 로그 섹션의 실제 데이터 (hook mock에서 제공)
    expect(screen.getByText("MZTK 전송")).toBeInTheDocument();
  });

  it("관리자 사용자 관리 화면이 통계와 필터를 렌더링한다", () => {
    renderWithRouter(<UserManagement />, "/admin/users");

    expect(mockFetchUsers).toHaveBeenCalled();
    expect(screen.getByText("총 사용자")).toBeInTheDocument();
    expect(screen.getByText("정지된 사용자")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(screen.getByText("fitness_lover@test.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "fitness_lover@test.com 사용자 제한",
      })
    ).toBeInTheDocument();
  });

  it("관리자 게시글 관리 화면이 게시글 목록을 렌더링한다", () => {
    renderWithRouter(<PostManagement />, "/admin/posts");

    expect(mockFetchPosts).toHaveBeenCalledWith(true);
    expect(screen.getByText("관리자 테스트 게시글")).toBeInTheDocument();
  });
});
