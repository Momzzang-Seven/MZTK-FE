import { CommonButton } from "@components/common";

interface MyPostActionsProps {
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleCancelClick: () => void;
  handleSignClick?: () => void;
  isEditable: boolean;
  isWeb3Executable: boolean;
}

const MyPostActions = ({
  handleEditClick,
  handleDeleteClick,
  handleCancelClick,
  handleSignClick,
  isEditable,
  isWeb3Executable
}: MyPostActionsProps) => {
  return (
    <div className="w-full flex flex-col gap-y-3">
      {isWeb3Executable && (
        <CommonButton 
          label="서명하기"
          bgColor="bg-main"
          className="border !rounded-full"
          onClick={handleSignClick}
        />
      )}
      {(isEditable && !isWeb3Executable) && (
        <div className="flex flex-col gap-y-3">
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
        </div>
      )}
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
