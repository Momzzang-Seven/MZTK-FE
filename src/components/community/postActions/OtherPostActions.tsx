import { CommonButton } from "@components/common";

interface OtherPostActionsProps {
  type: string;
  isSelectable?: boolean;
  handleSelectClick: () => void;
  handleReportClick: () => void;
  handleCancelClick: () => void;
}

const OtherPostActions = ({
  type,
  isSelectable = true,
  handleSelectClick,
  handleReportClick,
  handleCancelClick,
}: OtherPostActionsProps) => {
  return (
    <div className="w-full flex flex-col gap-y-3">
      {type === "answer" && isSelectable && (
        <CommonButton
          label="채택하기"
          bgColor="bg-main"
          className="border !rounded-full"
          onClick={handleSelectClick}
        />
      )}
      <CommonButton
        label="신고하기"
        bgColor="bg-red-400"
        className="border !rounded-full"
        onClick={handleReportClick}
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

export default OtherPostActions;
