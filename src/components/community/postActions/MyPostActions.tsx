import { CommonButton } from "@components/common";

interface MyPostActionsProps {
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleCancelClick: () => void;
}

const MyPostActions = ({
  handleEditClick,
  handleDeleteClick,
  handleCancelClick,
}: MyPostActionsProps) => {
  return (
    <div className="w-full flex flex-col gap-y-3">
      <CommonButton
        label="수정하기"
        bgColor="bg-main"
        className="border !rounded-full"
        onClick={handleEditClick}
      />
      <CommonButton
        label="삭제하기"
        bgColor="bg-red-400"
        className="border !rounded-full"
        onClick={handleDeleteClick}
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

export default MyPostActions;
