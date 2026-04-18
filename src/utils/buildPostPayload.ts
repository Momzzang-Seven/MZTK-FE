import type { CreatePostState, UploadedImage } from "@store";
import type { PostPayload } from "@types";

/**
 * HTML 문자열에서 <img data-uuid="..."> 속성을 등장 순서대로 수집.
 * 서버는 이 uuid 배열로 이미지 소유권 검증 및 src 매핑에 사용한다.
 */
const extractImageIdsFromHtml = (html: string): number[] => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("img[imageId]"))
    .map((img) => img.getAttribute("imageId"))
    .filter((id): id is string => id !== null)
    .map((id) => Number(id));
};

/**
 * 스토어 상태를 백엔드 JSON 규격으로 변환.
 * content 필드는 HTML 문자열이며, 이미지는 <img data-uuid="..."> 형태로 포함된다.
 */
export const buildPostPayload = (
  state: Pick<
    CreatePostState,
    "postType" | "title" | "content" | "images" | "reward" | "tags"
  >,
): PostPayload => {
  const { postType, title, images, reward, tags } = state;

  switch (postType) {
    case "free":
      return {
        content: state.content,
        imageIds: images.map((img: UploadedImage) => img.id),
        tags,
      };

    case "question":
      return {
        title,
        content: state.content,
        imageIds: extractImageIdsFromHtml(state.content),
        reward,
        tags,
      };

    case "answer":
      return {
        content: state.content,
        imageIds: extractImageIdsFromHtml(state.content),
      };
  }
};
