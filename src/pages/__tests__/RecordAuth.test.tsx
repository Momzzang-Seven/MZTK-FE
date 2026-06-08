import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecordAuth from "../RecordAuth";
import { RECORD_TEXT } from "@constant/record";

const {
  mockNavigate,
  mockApplyWorkoutVerificationSuccess,
  mockFinishAnalysis,
  mockIssuePresignedUrls,
  mockShowSnackbar,
  mockStartAnalysis,
  mockUploadFileToPresignedUrl,
  mockSubmitWorkoutRecord,
  mockGetVerificationDetail,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockApplyWorkoutVerificationSuccess: vi.fn(),
  mockFinishAnalysis: vi.fn(),
  mockIssuePresignedUrls: vi.fn(),
  mockShowSnackbar: vi.fn(),
  mockStartAnalysis: vi.fn(),
  mockUploadFileToPresignedUrl: vi.fn(),
  mockSubmitWorkoutRecord: vi.fn(),
  mockGetVerificationDetail: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@store/userStore", () => ({
  useUserStore: () => ({
    applyWorkoutVerificationSuccess: mockApplyWorkoutVerificationSuccess,
    finishAnalysis: mockFinishAnalysis,
    showSnackbar: mockShowSnackbar,
    startAnalysis: mockStartAnalysis,
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
    getVerificationDetail: mockGetVerificationDetail,
  },
}));

describe("RecordAuth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    mockGetVerificationDetail.mockImplementation((verificationId: string) => {
      if (verificationId === "verification-4") {
        return Promise.resolve({
          verificationId,
          verificationKind: "WORKOUT_RECORD",
          verificationStatus: "REJECTED",
          rewardStatus: "NOT_REQUESTED",
          exerciseDate: null,
          rejectionReasonCode: "DATE_MISMATCH",
          rejectionReasonDetail: "visible date is not today",
          failureCode: null,
        });
      }
      return Promise.resolve({
        verificationId,
        verificationKind: "WORKOUT_RECORD",
        verificationStatus: "VERIFIED",
        rewardStatus: "SUCCEEDED",
        exerciseDate: "2026-04-25",
        rejectionReasonCode: null,
        rejectionReasonDetail: null,
        failureCode: null,
      });
    });
  });

  it("기록 이미지를 선택하면 업로드 버튼이 활성화된다", () => {
    render(
      <BrowserRouter>
        <RecordAuth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: {
        files: [new File(["test"], "record.png", { type: "image/png" })],
      },
    });

    expect(
      screen.getByRole("button", { name: RECORD_TEXT.BTN_REGISTER })
    ).not.toBeDisabled();
  });

  it("운동 기록 인증 성공 시 홈으로 이동한다", async () => {
    mockIssuePresignedUrls.mockResolvedValue({
      items: [
        {
          imageId: 1,
          presignedUrl: "https://upload.example.com/test",
          tmpObjectKey: "private/workout/test.jpg",
        },
      ],
    });
    mockUploadFileToPresignedUrl.mockResolvedValue(undefined);
    mockSubmitWorkoutRecord.mockResolvedValue({
      verificationId: "verification-3",
      verificationKind: "WORKOUT_RECORD",
      verificationStatus: "VERIFIED",
      rewardStatus: "SUCCEEDED",
      exerciseDate: "2026-04-25",
      completionStatus: "COMPLETED",
      grantedXp: 100,
      completedMethod: "WORKOUT_RECORD",
      rejectionReasonCode: null,
      rejectionReasonDetail: null,
      failureCode: null,
    });

    render(
      <BrowserRouter>
        <RecordAuth />
      </BrowserRouter>
    );

    const file = new File(["test"], "record.png", { type: "image/png" });
    fireEvent.change(screen.getByTestId("photo-input"), {
      target: { files: [file] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: RECORD_TEXT.BTN_REGISTER })
    );

    await waitFor(() => {
      expect(mockSubmitWorkoutRecord).toHaveBeenCalledWith({
        tmpObjectKey: "private/workout/test.jpg",
      });
      expect(mockStartAnalysis).toHaveBeenCalledWith("record");
      expect(mockApplyWorkoutVerificationSuccess).toHaveBeenCalledWith({
        mode: "record",
        grantedXp: 100,
        exerciseDate: "2026-04-25",
      });
    });

    // 성공 오버레이에서 '확인' 버튼 클릭
    const confirmBtn = screen.getByRole("button", { name: /확인/ });
    fireEvent.click(confirmBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("운동 기록 인증이 거절되면 한글 오류 문구를 표시한다", async () => {
    mockIssuePresignedUrls.mockResolvedValue({
      items: [
        {
          imageId: 1,
          presignedUrl: "https://upload.example.com/test",
          tmpObjectKey: "private/workout/test.jpg",
        },
      ],
    });
    mockUploadFileToPresignedUrl.mockResolvedValue(undefined);
    mockSubmitWorkoutRecord.mockResolvedValue({
      verificationId: "verification-4",
      verificationKind: "WORKOUT_RECORD",
      verificationStatus: "REJECTED",
      rewardStatus: "NOT_REQUESTED",
      exerciseDate: null,
      completionStatus: "NOT_COMPLETED",
      grantedXp: 0,
      completedMethod: null,
      rejectionReasonCode: "DATE_MISMATCH",
      rejectionReasonDetail: "visible date is not today",
      failureCode: null,
    });

    render(
      <BrowserRouter>
        <RecordAuth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: {
        files: [new File(["test"], "record.png", { type: "image/png" })],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: RECORD_TEXT.BTN_REGISTER })
    );

    await waitFor(() => {
      expect(mockFinishAnalysis).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        "오늘 운동 기록 화면이 맞는지 다시 확인해 주세요. 오늘 날짜가 보이는 기록 화면으로 다시 업로드해 주세요."
      );
    });
  });
});
