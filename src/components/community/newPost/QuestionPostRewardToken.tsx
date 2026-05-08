interface QuestionPostRewardTokenProps {
  rewardToken: number;
  onClick?: () => void;
}

const QuestionPostRewardToken = ({
  rewardToken,
  onClick,
}: QuestionPostRewardTokenProps) => {
  return (
    <div
      className="flex flex-row rounded-xl p-4 bg-gradient-to-r from-main to-sub w-full h-20 items-center justify-between text-white cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-row gap-x-4 items-center">
        <img src="/icon/token.svg" alt="tokenIcon" />
        <div className="label-bold">지급할 MZTK</div>
      </div>
      <div className="flex flex-row gap-x-4 items-center">
        <div className="text-2xl font-bold">{rewardToken}</div>
        <div className="body">MZTK</div>
      </div>
    </div>
  );
};

export default QuestionPostRewardToken;
