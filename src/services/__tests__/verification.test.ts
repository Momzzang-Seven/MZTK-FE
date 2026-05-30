import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@services/client";
import { verificationService } from "@services/verification";

const apiResponse = <T>(data: T) => ({ data: { data } });

describe("verification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "get").mockImplementation(vi.fn());
  });

  it("loads verification detail by verification id", async () => {
    const response = {
      verificationId: "verification-1",
      verificationKind: "WORKOUT_PHOTO" as const,
      verificationStatus: "REJECTED" as const,
      rewardStatus: "NOT_REQUESTED" as const,
      exerciseDate: null,
      rejectionReasonCode: "NO_PERSON_VISIBLE" as const,
      rejectionReasonDetail: "person not found",
      failureCode: null,
    };
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse(response));

    await expect(
      verificationService.getVerificationDetail("verification-1")
    ).resolves.toEqual(response);

    expect(api.get).toHaveBeenCalledWith("/verification/verification-1");
  });
});
