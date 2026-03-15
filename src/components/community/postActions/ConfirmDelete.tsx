import { CommonButton } from "@components/common";

interface ConfirmDeleteProps {
  handleConfirmClick: () => void;
  handleCancelClick: () => void;
}

const ConfirmDelete = ({
  handleConfirmClick,
  handleCancelClick,
}: ConfirmDeleteProps) => {
  return (
    <div className="w-full flex flex-col gap-y-3">
      <div className="text-16">
        정말 이 게시물/댓글을 삭제하시겠습니까?
        <br />
        삭제된 게시물은 복구할 수 없습니다.
      </div>
      <CommonButton
        label="삭제하기"
        bgColor="bg-red-400"
        className="border !rounded-full"
        onClick={handleConfirmClick}
      />
      <div
        className="text-base font-normal underline cursor-pointer"
        onClick={handleCancelClick}
      >
        취소
      </div>
    </div>
  );
};

export default ConfirmDelete;
