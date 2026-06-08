import { describe, expect, it } from "vitest";
import {
  ACCEPTED_IMAGE_INPUT_TYPES,
  ACCEPTED_WORKOUT_PHOTO_INPUT_TYPES,
  ACCEPTED_WORKOUT_RECORD_INPUT_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  findInvalidImageFileMessage,
  getInvalidImageFileMessage,
  getInvalidWorkoutVerificationFileMessage,
} from "../imageValidation";

describe("imageValidation", () => {
  it("백엔드에서 허용하는 이미지 확장자를 선택할 수 있게 노출한다", () => {
    expect(ACCEPTED_IMAGE_INPUT_TYPES).toContain(".jpg");
    expect(ACCEPTED_IMAGE_INPUT_TYPES).toContain(".heic");
    expect(ACCEPTED_IMAGE_INPUT_TYPES).toContain(".webp");
  });

  it("허용된 확장자의 이미지 파일은 통과시킨다", () => {
    const file = new File(["image"], "photo.HEIC", { type: "" });

    expect(getInvalidImageFileMessage(file)).toBeNull();
  });

  it("운동 사진 인증은 png를 업로드 전에 거부한다", () => {
    const file = new File(["image"], "photo.png", { type: "image/png" });

    expect(ACCEPTED_WORKOUT_PHOTO_INPUT_TYPES).not.toContain(".png");
    expect(
      getInvalidWorkoutVerificationFileMessage(file, "exercise")
    ).toContain("운동 인증에 사용할 수 없는 이미지 형식");
  });

  it("운동 기록 인증은 png를 허용한다", () => {
    const file = new File(["image"], "record.png", { type: "image/png" });

    expect(ACCEPTED_WORKOUT_RECORD_INPUT_TYPES).toContain(".png");
    expect(getInvalidWorkoutVerificationFileMessage(file, "record")).toBeNull();
  });

  it("확장자가 없는 파일은 거부한다", () => {
    const file = new File(["image"], "photo", { type: "image/png" });

    expect(getInvalidImageFileMessage(file)).toContain(
      "지원하지 않는 이미지 형식"
    );
  });

  it("이미지가 아닌 MIME 타입은 거부한다", () => {
    const file = new File(["pdf"], "photo.jpg", { type: "application/pdf" });

    expect(getInvalidImageFileMessage(file)).toContain(
      "이미지 파일로 인식되지 않습니다"
    );
  });

  it("최대 이미지 용량보다 큰 파일은 거부한다", () => {
    const file = new File(
      [new Uint8Array(MAX_IMAGE_FILE_SIZE_BYTES + 1)],
      "photo.jpg",
      {
        type: "image/jpeg",
      }
    );

    expect(getInvalidImageFileMessage(file)).toContain("10MB보다 큽니다");
  });

  it("여러 파일 중 하나라도 유효하지 않으면 해당 메시지를 반환한다", () => {
    const files = [
      new File(["image"], "photo.jpg", { type: "image/jpeg" }),
      new File(["pdf"], "manual.pdf", { type: "application/pdf" }),
    ];

    expect(findInvalidImageFileMessage(files)).toContain(
      "지원하지 않는 이미지 형식"
    );
  });
});
