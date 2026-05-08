import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserManagement from "../UserManagement";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ADMIN_TEXT } from "@constant/admin";

// 모킹
const mockFetchUsers = vi.fn();
const mockSearchUsers = vi.fn();
const mockSetStatusFilter = vi.fn();

vi.mock("@store/adminStore", () => ({
  useAdminStore: () => ({
    fetchUsers: mockFetchUsers,
    totalUsers: 100,
    blockedUsers: 5,
    searchUsers: mockSearchUsers,
    statusFilter: "ALL",
    setStatusFilter: mockSetStatusFilter,
  }),
}));

// UserTable 모킹 (상세 구현 테스트 제외)
vi.mock("@components/admin/user/UserTable", () => ({
  default: () => <div data-testid="user-table">User Table</div>,
}));

describe("Admin UserManagement Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("컴포넌트 마운트 시 사용자 목록을 가져온다", () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );

    expect(mockFetchUsers).toHaveBeenCalled();
  });

  it("사용자 통계 정보가 표시된다", () => {
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );

    expect(screen.getByText(ADMIN_TEXT.USER.TITLE_TOTAL)).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(ADMIN_TEXT.USER.TITLE_BANNED)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("검색 입력 시 searchUsers가 호출된다", () => {
    // AdminSearchBar 내부 구현에 의존하지 않고 전달되는 prop만 테스트하는 것이 좋지만
    // 여기서는 페이지 레벨에서의 통합 테스트 관점으로 접근
    render(
      <BrowserRouter>
        <UserManagement />
      </BrowserRouter>
    );

    // 검색창 필드 찾기 (AdminSearchBar 구현에 따라 다름)
    const searchInput = screen.getByPlaceholderText(
      ADMIN_TEXT.USER.SEARCH_PLACEHOLDER
    );
    fireEvent.change(searchInput, { target: { value: "testuser" } });

    // 검색바 내부의 검색 버튼 클릭이나 엔터 시뮬레이션 필요할 수 있음
    // 여기서는 간단하게 input 변경만 확인하거나 검색 버튼 클릭
    const searchButton = screen.getByRole("button", { name: /검색|search/i }); // 버튼 이름 확인 필요
    fireEvent.click(searchButton);

    expect(mockSearchUsers).toHaveBeenCalled();
  });
});
