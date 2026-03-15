interface Props {
  isAnswerPost?: boolean;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  postId?: number;
  commentId?: number;
  handleCommentSubmit: () => void;
}

const maxLength = 500;

const CommentInput = ({
  isAnswerPost = false,
  comment = "",
  setComment,
  handleCommentSubmit,
}: Props) => {
  const isActive = comment.trim().length > 0;

  if (!isAnswerPost) {
    return (
      <div className="z-[998] fixed bottom-0 w-full fixed max-w-[420px] bg-white border-t border-gray-300 px-4 py-2 flex items-center gap-3">
        {/* 입력창 */}
        <input
          type="text"
          placeholder="댓글 입력.."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 text-sm px-3 py-2 border border-gray-400 rounded-full outline-none focus:ring-1 focus:ring-gray-300"
        />

        {/* 전송 버튼 */}
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
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="개인정보를 공유 및 요청하거나, 명예 훼손, 무단 광고, 불법 정보 유포 시 모니터링 후 삭제될 수 있습니다."
          className="w-full resize-none rounded-md border border-gray-400 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <span className="ml-1 text-xs text-gray-500">
            {comment.length}/{maxLength}
          </span>

          {/* 전송 아이콘 */}
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
