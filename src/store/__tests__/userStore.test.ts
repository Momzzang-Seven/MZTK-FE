import { describe, expect, it, vi } from "vitest";
import {
  type TodayWorkoutCompletionResponse,
  verificationService,
} from "@services/verification";
import { useUserStore } from "@store/userStore";

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

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

    await useUserStore.getState().initWorkoutCompletion();
    expect(getTodayWorkoutCompletionSpy).toHaveBeenCalledTimes(2);
  });
});
