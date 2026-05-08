import type { CreatePostState } from "@store";
import type { PostPayload, UploadedImage } from "@types";

/**
 * HTML 문자열에서 <img imageId="..."> 속성을 등장 순서대로 수집.
 */
export const extractImageIdsFromHtml = (html: string): number[] => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("img[imageId]"))
    .map((img) => img.getAttribute("imageId"))
    .filter((id): id is string => id !== null)
    .map((id) => Number(id));
};

const isArrayEqual = (a: number[] | string[], b: number[] | string[]) =>
  a.length === b.length && a.every((val, index) => val === b[index]);

/**
 * 스토어 상태를 백엔드 JSON 규격으로 변환.
 * initialData가 제공되면 수정 모드로 간주하여 변경된 필드만 추출.
 */
export const buildPostPayload = (
  state: Pick<
    CreatePostState,
    "postType" | "title" | "content" | "images" | "reward" | "tags"
  >,
  initialData?: PostPayload
): Partial<PostPayload> => {
  const { postType, title, content, images, reward, tags } = state;

  // 현재 데이터 계산
  const currentImageIds =
    postType === "FREE"
      ? images.map((img: UploadedImage) => img.imageId)
      : extractImageIdsFromHtml(content);

  // 1. 신규 등록 케이스: 전체 payload 반환
  if (!initialData) {
    switch (postType) {
      case "FREE":
        return { content, imageIds: currentImageIds, tags };
      case "QUESTION":
        return { title, content, imageIds: currentImageIds, reward, tags };
      case "ANSWER":
        return { content, imageIds: currentImageIds };
    }
  }

  // 2. 수정 케이스: 변경된 필드만 추출
  const patch: Partial<PostPayload> = {};

  if (title !== initialData.title) patch.title = title;
  if (content !== initialData.content) patch.content = content;
  if (reward !== initialData.reward) patch.reward = reward;
  if (!isArrayEqual(currentImageIds, initialData.imageIds || []))
    patch.imageIds = currentImageIds;
  if (!isArrayEqual(tags, initialData.tags || [])) patch.tags = tags;

  return patch;
};
