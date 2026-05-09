import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyPostCard } from "@components/my";
import { useMyPosts } from "@hooks";
import type { MyPostTab } from "@hooks";
import type { PostType } from "@types";

const TAB_LABELS: Record<MyPostTab, string> = {
  written: "내가 쓴 글",
  liked: "좋아요한 글",
  commented: "댓글 단 글",
};

const TAB_ICONS: Record<MyPostTab, React.ReactNode> = {
  written: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  ),
  liked: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  ),
  commented: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: "FREE", label: "자유글" },
  { key: "QUESTION", label: "Q&A" },
];

const EMPTY_MESSAGES: Record<MyPostTab, string> = {
  written: "아직 작성한 글이 없습니다.",
  liked: "좋아요한 글이 없습니다.",
  commented: "댓글 단 글이 없습니다.",
};

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

  const handleTabSwitch = (t: MyPostTab) => {
    navigate(`/my/activity/${t}`, { replace: true });
    switchTab(t);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      {/* ── Header ── */}
      <div className="relative pt-12 pb-6 px-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-main opacity-[0.07] blur-[60px] rounded-full pointer-events-none" />
        <button
          onClick={() => navigate("/my")}
          className="btn-press mb-5 w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">
          My Activity
        </p>
        <h1 className="text-gray-900 text-2xl font-black tracking-tight">
          {TAB_LABELS[activeTab]}
        </h1>
      </div>

      {/* ── Tab pills ── */}
      <div className="flex gap-2 px-6 pb-4">
        {(["written", "liked", "commented"] as MyPostTab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabSwitch(t)}
            className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border-none ${
              activeTab === t
                ? "bg-main text-white shadow-lg shadow-main/20"
                : "bg-white text-gray-400 shadow-sm border border-gray-50"
            }`}
          >
            <span className={activeTab === t ? "opacity-100" : "opacity-50"}>
              {TAB_ICONS[t]}
            </span>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Type filter chips ── */}
      <div className="flex gap-2 px-6 pb-4">
        {TYPE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchType(key)}
            className={`btn-press px-3 py-1 rounded-lg text-[11px] font-black transition-all border-none ${
              activeType === key
                ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                : "bg-white text-gray-400 shadow-sm border border-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Post list ── */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-3">
        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <p className="text-[13px] text-gray-500 font-bold">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && posts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-500 font-black text-[15px]">
                {EMPTY_MESSAGES[activeTab]}
              </p>
              <p className="text-gray-400 text-[12px] font-bold mt-1">
                커뮤니티에서 활동을 시작해보세요
              </p>
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.map((post) => (
          <MyPostCard key={post.postId} post={post} />
        ))}

        <div ref={bottomRef} className="h-1" />

        {/* Loading spinner */}
        {isLoading && (
          <div className="py-6 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
