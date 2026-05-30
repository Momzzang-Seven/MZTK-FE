import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecordAuth from "../RecordAuth";
import { RECORD_TEXT } from "@constant/record";

const {
  mockIssuePresignedUrls,
  mockUploadFileToPresignedUrl,
  mockSubmitWorkoutRecord,
} = vi.hoisted(() => ({
  mockIssuePresignedUrls: vi.fn(),
  mockUploadFileToPresignedUrl: vi.fn(),
  mockSubmitWorkoutRecord: vi.fn(),
}));

vi.mock("@store/userStore", () => ({
  useUserStore: () => ({
    applyWorkoutVerificationSuccess: vi.fn(),
    finishAnalysis: vi.fn(),
    showSnackbar: vi.fn(),
    startAnalysis: vi.fn(),
  }),
}));

vi.mock("@services/image", () => ({
  imageService: {
    issuePresignedUrls: mockIssuePresignedUrls,
    uploadFileToPresignedUrl: mockUploadFileToPresignedUrl,
  },
}));

vi.mock("@services/verification", () => ({
  verificationService: {
    submitWorkoutPhoto: vi.fn(),
    submitWorkoutRecord: mockSubmitWorkoutRecord,
    getTodayWorkoutCompletion: vi.fn(),
  },
}));

describe("RecordAuth edge validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "mock-url");
  });

  it("rejects non-image record proof files before presigned upload", () => {
    render(
      <BrowserRouter>
        <RecordAuth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: {
        files: [new File(["not image"], "record.txt", { type: "text/plain" })],
      },
    });

    expect(
      screen.getByRole("button", { name: RECORD_TEXT.BTN_REGISTER })
    ).toBeDisabled();
    expect(mockIssuePresignedUrls).not.toHaveBeenCalled();
    expect(screen.getByText(/record\.txt/)).toBeInTheDocument();
  });
});
