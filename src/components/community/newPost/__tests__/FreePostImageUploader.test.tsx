import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FreePostImageUploader from "../FreePostImageUploader";
import { usePostStore } from "@store";
import { MAX_IMAGE_FILE_SIZE_BYTES } from "@utils";

const mockShowSnackbar = vi.hoisted(() => vi.fn());
const mockUploadImages = vi.hoisted(() => vi.fn());
const mockUseImageUpload = vi.hoisted(() => vi.fn());

vi.mock("@hooks", () => ({
  useImageUpload: mockUseImageUpload,
}));

vi.mock("@store", async () => {
  const actual = await vi.importActual<typeof import("@store")>("@store");

  return {
    ...actual,
    useUserStore: vi.fn(
      <T,>(selector: (state: { showSnackbar: typeof mockShowSnackbar }) => T) =>
        selector({
          showSnackbar: mockShowSnackbar,
        })
    ),
  };
});

const getFileInput = (container: HTMLElement) => {
  const input = container.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("file input not found");
  }

  return input;
};

describe("FreePostImageUploader", () => {
  beforeEach(() => {
    usePostStore.getState().reset();
    mockShowSnackbar.mockClear();
    mockUploadImages.mockReset();
    mockUploadImages.mockResolvedValue(undefined);
    mockUseImageUpload.mockReturnValue({ uploadImages: mockUploadImages });
  });

  it("invalid image selections are rejected before upload starts", async () => {
    const { container } = render(<FreePostImageUploader />);

    fireEvent.change(getFileInput(container), {
      target: {
        files: [new File(["pdf"], "manual.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.stringContaining("지원하지 않는 이미지 형식"),
        { variant: "error" }
      );
    });
    expect(mockUploadImages).not.toHaveBeenCalled();
  });

  it("oversized image selections are rejected before upload starts", async () => {
    const { container } = render(<FreePostImageUploader />);

    fireEvent.change(getFileInput(container), {
      target: {
        files: [
          new File(
            [new Uint8Array(MAX_IMAGE_FILE_SIZE_BYTES + 1)],
            "large.jpg",
            { type: "image/jpeg" }
          ),
        ],
      },
    });

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.stringContaining("10MB보다 큽니다"),
        { variant: "error" }
      );
    });
    expect(mockUploadImages).not.toHaveBeenCalled();
  });

  it("image selections over the remaining count are rejected before upload starts", async () => {
    usePostStore.getState().setImages([
      { imageId: 1, imageUrl: "/one.jpg" },
      { imageId: 2, imageUrl: "/two.jpg" },
      { imageId: 3, imageUrl: "/three.jpg" },
      { imageId: 4, imageUrl: "/four.jpg" },
    ]);

    const { container } = render(<FreePostImageUploader maxImages={5} />);

    fireEvent.change(getFileInput(container), {
      target: {
        files: [
          new File(["image"], "new-a.jpg", { type: "image/jpeg" }),
          new File(["image"], "new-b.jpg", { type: "image/jpeg" }),
        ],
      },
    });

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        "이미지는 최대 5장까지 등록할 수 있어요.",
        { variant: "error" }
      );
    });
    expect(mockUploadImages).not.toHaveBeenCalled();
  });

  it("valid selections are sent to the upload hook", async () => {
    const { container } = render(<FreePostImageUploader />);
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    fireEvent.change(getFileInput(container), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockUploadImages).toHaveBeenCalledWith([file]);
    });
    expect(mockShowSnackbar).not.toHaveBeenCalled();
    expect(screen.getByText("0 / 5")).toBeInTheDocument();
  });
});
