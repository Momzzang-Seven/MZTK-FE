import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@services/client";
import { imageService } from "@services/image";

const apiResponse = <T>(data: T) => ({ data: { data } });

describe("image service QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "get").mockImplementation(vi.fn());
    vi.spyOn(api, "post").mockImplementation(vi.fn());
    vi.spyOn(axios, "put").mockResolvedValue({} as never);
  });

  it("confirms uploaded images through GET /images/status", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({
        images: [
          { imageId: 1, status: "COMPLETED" },
          { imageId: 2, status: "COMPLETED" },
        ],
      })
    );

    await expect(
      imageService.confirmImageUpload([1, 2])
    ).resolves.toBeUndefined();

    expect(api.get).toHaveBeenCalledWith("/images/status?ids=1&ids=2", {
      _skipNotFoundRedirect: true,
    });
    expect(api.post).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\/images\/\d+\/confirm$/),
      expect.anything()
    );
  });

  it("uploads marketplace class images and waits for backend post-processing status", async () => {
    const file = new File(["image"], "class.png", { type: "image/png" });
    vi.mocked(api.post).mockResolvedValueOnce(
      apiResponse({
        items: [
          { imageId: 11, presignedUrl: "https://s3.example/upload/thumb" },
          { imageId: 12, presignedUrl: "https://s3.example/upload/detail" },
        ],
      })
    );
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({
        images: [
          { imageId: 11, status: "COMPLETED" },
          { imageId: 12, status: "COMPLETED" },
        ],
      })
    );

    await expect(
      imageService.uploadMarketplaceClassImages([file])
    ).resolves.toEqual([11, 12]);

    expect(api.post).toHaveBeenCalledWith(
      "/images/presigned-urls",
      { referenceType: "MARKET_CLASS", images: ["class.png"] },
      { _skipNotFoundRedirect: true }
    );
    expect(axios.put).toHaveBeenNthCalledWith(
      1,
      "https://s3.example/upload/thumb",
      file,
      { headers: { "Content-Type": "image/png" } }
    );
    expect(axios.put).toHaveBeenNthCalledWith(
      2,
      "https://s3.example/upload/detail",
      file,
      { headers: { "Content-Type": "image/png" } }
    );
    expect(api.get).toHaveBeenCalledWith("/images/status?ids=11&ids=12", {
      _skipNotFoundRedirect: true,
    });
  });

  it("maps expanded marketplace class upload targets to the original files", async () => {
    const mainFile = new File(["main"], "main.png", { type: "image/png" });
    const detailFile = new File(["detail"], "detail.png", {
      type: "image/png",
    });
    vi.mocked(api.post).mockResolvedValueOnce(
      apiResponse({
        items: [
          { imageId: 21, presignedUrl: "https://s3.example/upload/thumb" },
          { imageId: 22, presignedUrl: "https://s3.example/upload/detail-1" },
          { imageId: 23, presignedUrl: "https://s3.example/upload/detail-2" },
        ],
      })
    );
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({
        images: [
          { imageId: 21, status: "COMPLETED" },
          { imageId: 22, status: "COMPLETED" },
          { imageId: 23, status: "COMPLETED" },
        ],
      })
    );

    await expect(
      imageService.uploadMarketplaceClassImages([mainFile, detailFile])
    ).resolves.toEqual([21, 22, 23]);

    expect(axios.put).toHaveBeenNthCalledWith(
      1,
      "https://s3.example/upload/thumb",
      mainFile,
      { headers: { "Content-Type": "image/png" } }
    );
    expect(axios.put).toHaveBeenNthCalledWith(
      2,
      "https://s3.example/upload/detail-1",
      mainFile,
      { headers: { "Content-Type": "image/png" } }
    );
    expect(axios.put).toHaveBeenNthCalledWith(
      3,
      "https://s3.example/upload/detail-2",
      detailFile,
      { headers: { "Content-Type": "image/png" } }
    );
    expect(api.get).toHaveBeenCalledWith(
      "/images/status?ids=21&ids=22&ids=23",
      {
        _skipNotFoundRedirect: true,
      }
    );
  });

  it("loads image metadata through GET /images query params", async () => {
    const response = {
      images: [
        {
          imageId: 11,
          userId: 1,
          referenceType: "MARKET_CLASS",
          referenceId: 101,
          status: "COMPLETED",
          imageUrl: "https://cdn.example/class.png",
          imgOrder: 0,
          createdAt: "2026-05-30T00:00:00Z",
          updatedAt: "2026-05-30T00:00:00Z",
        },
      ],
    };
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse(response));

    await expect(
      imageService.getImagesByIds({
        ids: [11, 12],
        referenceType: "MARKET_CLASS",
        referenceId: 101,
      })
    ).resolves.toEqual(response.images);

    expect(api.get).toHaveBeenCalledWith(
      "/images?ids=11&ids=12&referenceType=MARKET_CLASS&referenceId=101",
      { _skipNotFoundRedirect: true }
    );
  });
});
