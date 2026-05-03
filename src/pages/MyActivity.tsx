import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { MyPostCard } from "@components/my";
import { useMyPosts } from "@hooks";
import type { MyPostTab } from "@hooks";
import type { PostType } from "@types";

const TAB_LABELS: Record<MyPostTab, string> = {
  written: "내가 쓴 글",
  liked: "좋아요한 글",
  commented: "댓글 단 글",
};

const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: "FREE", label: "자유글" },
  { key: "QUESTION", label: "Q&A" },
];

const isValidTab = (tab: string | undefined): tab is MyPostTab =>
  tab === "written" || tab === "liked" || tab === "commented";

const MyActivity = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const resolvedTab: MyPostTab = isValidTab(tab) ? tab : "written";

  const {
    activeTab,
    activeType,
    posts,
    isLoading,
    hasMore,
    error,
    switchTab,
    switchType,
    loadMore,
  } = useMyPosts();

  const bottomRef = useRef<HTMLDivElement>(null);

  // URL 탭으로 초기화
  useEffect(() => {
    switchTab(resolvedTab);
    // 탭 변경은 URL 진입 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 무한 스크롤
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // 탭 전환 시 URL도 함께 변경
  const handleTabSwitch = (t: MyPostTab) => {
    navigate(`/my/activity/${t}`, { replace: true });
    switchTab(t);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <SimpleHeader title={TAB_LABELS[activeTab]} />

      {/* 탭 */}
      <div className="flex w-full bg-white border-b border-gray-100 sticky top-0 z-10">
        {(["written", "liked", "commented"] as MyPostTab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabSwitch(t)}
            className={`flex-1 py-3.5 text-[13px] font-bold transition-all relative ${
              activeTab === t ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {TAB_LABELS[t]}
            {activeTab === t && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* 타입 토글 */}
      <div className="flex gap-2 px-5 pt-4 pb-2">
        {TYPE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchType(key)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
              activeType === key
                ? key === "FREE"
                  ? "bg-main/10 text-main border-main/20"
                  : "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 flex flex-col gap-2">
        {error && (
          <p className="text-center text-sm text-red-400 py-8">{error}</p>
        )}

        {!isLoading && posts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-4xl opacity-20">📭</span>
            <p className="text-[13px] text-gray-400 font-medium">
              {activeTab === "written" && "아직 작성한 글이 없습니다."}
              {activeTab === "liked" && "좋아요한 글이 없습니다."}
              {activeTab === "commented" && "댓글 단 글이 없습니다."}
            </p>
          </div>
        )}

        {posts.map((post) => (
          <MyPostCard key={post.postId} post={post} />
        ))}

        <div ref={bottomRef} className="h-1" />

        {isLoading && (
          <div className="py-6 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-main border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
