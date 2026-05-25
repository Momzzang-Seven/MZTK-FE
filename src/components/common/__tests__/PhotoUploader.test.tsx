import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useButtonClickGuard } from "@hooks";
import { PhotoUploader } from "../PhotoUploader";

const defaultProps = {
  previewUrl: null,
  onFileChange: vi.fn(),
  guideTitle: "guide title",
  guideDesc: "guide desc",
  uploadNoImageText: "select photo",
  uploadSizeHintText: "image only",
};

const GuardedPhotoUploader = () => {
  const handleClickCapture = useButtonClickGuard();

  return (
    <div onClickCapture={handleClickCapture}>
      <PhotoUploader {...defaultProps} />
    </div>
  );
};

describe("PhotoUploader", () => {
  it("opens the hidden file input when the upload area is clicked", () => {
    render(<PhotoUploader {...defaultProps} />);

    const input = screen.getByTestId("photo-input");
    const clickSpy = vi
      .spyOn(input, "click")
      .mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: /select photo/ }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("does not cancel the file input click under the global button guard", () => {
    render(<GuardedPhotoUploader />);

    const input = screen.getByTestId("photo-input");
    let clickCount = 0;
    let wasPrevented = false;

    input.addEventListener("click", (event) => {
      clickCount += 1;
      wasPrevented = event.defaultPrevented;
    });

    fireEvent.click(screen.getByRole("button", { name: /select photo/ }));

    expect(clickCount).toBe(1);
    expect(wasPrevented).toBe(false);
  });
});
