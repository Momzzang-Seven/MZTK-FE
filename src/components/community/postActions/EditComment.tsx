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
    <div className="w-full flex flex-col gap-y-2">
      <div className="px-1">
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          maxLength={500}
          placeholder="개인정보를 공유 및 요청하거나, 명예 훼손, 무단 광고, 불법 정보 유포 시 모니터링 후 삭제될 수 있습니다."
          className="w-full resize-none rounded-md border border-gray-400 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={3}
        />
      </div>
      <div className="flex pl-5 text-xs text-gray-500">
        {commentContent.length}/{maxLength}
      </div>
      <div
        className="flex flex-row items-center justify-center bg-main text-white text-lg font-semibold p-[11.5px] border rounded-full cursor-pointer"
        onClick={handleEditClick}
      >
        수정하기
      </div>
      <div
        className="text-base font-normal underline cursor-pointer"
        onClick={handleCancelClick}
      >
        취소
      </div>
    </div>
  );
};

export default EditComment;
