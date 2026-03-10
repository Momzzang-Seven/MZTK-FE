import { useTokenBalance } from "@hooks/useTokenBalance";

export const CurrentTkn = () => {
  const { balance, loading } = useTokenBalance();

  return (
    <div className="flex flex-row rounded-lg p-4 bg-gradient-to-r from-main to-sub w-full h-20 items-center justify-between text-white">
      <div className="flex flex-row gap-x-4 items-center">
        <img src="/icon/token.svg" alt="tokenIcon" />
        <div className="label-bold">보유 MZTK</div>
      </div>
      <div className="flex flex-row gap-x-4 items-center">
        <div className="text-2xl font-bold">
          {loading ? "..." : Number(balance).toLocaleString()}
        </div>
        <div className="body">MZTK</div>
      </div>
    </div>
  );
};
