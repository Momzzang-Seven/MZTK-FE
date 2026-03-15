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
    gymLocation: { lat: number, lng: number; address: string } | null;

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
    setGymLocation: (location: { lat: number, lng: number; address: string } | null) => void;
    registerGymLocation: (location: { lat: number; lng: number; address: string }) => Promise<void>;
    clearUser: () => void;

    // Actions
    addXp: (amount: number) => void;
    checkAttendance: () => Promise<{ success: boolean; message: string; rewardedXp: number }>;
    completeExercise: () => { success: boolean; message: string; rewardedXp: number };

    // Async Analysis Actions
    startAnalysis: (type: 'exercise' | 'record') => void;
    checkAnalysisCompletion: () => void;
    closeSnackbar: () => void;
    levelUp: () => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            accessToken: null,

            // Initial Limit
            level: 1,
            xp: 0,
            maxXp: 100, // Fixed for now, can be dynamic (e.g. level * 100)
            attendanceStreak: 0,
            lastAttendanceDate: null,
            lastExerciseDate: null,
            gymLocation: null,

            // ... existing initial state ...

            snackbar: { isOpen: false, message: "" },
            analysisStatus: 'idle',
            analysisType: null,
            analysisTargetTime: null,

            setUser: (user) => set({ user, isAuthenticated: true }),
            setAccessToken: (token) => set({ accessToken: token }),
            setGymLocation: (location) => set({ gymLocation: location }),

            registerGymLocation: async (location) => {
                // Here we would call the API
                // const result = await locationService.registerLocation(location);
                // For now, just update store
                set({ gymLocation: location });
            },
            clearUser: () =>
                set({ user: null, isAuthenticated: false, accessToken: null, level: 1, xp: 0, attendanceStreak: 0, lastAttendanceDate: null, lastExerciseDate: null }),

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

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
                        set({ 
                            lastAttendanceDate: today, 
                            attendanceStreak: result.streakDays, 
                            xp: get().xp + result.grantedXp + result.bonusXp 
                        });
                        return { 
                            success: true, 
                            message: result.message, 
                            rewardedXp: result.grantedXp + result.bonusXp 
                        };
                    }
                    return { success: false, message: result.message, rewardedXp: 0 };
                } catch (error: any) {
                    console.error("출석 API 호출 실패:", error);
                    return { success: false, message: "서버 통신 실패", rewardedXp: 0 };
                }
            },

            completeExercise: () => {
                const { lastExerciseDate } = get();
                const today = new Date().toISOString().split("T")[0];

                if (lastExerciseDate === today) {
                    return { success: false, message: "오늘의 운동을 이미 인증했습니다.", rewardedXp: 0 };
                }

                // Immediate reward for location verification
                const reward = 100;
                set((state) => ({
                    lastExerciseDate: today,
                    xp: state.xp + reward
                }));

                return { success: true, message: "운동 인증 완료", rewardedXp: reward };
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

                    // The user's edit introduced a newNotification object, which was not in the original code.
                    // I will integrate the newNotification object and its content,
                    // assuming it's meant to replace or augment the existing snackbar message logic.
                    // The original code directly set the snackbar message.
                    // The user's edit also has a syntax error with `isRecord` being undefined in the provided snippet.
                    // I will define `isRecord` and integrate the newNotification structure.

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

                    // 자동으로 출석 체크 API 호출 시도 (이미 했으면 스토어 로직에서 걸러짐)
                    get().checkAttendance();
                }
            },

            closeSnackbar: () => {
                set((state) => ({ snackbar: { ...state.snackbar, isOpen: false } }));
            },

            levelUp: () => {
                const { xp, maxXp, level } = get();
                if (xp >= maxXp) {
                    const overflowXp = xp - maxXp; // Carry over XP
                    set({
                        level: level + 1,
                        xp: overflowXp,
                        maxXp: (level + 1) * 100 // Example: Increase requirement
                    });
                    return true;
                }
                return false;
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
