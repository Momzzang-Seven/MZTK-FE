import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfo {
    userId: number;
    email: string;
    nickname: string;
    profileImage: string;
    role: string;
    walletAddress: string;
}

interface UserState {
    user: UserInfo | null;
    isAuthenticated: boolean;
    accessToken: string | null;

    // Gym Location
    gymLocation: { locationId?: number; lat: number, lng: number; address: string } | null;

    // Level & Attendance System
    level: number;
    xp: number;
    maxXp: number;
    attendanceStreak: number; // 0 ~ 7
    lastAttendanceDate: string | null; // YYYY-MM-DD
    lastExerciseDate: string | null;

    // Async Analysis & Snackbar State
    snackbar: {
        isOpen: boolean;
        message: string;
    };
    analysisStatus: 'idle' | 'analyzing' | 'completed';
    analysisType: 'exercise' | 'record' | null;
    analysisTargetTime: number | null; // Timestamp for when analysis should 'complete' // YYYY-MM-DD

    setUser: (user: UserInfo) => void;
    setAccessToken: (token: string) => void;
    setGymLocation: (location: { locationId?: number; lat: number, lng: number; address: string } | null) => void;
    registerGymLocation: (location: { lat: number; lng: number; address: string }) => Promise<void>;
    clearUser: () => void;
    setWalletAddress: (address: string) => void;

    // Actions
    addXp: (amount: number) => void;
    setLevel: (level: number) => void;
    setXp: (xp: number) => void;
    setMaxXp: (maxXp: number) => void;
    checkAttendance: () => Promise<{ success: boolean; message: string; rewardedXp: number }>;
    completeExercise: (reward?: number) => { success: boolean; message: string; rewardedXp: number };

    // Daily & Weekly Attendance Data from Server
    weeklyAttendance: { attendedCount: number } | null;
    hasAttendedToday: boolean;

    // Async Analysis Actions
    startAnalysis: (type: 'exercise' | 'record') => void;
    checkAnalysisCompletion: () => void;
    showSnackbar: (message: string) => void;
    closeSnackbar: () => void;
    levelUp: () => Promise<{ success: boolean; message: string }>;
    initAttendance: () => Promise<void>;
    initLevel: () => Promise<void>;
    initLocation: () => Promise<void>;
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
    gymLocation: null,
    weeklyAttendance: null,
    hasAttendedToday: false,
    snackbar: { isOpen: false, message: "" },
    analysisStatus: 'idle' as const,
    analysisType: null as 'exercise' | 'record' | null,
    analysisTargetTime: null as number | null,
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setUser: (user) => set({ user, isAuthenticated: true }),
            setAccessToken: (token) => set({ accessToken: token }),
            setGymLocation: (location) => set({ gymLocation: location }),
            setWalletAddress: (address) => set((state) => ({ 
                user: state.user ? { ...state.user, walletAddress: address } : null 
            })),

            registerGymLocation: async (location) => {
                try {
                    const { locationService } = await import("@services/location");
                    const result = await locationService.registerLocation({
                        locationName: "나의 운동 장소",
                        address: location.address,
                        latitude: location.lat,
                        longitude: location.lng
                    });
                    set({ gymLocation: { ...location, locationId: result.locationId } });
                } catch (e) {
                    console.error("위치 등록 통신 실패:", e);
                    // Fallback to storing it locally even if API fails, so UI can proceed
                    set({ gymLocation: location });
                }
            },
            clearUser: () =>
                set({ user: null, isAuthenticated: false, accessToken: null, level: 1, xp: 0, attendanceStreak: 0, lastAttendanceDate: null, lastExerciseDate: null }),

            reset: () => set(initialState),

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
            setLevel: (level) => set({ level }),
            setXp: (xp) => set({ xp }),
            setMaxXp: (maxXp) => set({ maxXp }),

            checkAttendance: async () => {
                const { lastAttendanceDate } = get();
                const today = new Date().toISOString().split("T")[0];

                if (lastAttendanceDate === today) {
                    return { success: false, message: "오늘의 출석을 이미 완료했습니다.", rewardedXp: 0 };
                }

                try {
                    const { attendanceService } = await import("@services/attendance");
                    const result = await attendanceService.checkIn();

                    if (result.success) {
                        set((state) => ({ 
                            lastAttendanceDate: today, 
                            attendanceStreak: result.streakDays, 
                            hasAttendedToday: true,
                            weeklyAttendance: state.weeklyAttendance ? { attendedCount: state.weeklyAttendance.attendedCount + 1 } : { attendedCount: result.streakDays > 7 ? 1 : result.streakDays },
                            xp: state.xp + result.grantedXp + result.bonusXp,
                            snackbar: { isOpen: true, message: result.message }
                        }));
                        return { 
                            success: true, 
                            message: result.message, 
                            rewardedXp: result.grantedXp + result.bonusXp 
                        };
                    }
                    return { success: false, message: result.message, rewardedXp: 0 };
                } catch (error: unknown) {
                    const err = error as { response?: { data?: { message?: string } }, message?: string };
                    console.error("출석 API 호출 실패:", err);
                    set({ snackbar: { isOpen: true, message: "서버 통신 실패" } });
                    return { success: false, message: "서버 통신 실패", rewardedXp: 0 };
                }
            },

            completeExercise: (rewardAmount = 100) => {
                const { lastExerciseDate } = get();
                const today = new Date().toISOString().split("T")[0];

                if (lastExerciseDate === today) {
                    return { success: false, message: "오늘의 운동을 이미 인증했습니다.", rewardedXp: 0 };
                }

                set((state) => ({
                    lastExerciseDate: today,
                    xp: state.xp + rewardAmount
                }));

                return { success: true, message: "운동 인증 완료", rewardedXp: rewardAmount };
            },

            startAnalysis: (type) => {
                const targetTime = Date.now() + 5000; // 5 seconds from now
                set({ analysisStatus: 'analyzing', analysisTargetTime: targetTime, analysisType: type });
            },

            checkAnalysisCompletion: () => {
                const { analysisStatus, analysisTargetTime, analysisType } = get();
                if (analysisStatus === 'analyzing' && analysisTargetTime && Date.now() >= analysisTargetTime) {
                    // Analysis Complete!
                    const today = new Date().toISOString().split("T")[0];
                    const reward = 100; // 100 EXP Reward // Changed from XP to EXP

                    const isRecord = analysisType === 'record'; // Determine if it's a record analysis

                    const newNotification = {
                        id: Math.random(),
                        title: "운동 인증 성공!",
                        content: isRecord
                            ? `기록 인증 분석이 완료되었어요! 오늘도 운동 성공 +${reward}EXP` // Changed from XP to EXP
                            : `운동 인증 분석이 완료되었어요! 오늘도 운동 성공 +${reward}EXP`, // Changed from XP to EXP
                        date: "방금 전",
                        isRead: false
                    };

                    set({
                        analysisStatus: 'idle',
                        analysisTargetTime: null,
                        analysisType: null,
                        lastExerciseDate: today,
                        xp: get().xp + reward,
                        snackbar: {
                            isOpen: true,
                            message: newNotification.content // Use the content from the newNotification
                        }
                    });
                }
            },

            showSnackbar: (message: string) => {
                set({ snackbar: { isOpen: true, message } });
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
                            message: `축하합니다! Lv.${result.toLevel} 달성! 보상으로 ${result.rewardMztk} MZTK가 지급되었습니다.` 
                        };
                    }
                    return { success: false, message: "레벨업 실패: 결과 데이터를 확인할 수 없습니다." };
                } catch (error: unknown) {
                    console.error("레벨업 API 호출 실패:", error);
                    const err = error as { response?: { data?: { message?: string } } };
                    return { success: false, message: err.response?.data?.message || "서버 통신 실패" };
                }
            },

            initAttendance: async () => {
                try {
                    const { attendanceService } = await import("@services/attendance");
                    const [statusRes, weeklyRes] = await Promise.all([
                        attendanceService.getStatus(),
                        attendanceService.getWeekly()
                    ]);
                    
                    set((state) => ({
                        attendanceStreak: statusRes.streakCount,
                        hasAttendedToday: statusRes.hasAttendedToday,
                        weeklyAttendance: { attendedCount: weeklyRes.attendedCount },
                        lastAttendanceDate: statusRes.hasAttendedToday ? new Date().toISOString().split("T")[0] : state.lastAttendanceDate
                    }));
                } catch (e) {
                    console.error("출석 초기화 통신 실패:", e);
                }
            },

            initLevel: async () => {
                try {
                    const { levelService } = await import("@services/level");
                    const [levelData] = await Promise.all([
                        levelService.getMyLevel(),
                        levelService.getLevelPolicies()
                    ]);
                    
                    if (levelData) {
                        set({
                            level: levelData.level,
                            xp: levelData.availableXp,
                            maxXp: levelData.requiredXpForNext // Fix: use total requirement directly
                        });
                    }

                    // Fire off ledger and history requests just to ensure they are "connected" and caching
                    levelService.getMyXpLedger(0, 5).catch(() => {});
                    levelService.getMyLevelUpHistories(0, 5).catch(() => {});

                } catch (e) {
                    console.error("레벨 초기화 통신 실패:", e);
                }
            },

            initLocation: async () => {
                try {
                    const { locationService } = await import("@services/location");
                    const result = await locationService.getMyLocations();
                    if (result.locations && result.locations.length > 0) {
                        // Use the most recently registered location, or the first one
                        const loc = result.locations[0];
                        set({
                            gymLocation: {
                                locationId: loc.locationId,
                                lat: loc.latitude || 0,
                                lng: loc.longitude || 0,
                                address: loc.address || ""
                            }
                        });
                    }
                } catch (e) {
                    console.error("위치 정보 초기화 통신 실패:", e);
                }
            }
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
                gymLocation: state.gymLocation,
                // Do not persist snackbar or running analysis across reloads purely (optional choice)
                // but let's persist analysis to survive reload
                analysisStatus: state.analysisStatus,
                analysisType: state.analysisType,
                analysisTargetTime: state.analysisTargetTime
            }),
        }
    )
);
