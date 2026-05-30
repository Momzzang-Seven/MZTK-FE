import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_TEXT } from "@constant/admin";
import AdminAccountManagement from "../AdminAccountManagement";

const mockFetchAccounts = vi.fn();
const mockAddAdminAccount = vi.fn();
const mockResetPassword = vi.fn();
const mockShowSnackbar = vi.fn();
const mockOpenConfirm = vi.fn();

vi.mock("@store", () => ({
  useAdminStore: () => ({
    adminAccounts: [],
    fetchAccounts: mockFetchAccounts,
    addAdminAccount: mockAddAdminAccount,
    resetPassword: mockResetPassword,
    isLoading: false,
  }),
  useUserStore: () => ({
    showSnackbar: mockShowSnackbar,
  }),
  useConfirmModalStore: () => ({
    openConfirm: mockOpenConfirm,
  }),
}));

describe("AdminAccountManagement QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the generated admin password returned by the backend", async () => {
    mockAddAdminAccount.mockResolvedValue({
      loginId: "admin-qa",
      generatedPassword: "qa-generated-password",
    });

    render(<AdminAccountManagement />);

    fireEvent.click(
      screen.getByRole("button", {
        name: ADMIN_TEXT.ACCOUNTS.BTN_ADD.toUpperCase(),
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: ADMIN_TEXT.ACCOUNTS.MODAL.BTN_CREATE,
      })
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("admin-qa")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("qa-generated-password")
      ).toBeInTheDocument();
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      ADMIN_TEXT.ACCOUNTS.MSG_CREATE_SUCCESS
    );
  });
});
