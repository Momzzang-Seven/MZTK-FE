import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExerciseAuth from "../ExerciseAuth";
import { EXERCISE_TEXT } from "@constant/exercise";

const {
  mockNavigate,
  mockApplyWorkoutVerificationSuccess,
  mockFinishAnalysis,
  mockIssuePresignedUrls,
  mockShowSnackbar,
  mockStartAnalysis,
  mockUploadFileToPresignedUrl,
  mockSubmitWorkoutPhoto,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockApplyWorkoutVerificationSuccess: vi.fn(),
  mockFinishAnalysis: vi.fn(),
  mockIssuePresignedUrls: vi.fn(),
  mockShowSnackbar: vi.fn(),
  mockStartAnalysis: vi.fn(),
  mockUploadFileToPresignedUrl: vi.fn(),
  mockSubmitWorkoutPhoto: vi.fn(),
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
    submitWorkoutPhoto: mockSubmitWorkoutPhoto,
    submitWorkoutRecord: vi.fn(),
    getTodayWorkoutCompletion: vi.fn(),
  },
}));

describe("ExerciseAuth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "mock-url");
  });

  it("초기에는 업로드 버튼이 비활성화된다", () => {
    render(
      <BrowserRouter>
        <ExerciseAuth />
      </BrowserRouter>
    );

    expect(screen.getByText(EXERCISE_TEXT.TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER })
    ).toBeDisabled();
  });

  it("운동 사진 인증 성공 시 홈으로 이동한다", async () => {
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
    mockSubmitWorkoutPhoto.mockResolvedValue({
      verificationId: "verification-1",
      verificationKind: "WORKOUT_PHOTO",
      verificationStatus: "VERIFIED",
      rewardStatus: "SUCCEEDED",
      exerciseDate: null,
      completionStatus: "COMPLETED",
      grantedXp: 100,
      completedMethod: "WORKOUT_PHOTO",
      rejectionReasonCode: null,
      rejectionReasonDetail: null,
      failureCode: null,
    });

    render(
      <BrowserRouter>
        <ExerciseAuth />
      </BrowserRouter>
    );

    const file = new File(["test"], "exercise.png", { type: "image/png" });
    fireEvent.change(screen.getByTestId("photo-input"), {
      target: { files: [file] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER })
    );

    await waitFor(() => {
      expect(mockIssuePresignedUrls).toHaveBeenCalledWith({
        referenceType: "WORKOUT",
        images: ["exercise.png"],
      });
      expect(mockUploadFileToPresignedUrl).toHaveBeenCalledWith(
        "https://upload.example.com/test",
        file
      );
      expect(mockSubmitWorkoutPhoto).toHaveBeenCalledWith({
        tmpObjectKey: "private/workout/test.jpg",
      });
      expect(mockStartAnalysis).toHaveBeenCalledWith("exercise");
      expect(mockApplyWorkoutVerificationSuccess).toHaveBeenCalledWith({
        mode: "exercise",
        grantedXp: 100,
        exerciseDate: null,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("운동 사진 인증이 거절되면 한글 오류 문구를 표시한다", async () => {
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
    mockSubmitWorkoutPhoto.mockResolvedValue({
      verificationId: "verification-2",
      verificationKind: "WORKOUT_PHOTO",
      verificationStatus: "REJECTED",
      rewardStatus: "NOT_REQUESTED",
      exerciseDate: null,
      completionStatus: "NOT_COMPLETED",
      grantedXp: 0,
      completedMethod: null,
      rejectionReasonCode: "SCREEN_OR_UI",
      rejectionReasonDetail: null,
      failureCode: null,
    });

    render(
      <BrowserRouter>
        <ExerciseAuth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: {
        files: [new File(["test"], "exercise.png", { type: "image/png" })],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER })
    );

    await waitFor(() => {
      expect(mockFinishAnalysis).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        "화면이나 UI가 아닌 실제 운동 사진을 올려 주세요."
      );
    });
  });

  it("요청 실패 메시지를 한글로 표시한다", async () => {
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
    mockSubmitWorkoutPhoto.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          code: "VERIFICATION_002",
          message: "Invalid image extension for verification",
        },
      },
      message: "Request failed with status code 400",
    });

    render(
      <BrowserRouter>
        <ExerciseAuth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: {
        files: [new File(["test"], "exercise.png", { type: "image/png" })],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER })
    );

    await waitFor(() => {
      expect(mockFinishAnalysis).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        "인증에 사용할 수 없는 이미지 형식입니다. 다른 파일로 다시 시도해 주세요."
      );
    });
  });

  it("보상 반영이 진행 중이면 실패 스낵바를 띄우지 않는다", async () => {
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
    mockSubmitWorkoutPhoto.mockResolvedValue({
      verificationId: "verification-pending",
      verificationKind: "WORKOUT_PHOTO",
      verificationStatus: "VERIFIED",
      rewardStatus: "PENDING",
      exerciseDate: null,
      completionStatus: "NOT_COMPLETED",
      grantedXp: 0,
      completedMethod: null,
      rejectionReasonCode: null,
      rejectionReasonDetail: null,
      failureCode: null,
    });

    render(
      <BrowserRouter>
        <ExerciseAuth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: {
        files: [new File(["test"], "exercise.png", { type: "image/png" })],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER })
    );

    await waitFor(() => {
      expect(mockSubmitWorkoutPhoto).toHaveBeenCalledWith({
        tmpObjectKey: "private/workout/test.jpg",
      });
      expect(mockStartAnalysis).toHaveBeenCalledWith("exercise");
    });

    expect(mockApplyWorkoutVerificationSuccess).not.toHaveBeenCalled();
    expect(mockFinishAnalysis).not.toHaveBeenCalled();
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });
});
