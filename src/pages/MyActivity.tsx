import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MessageSquare,
  Heart,
  PenTool,
  Search,
} from "lucide-react";
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
  written: <PenTool size={14} />,
  liked: <Heart size={14} />,
  commented: <MessageSquare size={14} />,
};

const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: "FREE", label: "자유글" },
  { key: "QUESTION", label: "Q&A" },
];

const EMPTY_MESSAGES: Record<MyPostTab, { title: string; desc: string }> = {
  written: {
    title: "아직 작성한 글이 없어요",
    desc: "커뮤니티에 소중한 일상이나 질문을 남겨보세요.",
  },
  liked: {
    title: "좋아요한 글이 없어요",
    desc: "관심 있는 글에 마음을 표현해보세요.",
  },
  commented: {
    title: "댓글 단 글이 없어요",
    desc: "다른 회원들의 글에 따뜻한 응원을 남겨보세요.",
  },
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

  useEffect(() => {
    switchTab(resolvedTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="flex flex-col min-h-dvh bg-[#FDFDFD] font-pretendard relative">
      {/* Immersive Floating Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-main/5 via-transparent to-transparent pointer-events-none" />

      {/* Floating Back Button & Title */}
      <div className="relative pt-12 pb-8 px-6 flex flex-col gap-5 z-10">
        <button
          onClick={() => navigate("/my")}
          className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 active:scale-90 transition-all"
        >
          <ChevronLeft size={24} className="text-gray-900" />
        </button>

        <div className="animate-in slide-in-from-left-4 duration-700 ease-out">
          <p className="text-[11px] font-black tracking-[0.2em] text-main uppercase mb-1.5 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-main rounded-full" />
            My Activity
          </p>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-none">
            {TAB_LABELS[activeTab]}
          </h1>
        </div>
      </div>

      {/* Glassmorphic Navigation Section */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 pb-4">
        {/* Main Tab Pills */}
        <div className="flex gap-2 px-6 pt-2 pb-4 overflow-x-auto no-scrollbar">
          {(["written", "liked", "commented"] as MyPostTab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabSwitch(t)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-black transition-all border-none whitespace-nowrap ${
                activeTab === t
                  ? "bg-main text-white shadow-[0_8px_20px_rgba(255,107,0,0.25)] scale-[1.02]"
                  : "bg-white text-gray-400 shadow-sm border border-gray-100 hover:bg-gray-50"
              }`}
            >
              <span
                className={activeTab === t ? "text-white" : "text-gray-300"}
              >
                {TAB_ICONS[t]}
              </span>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Sub-type Filter Chips */}
        <div className="flex gap-2 px-6">
          {TYPE_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchType(key)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border-none ${
                activeType === key
                  ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 px-5 py-8 pb-32 flex flex-col gap-4">
        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-red-50 flex items-center justify-center border border-red-100/50 animate-bounce">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <p className="text-[14px] text-red-500 font-black">{error}</p>
          </div>
        )}

        {!isLoading && posts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-[36px] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                <Search size={32} className="text-gray-200" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-lg border border-gray-50 flex items-center justify-center text-main animate-pulse">
                {TAB_ICONS[activeTab]}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-black text-gray-900 text-[20px] tracking-tight">
                {EMPTY_MESSAGES[activeTab].title}
              </h3>
              <p className="text-gray-400 text-[14px] font-bold mt-2 leading-relaxed px-10">
                {EMPTY_MESSAGES[activeTab].desc}
              </p>
            </div>
            <button
              onClick={() => navigate("/community/free")}
              className="mt-10 px-6 py-3 bg-main/10 text-main rounded-2xl text-[13px] font-black hover:bg-main/20 transition-all border-none"
            >
              커뮤니티 둘러보기
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {posts.map((post) => (
            <MyPostCard key={post.postId} post={post} />
          ))}
        </div>

        <div ref={bottomRef} className="h-4" />

        {isLoading && (
          <div className="py-10 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
              <div className="w-4 h-4 border-2 border-main border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Fetching Content
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
