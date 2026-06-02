import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type TodayWorkoutCompletionResponse,
  verificationService,
} from "@services/verification";
import { useUserStore } from "@store/userStore";
import { getKstDateString } from "@utils/time";

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

beforeEach(() => {
  vi.restoreAllMocks();
  useUserStore.getState().reset();
});

describe("useUserStore.initWorkoutCompletion", () => {
  it("deduplicates concurrent requests and updates the store once", async () => {
    const deferred = createDeferred<TodayWorkoutCompletionResponse>();
    const getTodayWorkoutCompletionSpy = vi
      .spyOn(verificationService, "getTodayWorkoutCompletion")
      .mockReturnValue(deferred.promise);

    const firstCall = useUserStore.getState().initWorkoutCompletion();
    const secondCall = useUserStore.getState().initWorkoutCompletion();

    expect(getTodayWorkoutCompletionSpy).toHaveBeenCalledTimes(1);
    expect(firstCall).toBeInstanceOf(Promise);
    expect(secondCall).toBeInstanceOf(Promise);

    deferred.resolve({
      todayCompleted: true,
      completedMethod: "WORKOUT_RECORD",
      rewardGrantedToday: true,
      grantedXp: 100,
      earnedDate: "2026-04-25",
      latestVerification: null,
    });

    await Promise.all([firstCall, secondCall]);

    expect(useUserStore.getState().lastExerciseDate).toBe("2026-04-25");
    expect(useUserStore.getState().lastWorkoutRewardAppliedDate).toBe(
      "2026-04-25"
    );

    await useUserStore.getState().initWorkoutCompletion();
    expect(getTodayWorkoutCompletionSpy).toHaveBeenCalledTimes(2);
  });

  it("clears stale local workout reward state when the server says today is incomplete", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: false,
      completedMethod: null,
      rewardGrantedToday: false,
      grantedXp: 0,
      earnedDate: null,
      latestVerification: null,
    });
    const today = getKstDateString();

    useUserStore.setState({
      lastExerciseDate: today,
      lastWorkoutRewardAppliedDate: today,
    });

    await useUserStore.getState().initWorkoutCompletion();

    expect(useUserStore.getState().lastExerciseDate).toBeNull();
    expect(useUserStore.getState().lastWorkoutRewardAppliedDate).toBeNull();
  });
});

describe("useUserStore.checkAnalysisCompletion", () => {
  it("polls today's completion and shows a reward snackbar when analysis is done", async () => {
    const getTodayWorkoutCompletionSpy = vi
      .spyOn(verificationService, "getTodayWorkoutCompletion")
      .mockResolvedValue({
        todayCompleted: true,
        completedMethod: "WORKOUT_RECORD",
        rewardGrantedToday: true,
        grantedXp: 100,
        earnedDate: "2026-04-28",
        latestVerification: {
          verificationId: "verification-1",
          verificationKind: "WORKOUT_RECORD",
          verificationStatus: "VERIFIED",
          rewardStatus: "SUCCEEDED",
          rejectionReasonCode: null,
          failureCode: null,
        },
      });

    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() - 1,
      analysisType: "record",
      xp: 0,
      lastExerciseDate: null,
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(getTodayWorkoutCompletionSpy).toHaveBeenCalledTimes(1);
    expect(useUserStore.getState().analysisStatus).toBe("idle");
    expect(useUserStore.getState().lastExerciseDate).toBe("2026-04-28");
    expect(useUserStore.getState().xp).toBe(100);
    expect(useUserStore.getState().snackbar).toEqual({
      isOpen: true,
      message: "운동 기록 인증이 완료되었어요! 오늘의 운동 성공 +100EXP",
      action: {
        label: "마이페이지에서 확인하기",
        path: "/my",
      },
    });
  });

  it("applies reward when completion was already initialized for today", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: true,
      completedMethod: "WORKOUT_RECORD",
      rewardGrantedToday: true,
      grantedXp: 100,
      earnedDate: "2026-04-28",
      latestVerification: {
        verificationId: "verification-1",
        verificationKind: "WORKOUT_RECORD",
        verificationStatus: "VERIFIED",
        rewardStatus: "SUCCEEDED",
        rejectionReasonCode: null,
        failureCode: null,
      },
    });

    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() - 1,
      analysisType: "record",
      xp: 0,
      lastExerciseDate: "2026-04-28",
      lastWorkoutRewardAppliedDate: null,
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().xp).toBe(100);
    expect(useUserStore.getState().lastWorkoutRewardAppliedDate).toBe(
      "2026-04-28"
    );
  });

  it("does not treat location completion as workout verification success", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: true,
      completedMethod: "LOCATION",
      rewardGrantedToday: true,
      grantedXp: 100,
      earnedDate: "2026-04-28",
      latestVerification: {
        verificationId: "verification-location",
        verificationKind: "WORKOUT_PHOTO",
        verificationStatus: "ANALYZING",
        rewardStatus: "PENDING",
        rejectionReasonCode: null,
        failureCode: null,
      },
    });

    const now = Date.now();
    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: now - 1,
      analysisType: "exercise",
      xp: 0,
      lastExerciseDate: null,
      lastWorkoutRewardAppliedDate: null,
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().analysisStatus).toBe("analyzing");
    expect(useUserStore.getState().lastExerciseDate).toBeNull();
    expect(useUserStore.getState().xp).toBe(0);
    expect(useUserStore.getState().analysisTargetTime).toBeGreaterThan(now);
  });

  it("does not apply the same workout reward twice", () => {
    useUserStore.setState({
      xp: 100,
      lastExerciseDate: "2026-04-28",
      lastWorkoutRewardAppliedDate: "2026-04-28",
    });

    useUserStore.getState().applyWorkoutVerificationSuccess({
      mode: "record",
      grantedXp: 100,
      exerciseDate: "2026-04-28",
    });

    expect(useUserStore.getState().xp).toBe(100);
  });

  it("shows a rejection reason message when background analysis is rejected", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: false,
      completedMethod: null,
      rewardGrantedToday: false,
      grantedXp: 0,
      earnedDate: null,
      latestVerification: {
        verificationId: "verification-2",
        verificationKind: "WORKOUT_RECORD",
        verificationStatus: "REJECTED",
        rewardStatus: "NOT_REQUESTED",
        rejectionReasonCode: "DATE_NOT_VISIBLE",
        failureCode: null,
      },
    });

    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() - 1,
      analysisType: "record",
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().analysisStatus).toBe("idle");
    expect(useUserStore.getState().snackbar).toEqual({
      isOpen: true,
      message: "운동 날짜가 선명하게 보이는 기록 화면을 올려 주세요.",
    });
  });

  it("shows a failure code message when background analysis fails", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: false,
      completedMethod: null,
      rewardGrantedToday: false,
      grantedXp: 0,
      earnedDate: null,
      latestVerification: {
        verificationId: "verification-3",
        verificationKind: "WORKOUT_PHOTO",
        verificationStatus: "FAILED",
        rewardStatus: "FAILED",
        rejectionReasonCode: null,
        failureCode: "EXTERNAL_AI_TIMEOUT",
      },
    });

    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() - 1,
      analysisType: "exercise",
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().analysisStatus).toBe("idle");
    expect(useUserStore.getState().snackbar).toEqual({
      isOpen: true,
      message: "인증 분석 시간이 초과되었어요. 잠시 후 다시 시도해 주세요.",
    });
  });

  it("stops polling when verification succeeds but reward does not", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: false,
      completedMethod: null,
      rewardGrantedToday: false,
      grantedXp: 0,
      earnedDate: null,
      latestVerification: {
        verificationId: "verification-4",
        verificationKind: "WORKOUT_PHOTO",
        verificationStatus: "VERIFIED",
        rewardStatus: "FAILED",
        rejectionReasonCode: null,
        failureCode: null,
      },
    });

    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() - 1,
      analysisType: "exercise",
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().analysisStatus).toBe("idle");
    expect(useUserStore.getState().snackbar).toEqual({
      isOpen: true,
      message:
        "운동 인증은 완료되었지만 보상 반영에 실패했어요. 잠시 후 다시 확인해 주세요.",
    });
  });

  it("keeps polling while verification reward is still pending", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: false,
      completedMethod: null,
      rewardGrantedToday: false,
      grantedXp: 0,
      earnedDate: null,
      latestVerification: {
        verificationId: "verification-pending-reward",
        verificationKind: "WORKOUT_PHOTO",
        verificationStatus: "VERIFIED",
        rewardStatus: "PENDING",
        rejectionReasonCode: null,
        failureCode: null,
      },
    });

    const now = Date.now();
    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: now - 1,
      analysisStartedAt: now - 5000,
      analysisType: "exercise",
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().analysisStatus).toBe("analyzing");
    expect(useUserStore.getState().snackbar).toEqual({
      isOpen: false,
      message: "",
    });
    expect(useUserStore.getState().analysisTargetTime).toBeGreaterThan(now);
  });

  it("clears stale analysis when no verification request is found for too long", async () => {
    vi.spyOn(
      verificationService,
      "getTodayWorkoutCompletion"
    ).mockResolvedValue({
      todayCompleted: false,
      completedMethod: null,
      rewardGrantedToday: false,
      grantedXp: 0,
      earnedDate: null,
      latestVerification: null,
    });

    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() - 1,
      analysisStartedAt: Date.now() - 121000,
      analysisType: "exercise",
    });

    await useUserStore.getState().checkAnalysisCompletion();

    expect(useUserStore.getState().analysisStatus).toBe("idle");
    expect(useUserStore.getState().analysisTargetTime).toBeNull();
    expect(useUserStore.getState().analysisStartedAt).toBeNull();
    expect(useUserStore.getState().snackbar).toEqual({
      isOpen: true,
      message: "운동 인증 요청을 확인하지 못했어요. 다시 업로드해 주세요.",
    });
  });
});

describe("useUserStore.clearUser", () => {
  it("clears pending workout analysis state", () => {
    useUserStore.setState({
      analysisStatus: "analyzing",
      analysisTargetTime: Date.now() + 5000,
      analysisStartedAt: Date.now(),
      analysisType: "exercise",
      lastWorkoutRewardAppliedDate: "2026-04-28",
    });

    useUserStore.getState().clearUser();

    expect(useUserStore.getState().analysisStatus).toBe("idle");
    expect(useUserStore.getState().analysisTargetTime).toBeNull();
    expect(useUserStore.getState().analysisStartedAt).toBeNull();
    expect(useUserStore.getState().analysisType).toBeNull();
    expect(useUserStore.getState().lastWorkoutRewardAppliedDate).toBeNull();
  });
});

describe("useUserStore wallet storage sync", () => {
  const user = {
    userId: 1,
    email: "member@example.com",
    nickname: "member",
    profileImage: "",
    role: "USER",
    walletAddress: "",
  };

  it("clears stale local wallet values when backend reports no linked wallet", () => {
    localStorage.setItem("wallet_address", "0xstale");
    localStorage.setItem("encrypted_wallet", "stale-encrypted-wallet");

    useUserStore.getState().setUser(user);

    expect(localStorage.getItem("wallet_address")).toBeNull();
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
  });

  it("drops encrypted wallet when backend wallet differs from local storage", () => {
    localStorage.setItem("wallet_address", "0xold");
    localStorage.setItem("encrypted_wallet", "old-encrypted-wallet");

    useUserStore.getState().setUser({
      ...user,
      walletAddress: "0xNew",
    });

    expect(localStorage.getItem("wallet_address")).toBe("0xNew");
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
  });

  it("keeps encrypted wallet when it matches the backend linked wallet", () => {
    localStorage.setItem("wallet_address", "0xabc");
    localStorage.setItem("encrypted_wallet", "matching-encrypted-wallet");

    useUserStore.getState().setUser({
      ...user,
      walletAddress: "0xAbC",
    });

    expect(localStorage.getItem("wallet_address")).toBe("0xAbC");
    expect(localStorage.getItem("encrypted_wallet")).toBe(
      "matching-encrypted-wallet"
    );
  });
});
