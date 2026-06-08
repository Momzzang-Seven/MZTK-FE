import type { PostType } from "@types";
import { useUserStore } from "@store";

interface SharePostProps {
  type: PostType;
  postId: number;
}

const SharePost = ({ type, postId }: SharePostProps) => {
  const { showSnackbar } = useUserStore((s) => s);
  const BASE_URL = window.location.origin;
  const COMMUNITY_BASE = `${BASE_URL}/community`;

  const basePathByType: Record<PostType, string> = {
    FREE: `${COMMUNITY_BASE}/free/`,
    QUESTION: `${COMMUNITY_BASE}/question/`,
  };

  const url = basePathByType[type] + postId;

  const handleShareClick = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!navigator.share) {
      await navigator.clipboard?.writeText(url);
      return;
    }

    try {
      await navigator.share({
        title: "몸짱코인 게시물 공유하기",
        url,
      });
    } catch (error) {
      showSnackbar("공유에 실패했습니다. URL이 클립보드에 복사되었습니다.");
      await navigator.clipboard?.writeText(url);
    }
  };

  return (
    <button
      type="button"
      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
      onClick={handleShareClick}
    >
      <img src="/icon/share.svg" alt="공유" className="w-5 h-5" />
    </button>
  );
};

export default SharePost;
