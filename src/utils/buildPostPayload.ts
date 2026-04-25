import type { CreatePostState } from "@store";
import type { PostPayload, UploadedImage } from "@types";

/**
 * HTML 문자열에서 <img imageId="..."> 속성을 등장 순서대로 수집.
 * 서버는 이 imageId 배열로 이미지 소유권 검증 및 src 매핑에 사용한다.
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
 * content 필드는 HTML 문자열이며, 이미지는 <img imageId="..."> 형태로 포함된다.
 */
export const buildPostPayload = (
  state: Pick<
    CreatePostState,
    "postType" | "title" | "content" | "images" | "reward" | "tags"
  >,
): PostPayload => {
  const { postType, title, images, reward, tags } = state;

  switch (postType) {
    case "FREE":
      return {
        content: state.content,
        imageIds: images.map((img: UploadedImage) => img.imageId),
        tags,
      };

    case "QUESTION":
      return {
        title,
        content: state.content,
        imageIds: extractImageIdsFromHtml(state.content),
        reward,
        tags,
      };

    case "ANSWER":
      return {
        content: state.content,
        imageIds: extractImageIdsFromHtml(state.content),
      };
  }
};
