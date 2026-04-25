import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExerciseAuth from "../ExerciseAuth";
import { EXERCISE_TEXT } from "@constant/exercise";

const {
  mockNavigate,
  mockApplyWorkoutVerificationSuccess,
  mockIssuePresignedUrls,
  mockUploadFileToPresignedUrl,
  mockSubmitWorkoutPhoto,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockApplyWorkoutVerificationSuccess: vi.fn(),
  mockIssuePresignedUrls: vi.fn(),
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
      </BrowserRouter>,
    );

    expect(screen.getByText(EXERCISE_TEXT.TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER }),
    ).toBeDisabled();
  });

  it("운동 사진 인증 성공 시 업로드 후 홈으로 이동한다", async () => {
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
      </BrowserRouter>,
    );

    const file = new File(["test"], "exercise.png", { type: "image/png" });
    fireEvent.change(screen.getByTestId("photo-input"), {
      target: { files: [file] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER }),
    );

    await waitFor(() => {
      expect(mockIssuePresignedUrls).toHaveBeenCalledWith({
        referenceType: "WORKOUT",
        images: ["exercise.png"],
      });
      expect(mockUploadFileToPresignedUrl).toHaveBeenCalledWith(
        "https://upload.example.com/test",
        file,
      );
      expect(mockSubmitWorkoutPhoto).toHaveBeenCalledWith({
        tmpObjectKey: "private/workout/test.jpg",
      });
      expect(mockApplyWorkoutVerificationSuccess).toHaveBeenCalledWith({
        mode: "exercise",
        grantedXp: 100,
        exerciseDate: null,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("운동 사진 인증이 거절되면 오류 문구를 표시한다", async () => {
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
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByTestId("photo-input"), {
      target: { files: [new File(["test"], "exercise.png", { type: "image/png" })] },
    });
    fireEvent.click(
      screen.getByRole("button", { name: EXERCISE_TEXT.BTN_REGISTER }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("화면이나 앱 UI가 아닌 실제 운동 사진을 올려 주세요."),
      ).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
