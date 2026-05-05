import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserTable from "../UserTable";
import { ADMIN_TEXT } from "@constant/admin";
import type { AdminUser } from "@store/adminStore";

const mockBanUser = vi.fn();
const mockUnbanUser = vi.fn();
const mockShowSnackbar = vi.fn();

const activeUser: AdminUser = {
  id: 1,
  nickname: "운동하는직장인",
  email: "fitness_lover@test.com",
  joinDate: "2024.02.03",
  status: "ACTIVE",
  postCount: 18,
  commentCount: 89,
  profileColor: "#FFA500",
  role: "TRAINER",
};

const bannedUser: AdminUser = {
  ...activeUser,
  id: 2,
  email: "villain@bad.com",
  status: "BANNED",
};

let filteredUsers: AdminUser[] = [activeUser];

vi.mock("@store/adminStore", async () => {
  const actual =
    await vi.importActual<typeof import("@store/adminStore")>(
      "@store/adminStore"
    );

  return {
    ...actual,
    useAdminStore: () => ({
      filteredUsers,
      isLoading: false,
      banUser: mockBanUser,
      unbanUser: mockUnbanUser,
    }),
  };
});

vi.mock("@store/userStore", () => ({
  useUserStore: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

describe("UserTable", () => {
  beforeEach(() => {
    filteredUsers = [activeUser];
    mockBanUser.mockReset();
    mockUnbanUser.mockReset();
    mockShowSnackbar.mockReset();
  });

  it("사용자 제한 성공 메시지를 표시한다", async () => {
    mockBanUser.mockResolvedValue(undefined);

    render(<UserTable />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "fitness_lover@test.com 사용자 제한",
      })
    );

    await waitFor(() => {
      expect(mockBanUser).toHaveBeenCalledWith(activeUser.id);
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        ADMIN_TEXT.USER.MSG_BAN_SUCCESS
      );
    });
  });

  it("사용자 제한 실패 메시지를 표시한다", async () => {
    mockBanUser.mockRejectedValue(new Error("failed"));

    render(<UserTable />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "fitness_lover@test.com 사용자 제한",
      })
    );

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        ADMIN_TEXT.USER.MSG_BAN_FAILED
      );
    });
  });

  it("사용자 제한 해제 성공 메시지를 표시한다", async () => {
    filteredUsers = [bannedUser];
    mockUnbanUser.mockResolvedValue(undefined);

    render(<UserTable />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "villain@bad.com 사용자 제한 해제",
      })
    );

    await waitFor(() => {
      expect(mockUnbanUser).toHaveBeenCalledWith(bannedUser.id);
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        ADMIN_TEXT.USER.MSG_UNBAN_SUCCESS
      );
    });
  });
});
