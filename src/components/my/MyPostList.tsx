import { useEffect, useRef } from "react";
import { useMyPosts } from "@hooks";
import type { PostType } from "@types";
import { MyPostCard } from "./MyPostCard";

const TABS = [
  { key: "written", label: "내가 쓴 글" },
  { key: "liked", label: "좋아요" },
  { key: "commented", label: "댓글 단 글" },
] as const;

const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: "FREE", label: "자유글" },
  { key: "QUESTION", label: "Q&A" },
];

export const MyPostList = () => {
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
    initialFetch,
  } = useMyPosts();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 마운트 시 첫 데이터 fetch
  useEffect(() => {
    void initialFetch();
    // 의도적으로 deps 제외 — 마운트 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 무한 스크롤 — IntersectionObserver
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="flex flex-col w-full gap-3">
      {/* 탭 */}
      <div className="flex w-full bg-gray-50 rounded-xl p-1 gap-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* FREE / Q&A 타입 토글 */}
      <div className="flex gap-2">
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

      {/* 컨텐츠 */}
      <div className="flex flex-col gap-2">
        {error && (
          <div className="text-center text-sm text-red-400 py-4">{error}</div>
        )}

        {!isLoading && posts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-3xl opacity-20">📭</span>
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

        {/* 무한 스크롤 트리거 */}
        <div ref={bottomRef} className="h-1" />

        {isLoading && (
          <div className="py-4 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-main border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
