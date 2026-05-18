const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "heif",
  "heic",
  "webp",
]);

export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_FILE_SIZE_MB = MAX_IMAGE_FILE_SIZE_BYTES / 1024 / 1024;

export const ACCEPTED_IMAGE_INPUT_TYPES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".heif",
  ".heic",
  ".webp",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/heif",
  "image/heic",
  "image/webp",
].join(",");

const getFileExtension = (filename: string) => {
  const extensionIndex = filename.lastIndexOf(".");

  if (extensionIndex <= 0 || extensionIndex === filename.length - 1) {
    return null;
  }

  return filename.slice(extensionIndex + 1).toLowerCase();
};

export const getInvalidImageFileMessage = (file: File) => {
  const filename = file.name || "선택한 파일";
  const extension = getFileExtension(filename);

  if (!extension || !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return `${filename}은 지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, HEIF, HEIC, WEBP 파일만 선택해 주세요.`;
  }

  if (file.type && !file.type.startsWith("image/")) {
    return `${filename}은 이미지 파일로 인식되지 않습니다. 다른 파일을 선택해 주세요.`;
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return `${filename}은 ${MAX_IMAGE_FILE_SIZE_MB}MB보다 큽니다. 더 작은 이미지를 선택해 주세요.`;
  }

  return null;
};

export const findInvalidImageFileMessage = (files: File[]) => {
  for (const file of files) {
    const message = getInvalidImageFileMessage(file);

    if (message) {
      return message;
    }
  }

  return null;
};
