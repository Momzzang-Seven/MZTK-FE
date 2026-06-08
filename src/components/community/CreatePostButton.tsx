import { useNavigate, useLocation } from "react-router-dom";
import { Plus, PenTool } from "lucide-react";

interface CreatePostButtonProps {
  postId?: number;
}

const CreatePostButton = ({ postId }: CreatePostButtonProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleCreatePost = () => {
    if (postId !== undefined) {
      navigate(`/community/answer/new/${encodeURIComponent(postId)}`);
      return;
    }

    if (pathname === "/community/free") {
      navigate("/community/free/new/select-image");
    } else if (pathname === "/community/question") {
      navigate("/community/question/new");
    }
  };

  // 답변 쓰기 (Premium Floating Bar 스타일)
  if (postId !== undefined) {
    return (
      <div className="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-full max-w-[450px] px-5 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
        <button
          onClick={handleCreatePost}
          className="w-full h-[72px] bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-[32px] flex items-center justify-between px-6 group active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-main rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-main/20 group-hover:rotate-12 transition-transform duration-500">
              <PenTool size={22} strokeWidth={3} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[15px] font-black text-gray-900 tracking-tight">
                이 질문에 답변하기
              </span>
              <span className="text-[11px] font-bold text-gray-400 tracking-tight">
                지식을 공유하고 토큰 보상을 받으세요
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-main group-hover:text-white transition-colors duration-300">
            <Plus size={20} strokeWidth={3} />
          </div>
        </button>
      </div>
    );
  }

  // free/question (Premium FAB)
  return (
    <div className="fixed bottom-[calc(6.875rem+env(safe-area-inset-bottom))] right-6 sm:right-[calc(50%-225px+24px)] z-50">
      <button
        onClick={handleCreatePost}
        className="h-16 w-16 bg-main rounded-[24px] shadow-[0_20px_40px_rgba(250,177,47,0.3)] flex items-center justify-center text-white active:scale-90 transition-all hover:scale-105 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
        <Plus
          size={32}
          strokeWidth={3}
          className="group-hover:rotate-90 transition-transform duration-500"
        />
      </button>
    </div>
  );
};

export default CreatePostButton;
