import { useRef, useEffect } from "react";

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
  parentNickname: parentNickname,
  setParentNickname: setParentNickname,
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
      <div className="z-[998] fixed bottom-0 w-full fixed max-w-[420px] bg-white border-t border-gray-300 px-4 py-2 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 border border-gray-400 rounded-full focus-within:ring-1 focus-within:ring-gray-300">
          {parentNickname && (
            <span className="inline-flex items-center shrink-0 text-blue-600 text-sm font-medium">
              @{parentNickname}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder={parentNickname ? "답글 입력.." : "댓글 입력.."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 text-sm outline-none bg-transparent"
          />
        </div>

        <div
          onClick={handleCommentSubmit}
          className="flex items-center justify-center"
        >
          <img
            src={isActive ? "/icon/sendActive.svg" : "/icon/sendInActive.svg"}
            alt="send"
            className="w-5 h-5"
          />
        </div>
      </div>
    );
  } else if (isAnswerPost) {
    return (
      <div className="px-3 py-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          placeholder="개인정보를 공유 및 요청하거나, 명예 훼손, 무단 광고, 불법 정보 유포 시 모니터링 후 삭제될 수 있습니다."
          className="w-full resize-none rounded-md border border-gray-400 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <span className="ml-1 text-xs text-gray-500">
            {content.length}/{maxLength}
          </span>

          <div
            onClick={handleCommentSubmit}
            className="flex items-center justify-center"
          >
            <img
              src={isActive ? "/icon/sendActive.svg" : "/icon/sendInActive.svg"}
              alt="send"
              className="w-5 h-5 mt-1 mr-1"
            />
          </div>
        </div>
      </div>
    );
  }
  return;
};

export default CommentInput;
