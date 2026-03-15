import { CommonButton } from "@components/common";

interface ConfirmReportProps {
  handleReportClick: () => void;
  handleCancelClick: () => void;
}

const ConfirmReport = ({
  handleReportClick,
  handleCancelClick,
}: ConfirmReportProps) => {
  return (
    <div className="w-full flex flex-col gap-y-3">
      <div className="text-16">
        신고사유 드롭다운
        <br />
        (추가예정)
      </div>
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

export default ConfirmReport;
