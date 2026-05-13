interface EditCommentProps {
  setCommentContent: (commentContent: string) => void;
  commentContent: string;
  handleEditClick: () => void;
  handleCancelClick: () => void;
}

const EditComment = ({
  setCommentContent,
  commentContent,
  handleEditClick,
  handleCancelClick,
}: EditCommentProps) => {
  const maxLength = 500;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Edit Content
        </h3>
        <p className="text-[11px] font-bold text-gray-300 tracking-tight">
          수정할 내용을 따뜻하게 입력해주세요.
        </p>
      </div>

      <div className="relative group">
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          maxLength={maxLength}
          placeholder="따뜻하고 전문적인 조언을 남겨주세요."
          className="w-full resize-none rounded-[24px] border-2 border-gray-50 bg-gray-50/50 p-5 text-[15px] font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-main/20 focus:bg-white shadow-inner transition-all duration-300"
          rows={4}
        />
        <div className="absolute bottom-4 right-5 text-[10px] font-black text-gray-300 tracking-widest bg-white/80 px-2 py-1 rounded-full border border-gray-50 backdrop-blur-sm">
          {commentContent.length} / {maxLength}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleEditClick}
          className="w-full py-4.5 bg-main text-white rounded-[20px] text-[15px] font-black shadow-xl shadow-main/20 active:scale-[0.98] transition-all"
        >
          수정 완료
        </button>
        <button
          onClick={handleCancelClick}
          className="w-full py-2 text-gray-400 text-[14px] font-bold hover:text-gray-600 transition-colors"
        >
          취소하기
        </button>
      </div>
    </div>
  );
};

export default EditComment;
