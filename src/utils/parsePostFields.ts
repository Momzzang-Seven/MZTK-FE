import type { Web3IntentStatus } from "@types";

export const getStatus = (web3IntentStatus: Web3IntentStatus | undefined, isSolved: boolean, answers: number) => {
  if (web3IntentStatus === "CONFIRMED" || web3IntentStatus === undefined) {
    // 질문 목록조회에서는 아직 온체인 작업이 완료되지 않은 게시물은 오지 않는다.
    // 단, 리팩토링 전까지는 온체인 작업이 완료되지 않은 게시물도 오기 때문에 web3IntentStatus가 undefined인 게시물을 처리해뒀다.
    if (isSolved) return "completed";
    if (answers === 0) return "waiting";
    return "answering";
  }
  if (web3IntentStatus === "SIGNED" || web3IntentStatus === "PENDING_ONCHAIN") {
    return "blockchain_processing";
  }
  return "awaiting_signature";
};

export const statusStyleMap: Record<string, { label: string; bg: string }> = {
  awaiting_signature: { label: "서명 필요", bg: "bg-[#27DDA1]" },
  waiting: { label: "답변대기", bg: "bg-[#F59E0B]" },
  answering: { label: "답변중", bg: "bg-[#9CA3AF]" },
  completed: { label: "채택완료", bg: "bg-[#27DDA1]" },
  blockchain_processing: { label: "블록체인 처리중", bg: "bg-[#27DDA1]" },
};

export const parseResourceId = (rawId: string): number => {
  const parts = rawId.split(':');
  const idString = parts[parts.length - 1];
  return parseInt(idString, 10);
};

// 상태값에 따른 한글 메시지 변환
export const getIntentStatusMessage = (status: Web3IntentStatus) => {
    switch (status) {
      case 'AWAITING_SIGNATURE': return '서명 필요';
      case 'SIGNED': return '서명 완료'
      case 'PENDING_ONCHAIN': return '체인 전송중';
      case 'FAILED_ONCHAIN': return '실패';
      case 'EXPIRED': return '시간 만료';
      case "CONFIRMED": return '완료';
      default: return '상태 확인중';
    }
};

// 액션 타입에 따른 라벨 변환
export const getIntentActionLabel = (type: string) => {
    if (type.includes('CREATE')) return '생성';
    if (type.includes('UPDATE')) return '수정';
    if (type.includes('DELETE')) return '삭제';
    if (type.includes('ACCEPT')) return '채택';
    return '작업';
};

export const replaceImageSrc = (content: string, images: { imageUrl: string }[]) => {
  let index = 0;
  return content.replace(/<img[^>]+src="([^">]+)"/g, (match) => {
    if (index < images.length) {
      const newSrc = images[index].imageUrl;
      index++;
      // 기존 src를 새로운 URL로 교체
      return match.replace(/src="([^">]+)"/, `src="${newSrc}"`);
    }
    return match;
  });
};