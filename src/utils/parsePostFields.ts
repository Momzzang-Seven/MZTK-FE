import type {
  Web3IntentStatus,
  PublicationStatus,
  ModerationStatus,
  Web3Execution,
} from "@types";

/**
 * 게시글 공개/차단 상태 및 Web3 상태를 기준으로 질문의 상태를 파싱합니다.
 */
export const getPostStatus = (
  publicationStatus: PublicationStatus,
  moderationStatus: ModerationStatus,
  isSolved: boolean,
  commentCount: number,
  web3Execution: Web3Execution
) => {
  if (moderationStatus === "BLOCKED") return "blocked";
  if (publicationStatus === "PENDING") {
    if (web3Execution?.resource.status === "PENDING_EXECUTION")
      return "need_signature";
    return "pending";
  }
  if (publicationStatus === "FAILED") return "failed";
  if (publicationStatus === "VISIBLE") {
    if (isSolved) {
      if (web3Execution?.executionIntent.status === "AWAITING_SIGNATURE")
        return "need_signature";
      return "completed";
    }
    if (commentCount === 0) return "waiting";
    return "answering";
  }
  return "unknown";
};

export const statusStyleMap: Record<string, { label: string; bg: string }> = {
  pending: { label: "처리 중", bg: "bg-[#9CA3AF]" },
  need_signature: { label: "서명 필요", bg: "bg-[#F59E0B]" },
  failed: { label: "실패", bg: "bg-[#EF4444]" },
  blocked: { label: "차단됨", bg: "bg-[#1F2937]" },
  waiting: { label: "답변대기", bg: "bg-[#F59E0B]" },
  answering: { label: "답변중", bg: "bg-[#9CA3AF]" },
  completed: { label: "채택완료", bg: "bg-[#27DDA1]" },
  unknown: { label: "상태 확인중", bg: "bg-[#E5E7EB]" },
};

// 상태값에 따른 한글 메시지 변환
export const getIntentStatusMessage = (status: Web3IntentStatus) => {
  switch (status) {
    case "AWAITING_SIGNATURE":
      return "서명 필요";
    case "SIGNED":
      return "서명 완료";
    case "PENDING_ONCHAIN":
      return "체인 전송중";
    case "FAILED_ONCHAIN":
      return "실패";
    case "EXPIRED":
      return "시간 만료";
    case "CONFIRMED":
      return "완료";
    default:
      return "상태 확인중";
  }
};

export const replaceImageSrc = (
  content: string,
  images: { imageId: number; imageUrl: string }[]
) => {
  const imageUrlById = new Map(
    images.map(({ imageId, imageUrl }) => [String(imageId), imageUrl])
  );

  return content.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const imageIdMatch = imgTag.match(/\bimageId=(["'])(.*?)\1/i);
    if (!imageIdMatch) return imgTag;

    const imageUrl = imageUrlById.get(imageIdMatch[2]);
    if (!imageUrl) return imgTag;

    const escapedImageUrl = imageUrl
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");

    if (/\bsrc=(["']).*?\1/i.test(imgTag)) {
      return imgTag.replace(/\bsrc=(["']).*?\1/i, `src="${escapedImageUrl}"`);
    }

    return imgTag.replace(/\/?>$/, (closing) => {
      return ` src="${escapedImageUrl}"${closing}`;
    });
  });
};
