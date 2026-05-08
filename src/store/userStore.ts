import { create } from "zustand";
import { persist } from "zustand/middleware";
import { verificationService } from "@services/verification";
import { getWorkoutVerificationLatestErrorMessage } from "@utils/workoutVerificationMessages";
import { getKstDateString } from "@utils/time";

export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string;
  role: string;
  walletAddress: string;
}

export type NetworkType = "OPT" | "BASE";

interface UserState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  gymLocation: {
    locationId?: number;
    lat: number;
    lng: number;
    address: string;
  } | null;

  level: number;
  xp: number;
  maxXp: number;
  attendanceStreak: number;
  lastAttendanceDate: string | null;
  lastExerciseDate: string | null;
  lastWorkoutRewardAppliedDate: string | null;

  snackbar: {
    isOpen: boolean;
    message: string;
    variant?: "success" | "error" | "info";
    action?: {
      label: string;
      path: string;
    };
  };
  analysisStatus: "idle" | "analyzing" | "completed";
  analysisType: "exercise" | "record" | null;
  analysisTargetTime: number | null;
  analysisStartedAt: number | null;
  selectedNetwork: NetworkType;

  setUser: (user: UserInfo) => void;
  setAccessToken: (token: string) => void;
  updateRole: (role: string) => Promise<void>;
  setGymLocation: (
    location: {
      locationId?: number;
      lat: number;
      lng: number;
      address: string;
    } | null
  ) => void;
  registerGymLocation: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => Promise<void>;
  clearUser: () => void;
  setWalletAddress: (address: string) => void;

  addXp: (amount: number) => void;
  setLevel: (level: number) => void;
  setXp: (xp: number) => void;
  setMaxXp: (maxXp: number) => void;
  checkAttendance: () => Promise<{
    success: boolean;
    message: string;
    rewardedXp: number;
  }>;
  completeExercise: (reward?: number) => {
    success: boolean;
    message: string;
    rewardedXp: number;
  };
  applyWorkoutVerificationSuccess: (payload: {
    mode: "exercise" | "record";
    grantedXp: number;
    exerciseDate?: string | null;
  }) => void;

  weeklyAttendance: { attendedCount: number } | null;
  hasAttendedToday: boolean;

  startAnalysis: (type: "exercise" | "record") => void;
  finishAnalysis: () => void;
  checkAnalysisCompletion: () => Promise<void>;
  showSnackbar: (
    message: string,
    options?: { variant?: "success" | "error" | "info" }
  ) => void;
  closeSnackbar: () => void;
  levelUp: () => Promise<{ success: boolean; message: string }>;
  initAttendance: () => Promise<void>;
  initLevel: () => Promise<void>;
  initLocation: () => Promise<void>;
  initWorkoutCompletion: () => Promise<void>;
  setSelectedNetwork: (network: NetworkType) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  level: 1,
  xp: 0,
  maxXp: 100,
  attendanceStreak: 0,
  lastAttendanceDate: null,
  lastExerciseDate: null,
  lastWorkoutRewardAppliedDate: null,
  gymLocation: null,
  weeklyAttendance: null,
  hasAttendedToday: false,
  snackbar: { isOpen: false, message: "" },
  analysisStatus: "idle" as const,
  analysisType: null as "exercise" | "record" | null,
  analysisTargetTime: null as number | null,
  analysisStartedAt: null as number | null,
  selectedNetwork: "OPT" as NetworkType,
};

let initWorkoutCompletionRequest: Promise<void> | null = null;
let checkAnalysisCompletionRequest: Promise<void> | null = null;

const WORKOUT_ANALYSIS_POLL_INTERVAL_MS = 5000;
const WORKOUT_ANALYSIS_ERROR_RETRY_MS = 10000;
const WORKOUT_ANALYSIS_STALE_TIMEOUT_MS = 2 * 60 * 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),

      updateRole: async (role) => {
        const { updateMyRole } = await import("@services/user");
        const result = await updateMyRole(role as "USER" | "TRAINER");
        set((state) => ({
          user: state.user ? { ...state.user, role: result.role } : null,
        }));
      },

      setGymLocation: (location) => set({ gymLocation: location }),
      setWalletAddress: (address) =>
        set((state) => ({
          user: state.user ? { ...state.user, walletAddress: address } : null,
        })),

      registerGymLocation: async (location) => {
        try {
          const { locationService } = await import("@services/location");
          const result = await locationService.registerLocation({
            locationName: "내 운동 장소",
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
          });

          set({ gymLocation: { ...location, locationId: result.locationId } });
        } catch (error) {
          console.error("위치 등록 요청 실패:", error);
          set({ gymLocation: location });
        }
      },

      clearUser: () => {
        localStorage.removeItem("wallet_address");
        localStorage.removeItem("encrypted_wallet");

        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          level: 1,
          xp: 0,
          attendanceStreak: 0,
          lastAttendanceDate: null,
          lastExerciseDate: null,
          lastWorkoutRewardAppliedDate: null,
          analysisStatus: "idle",
          analysisTargetTime: null,
          analysisType: null,
          analysisStartedAt: null,
        });
      },

      reset: () => set(initialState),

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setLevel: (level) => set({ level }),
      setXp: (xp) => set({ xp }),
      setMaxXp: (maxXp) => set({ maxXp }),

      checkAttendance: async () => {
        const { lastAttendanceDate } = get();
        const today = getKstDateString();

        if (lastAttendanceDate === today) {
          return {
            success: false,
            message: "오늘은 이미 출석을 완료했어요.",
            rewardedXp: 0,
          };
        }

        try {
          const { attendanceService } = await import("@services/attendance");
          const result = await attendanceService.checkIn();

          if (result.success) {
            set((state) => ({
              lastAttendanceDate: today,
              attendanceStreak: result.streakDays,
              hasAttendedToday: true,
              weeklyAttendance: state.weeklyAttendance
                ? { attendedCount: state.weeklyAttendance.attendedCount + 1 }
                : {
                    attendedCount:
                      result.streakDays > 7 ? 1 : result.streakDays,
                  },
              xp: state.xp + result.grantedXp + result.bonusXp,
              snackbar: { isOpen: true, message: result.message },
            }));

            return {
              success: true,
              message: result.message,
              rewardedXp: result.grantedXp + result.bonusXp,
            };
          }

          return { success: false, message: result.message, rewardedXp: 0 };
        } catch (error: unknown) {
          const err = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          console.error("출석 API 호출 실패:", err);
          set({ snackbar: { isOpen: true, message: "서버 통신 실패" } });
          return {
            success: false,
            message: "서버 통신 실패",
            rewardedXp: 0,
          };
        }
      },

      completeExercise: (rewardAmount = 100) => {
        const { lastExerciseDate } = get();
        const today = getKstDateString();

        if (lastExerciseDate === today) {
          return {
            success: false,
            message: "오늘은 이미 운동 인증을 완료했어요.",
            rewardedXp: 0,
          };
        }

        set((state) => ({
          lastExerciseDate: today,
          lastWorkoutRewardAppliedDate: today,
          xp: state.xp + rewardAmount,
        }));

        return {
          success: true,
          message: "운동 인증 완료",
          rewardedXp: rewardAmount,
        };
      },

      applyWorkoutVerificationSuccess: ({ mode, grantedXp, exerciseDate }) => {
        const completedDate = exerciseDate || getKstDateString();
        const verificationLabel =
          mode === "record"
            ? "운동 기록 인증이 완료되었어요"
            : "운동 사진 인증이 완료되었어요";

        set((state) => {
          const shouldApplyReward =
            state.lastWorkoutRewardAppliedDate !== completedDate;

          return {
            analysisStatus: "idle",
            analysisTargetTime: null,
            analysisType: null,
            analysisStartedAt: null,
            lastExerciseDate: completedDate,
            lastWorkoutRewardAppliedDate: completedDate,
            xp: shouldApplyReward ? state.xp + grantedXp : state.xp,
            snackbar: {
              isOpen: true,
              message: `${verificationLabel}! 오늘의 운동 성공 +${grantedXp}EXP`,
              action: {
                label: "마이페이지에서 확인하기",
                path: "/my",
              },
            },
          };
        });
      },

      startAnalysis: (type) => {
        const startedAt = Date.now();
        set({
          analysisStatus: "analyzing",
          analysisTargetTime: startedAt + WORKOUT_ANALYSIS_POLL_INTERVAL_MS,
          analysisStartedAt: startedAt,
          analysisType: type,
        });
      },

      finishAnalysis: () => {
        set({
          analysisStatus: "idle",
          analysisTargetTime: null,
          analysisType: null,
          analysisStartedAt: null,
        });
      },

      checkAnalysisCompletion: async () => {
        const {
          analysisStatus,
          analysisTargetTime,
          analysisType,
          analysisStartedAt,
        } = get();
        const analysisMode = analysisType ?? "exercise";
        const expectedCompletedMethod =
          analysisMode === "record" ? "WORKOUT_RECORD" : "WORKOUT_PHOTO";
        const inferredStartedAt =
          analysisStartedAt ??
          (analysisTargetTime
            ? analysisTargetTime - WORKOUT_ANALYSIS_POLL_INTERVAL_MS
            : Date.now());

        if (analysisStatus !== "analyzing") {
          return;
        }

        if (analysisTargetTime && Date.now() < analysisTargetTime) {
          return;
        }

        if (checkAnalysisCompletionRequest) {
          return checkAnalysisCompletionRequest;
        }

        if (!analysisStartedAt) {
          set({ analysisStartedAt: inferredStartedAt });
        }

        checkAnalysisCompletionRequest = (async () => {
          try {
            const result =
              await verificationService.getTodayWorkoutCompletion();

            if (
              result.todayCompleted &&
              result.rewardGrantedToday &&
              result.completedMethod === expectedCompletedMethod
            ) {
              get().applyWorkoutVerificationSuccess({
                mode: analysisMode,
                grantedXp: result.grantedXp,
                exerciseDate: result.earnedDate,
              });
              return;
            }

            const latestStatus = result.latestVerification?.verificationStatus;

            if (
              !result.todayCompleted &&
              !result.latestVerification &&
              Date.now() - inferredStartedAt > WORKOUT_ANALYSIS_STALE_TIMEOUT_MS
            ) {
              set({
                analysisStatus: "idle",
                analysisTargetTime: null,
                analysisType: null,
                analysisStartedAt: null,
                snackbar: {
                  isOpen: true,
                  message:
                    "운동 인증 요청을 확인하지 못했어요. 다시 업로드해 주세요.",
                },
              });
              return;
            }

            if (latestStatus === "REJECTED" || latestStatus === "FAILED") {
              const latestVerification = result.latestVerification;

              set({
                analysisStatus: "idle",
                analysisTargetTime: null,
                analysisType: null,
                analysisStartedAt: null,
                snackbar: {
                  isOpen: true,
                  message: latestVerification
                    ? getWorkoutVerificationLatestErrorMessage(
                        latestVerification
                      )
                    : "운동 인증 분석이 완료되지 않았어요. 다시 업로드해 주세요.",
                },
              });
              return;
            }

            if (
              latestStatus === "VERIFIED" &&
              result.latestVerification?.rewardStatus === "FAILED"
            ) {
              set({
                analysisStatus: "idle",
                analysisTargetTime: null,
                analysisType: null,
                analysisStartedAt: null,
                snackbar: {
                  isOpen: true,
                  message:
                    "운동 인증은 완료되었지만 보상 반영에 실패했어요. 잠시 후 다시 확인해 주세요.",
                },
              });
              return;
            }

            set({
              analysisTargetTime:
                Date.now() + WORKOUT_ANALYSIS_POLL_INTERVAL_MS,
            });
          } catch (error) {
            console.error("운동 인증 완료 상태 확인 실패:", error);
            set({
              analysisTargetTime: Date.now() + WORKOUT_ANALYSIS_ERROR_RETRY_MS,
            });
          } finally {
            checkAnalysisCompletionRequest = null;
          }
        })();

        return checkAnalysisCompletionRequest;
      },

      showSnackbar: (message, options) => {
        set({ snackbar: { isOpen: true, message, variant: options?.variant } });
      },

      closeSnackbar: () => {
        set((state) => ({ snackbar: { ...state.snackbar, isOpen: false } }));
      },

      levelUp: async () => {
        try {
          const { levelService } = await import("@services/level");
          const result = await levelService.levelUp();

          if (result) {
            await get().initLevel();
            return {
              success: true,
              message: `축하합니다! Lv.${result.toLevel} 달성! 보상으로 ${result.rewardMztk} MZTK가 지급되었어요.`,
            };
          }

          return {
            success: false,
            message: "레벨업 처리 결과를 확인하지 못했어요.",
          };
        } catch (error: unknown) {
          console.error("레벨업 API 호출 실패:", error);
          const err = error as { response?: { data?: { message?: string } } };
          return {
            success: false,
            message: err.response?.data?.message || "서버 통신에 실패했어요.",
          };
        }
      },

      initAttendance: async () => {
        try {
          const { attendanceService } = await import("@services/attendance");
          const [statusRes, weeklyRes] = await Promise.all([
            attendanceService.getStatus(),
            attendanceService.getWeekly(),
          ]);

          set((state) => ({
            attendanceStreak: statusRes.streakCount,
            hasAttendedToday: statusRes.hasAttendedToday,
            weeklyAttendance: { attendedCount: weeklyRes.attendedCount },
            lastAttendanceDate: statusRes.hasAttendedToday
              ? getKstDateString()
              : state.lastAttendanceDate,
          }));
        } catch (error) {
          console.error("출석 초기화 통신 실패:", error);
        }
      },

      initLevel: async () => {
        try {
          const { levelService } = await import("@services/level");
          const [levelData] = await Promise.all([
            levelService.getMyLevel(),
            levelService.getLevelPolicies(),
          ]);

          if (levelData) {
            set({
              level: levelData.level,
              xp: levelData.availableXp,
              maxXp: levelData.requiredXpForNext,
            });
          }

          levelService.getMyXpLedger(0, 5).catch(() => {});
          levelService.getMyLevelUpHistories(0, 5).catch(() => {});
        } catch (error) {
          console.error("레벨 초기화 통신 실패:", error);
        }
      },

      initLocation: async () => {
        try {
          const { locationService } = await import("@services/location");
          const result = await locationService.getMyLocations();

          if (result.locations && result.locations.length > 0) {
            const loc = result.locations[0];
            set({
              gymLocation: {
                locationId: loc.locationId,
                lat: loc.latitude || 0,
                lng: loc.longitude || 0,
                address: loc.address || "",
              },
            });
          }
        } catch (error) {
          console.error("위치 정보 초기화 통신 실패:", error);
        }
      },

      initWorkoutCompletion: async () => {
        if (initWorkoutCompletionRequest) {
          return initWorkoutCompletionRequest;
        }

        initWorkoutCompletionRequest = (async () => {
          try {
            const result =
              await verificationService.getTodayWorkoutCompletion();
            const today = getKstDateString();
            const completedDate = result.earnedDate || today;

            set((state) => ({
              lastExerciseDate: result.todayCompleted
                ? completedDate
                : state.lastExerciseDate === today
                  ? null
                  : state.lastExerciseDate,
              lastWorkoutRewardAppliedDate: result.todayCompleted
                ? result.rewardGrantedToday
                  ? completedDate
                  : state.lastWorkoutRewardAppliedDate
                : state.lastWorkoutRewardAppliedDate === today
                  ? null
                  : state.lastWorkoutRewardAppliedDate,
            }));
          } catch (error) {
            console.error("운동 인증 완료 상태 초기화 실패:", error);
          } finally {
            initWorkoutCompletionRequest = null;
          }
        })();

        return initWorkoutCompletionRequest;
      },

      setSelectedNetwork: (network: NetworkType) =>
        set({ selectedNetwork: network }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        level: state.level,
        xp: state.xp,
        attendanceStreak: state.attendanceStreak,
        lastAttendanceDate: state.lastAttendanceDate,
        lastExerciseDate: state.lastExerciseDate,
        lastWorkoutRewardAppliedDate: state.lastWorkoutRewardAppliedDate,
        gymLocation: state.gymLocation,
        analysisStatus: state.analysisStatus,
        analysisType: state.analysisType,
        analysisTargetTime: state.analysisTargetTime,
        analysisStartedAt: state.analysisStartedAt,
        selectedNetwork: state.selectedNetwork,
      }),
    }
  )
);
