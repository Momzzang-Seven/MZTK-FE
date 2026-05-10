import { useRef, useEffect } from "react";
import { Send, X } from "lucide-react";

interface Props {
  isAnswerPost?: boolean;
  writingComment: string; // 댓글 내용
  setWritingComment: (content: string) => void;
  setParentId: (parentId?: number) => void;
  parentNickname: string | null; // 답글용 부모 닉네임
  setParentNickname: (nickname: string | null) => void;
  handleCommentSubmit: () => void;
}

const maxLength = 500;

const CommentInput = ({
  isAnswerPost = false,
  setParentId,
  writingComment: content,
  setWritingComment: setContent,
  parentNickname,
  setParentNickname,
  handleCommentSubmit,
}: Props) => {
  const isActive = content.trim().length > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (parentNickname && inputRef.current) {
      inputRef.current.focus();
    }
  }, [parentNickname]);

  const handleRemoveReplyTarget = () => {
    setParentNickname(null);
    setParentId(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && content === "" && parentNickname) {
      e.preventDefault();
      handleRemoveReplyTarget();
    }
  };

  if (!isAnswerPost) {
    return (
      <div className="z-[998] fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-6 animate-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.12)] rounded-[32px] p-2 flex flex-col gap-1 transition-all duration-300">
          {parentNickname && (
            <div className="flex items-center justify-between px-4 pt-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-main bg-main/5 px-2 py-0.5 rounded-full border border-main/10">
                  @{parentNickname}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  님에게 답글
                </span>
              </div>
              <button
                onClick={handleRemoveReplyTarget}
                className="text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  parentNickname
                    ? "따뜻한 답글을 남겨주세요"
                    : "댓글을 입력해주세요"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-12 bg-transparent pl-4 pr-2 text-[14px] font-bold outline-none text-gray-900 placeholder:text-gray-300"
              />
            </div>

            <button
              onClick={handleCommentSubmit}
              disabled={!isActive}
              className={`shrink-0 w-12 h-12 rounded-[24px] flex items-center justify-center transition-all active:scale-90 ${
                isActive
                  ? "bg-main text-white shadow-lg shadow-main/20"
                  : "bg-gray-50 text-gray-300"
              }`}
            >
              <Send size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Answer (Detailed) Input
  return (
    <div className="px-5 py-6 bg-gray-50/30 rounded-[32px] border border-gray-50 mt-4 mb-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-black text-gray-900 uppercase tracking-tight">
            Your Answer
          </span>
          <span className="text-[11px] font-bold text-gray-400">
            {content.length} / {maxLength}
          </span>
        </div>

        <div className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={maxLength}
            placeholder="전문적이고 따뜻한 조언을 남겨주세요."
            className="w-full resize-none rounded-[24px] border-2 border-transparent bg-white p-5 text-[15px] font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-main/10 shadow-sm transition-all"
            rows={4}
          />
        </div>

        <button
          onClick={handleCommentSubmit}
          disabled={!isActive}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-[20px] text-[15px] font-black transition-all active:scale-[0.98] ${
            isActive
              ? "bg-main text-white shadow-xl shadow-main/20"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          <Send size={18} strokeWidth={3} />
          <span>답변 등록하기</span>
        </button>

        <p className="text-[11px] text-gray-400 text-center px-4 leading-relaxed">
          커뮤니티 가이드라인을 준수해주세요. 부적절한 내용은 제재될 수
          있습니다.
        </p>
      </div>
    </div>
  );
};

export default CommentInput;
