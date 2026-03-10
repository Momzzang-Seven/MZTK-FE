import { CommonButton } from "@components/common";

interface ConfirmSelectProps {
  handleSelectClick: () => void;
  handleCancelClick: () => void;
}

const ConfirmSelect = ({
  handleSelectClick,
  handleCancelClick,
}: ConfirmSelectProps) => {
  return (
    <div className="w-full flex flex-col gap-y-3">
      <div className="text-center text-lg font-medium">
        해당 답변을 채택하시겠습니까?
      </div>
      <CommonButton
        label="채택하기"
        bgColor="bg-main"
        className="border !rounded-full"
        onClick={handleSelectClick}
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

export default ConfirmSelect;
