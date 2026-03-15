import type { PostType } from "@types";

interface SharePostProps {
  type: PostType;
  postId: number;
}

const SharePost = ({ type, postId }: SharePostProps) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const COMMUNITY_BASE = `${BASE_URL}/community`;

  const basePathByType: Record<PostType, string> = {
    free: `${COMMUNITY_BASE}/free/`,
    question: `${COMMUNITY_BASE}/question/`,
  };

  const url = basePathByType[type] + postId;

  const handleShareClick = () => {
    if (!navigator.share) {
      console.log("Web Share API를 지원하지 않는 환경입니다.");
      return;
    }

    navigator
      .share({
        title: "몸짱코인 게시물 공유하기",
        url,
      })
      .catch((error) => console.log("공유 실패:", error));
  };

  return (
    <div
      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      onClick={handleShareClick}
    >
      <img src="/icon/share.svg" alt="공유" className="w-5 h-5" />
    </div>
  );
};

export default SharePost;
