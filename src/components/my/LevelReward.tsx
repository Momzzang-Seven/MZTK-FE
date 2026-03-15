import { MySectionCard } from "./MySectionCard";

export const LevelReward = () => {
  const level = 4;
  const reward = 5;

  return (
    <MySectionCard>
      {/* gift reward */}
      <div className="flex flex-row justify-start w-full gap-x-3">
        <img src="/icon/gift.svg" alt="giftIcon" />
        <div className="flex flex-col">
          <div className="title">레벨업 보상</div>
          <div className="label text-grey-deep">다음 레벨 달성 시</div>
        </div>
      </div>
      {/* reward desc */}
      <div className="flex flex-row rounded-lg p-4 bg-gradient-to-r from-main to-sub w-full h-fit items-center justify-between text-white">
        {/* level upgrade */}
        <div className="label">
          LV {level} → LV {level + 1}
        </div>
        {/* token icon */}

        <div className="rounded-full bg-white py-2 px-3 flex flex-row text-main items-center gap-x-2">
          <img src="/icon/orangeToken.svg" alt="tokenIcon" />
          <div className="label-bold">+{reward} MZTK</div>
        </div>
      </div>
    </MySectionCard>
  );
};
