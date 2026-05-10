import { useState } from "react";
import { useTokenBalance } from "@hooks";
import { Coins, Wallet, AlertCircle } from "lucide-react";

interface QuestionPostRewardSelectorProps {
  reward: number;
  setReward: (value: number) => void;
}

const QuestionPostRewardSelector = ({
  reward,
  setReward,
}: QuestionPostRewardSelectorProps) => {
  const { balance } = useTokenBalance();
  const balanceNum = Number(balance);
  const [customValue, setCustomValue] = useState(reward.toString());

  const setAmount = (value: number) => {
    if (value < 0) return;
    const finalValue = value > balanceNum ? balanceNum : value;
    setReward(finalValue);
    setCustomValue(finalValue.toString());
  };

  const amountButtons = [10, 30, 50, 100, 200];

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomValue(value);

    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
      const finalValue = numberValue > balanceNum ? balanceNum : numberValue;
      setReward(finalValue);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Current Selection Display */}
      <div className="bg-main/5 rounded-[32px] p-6 border border-main/10 flex flex-col items-center justify-center gap-1 shadow-inner">
        <span className="text-[12px] font-black text-main/60 uppercase tracking-widest">
          Selected Amount
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-gray-900 tracking-tight">
            {reward}
          </span>
          <span className="text-[16px] font-black text-main uppercase">
            MZTK
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-gray-900 font-black tracking-tight">
          <Coins size={18} className="text-main" />
          <span>금액 선택</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <Wallet size={12} />
          <span>보유: {balanceNum.toLocaleString()} MZTK</span>
        </div>
      </div>

      {/* Amount Preset Buttons */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {amountButtons.map((amount) => {
          const isSelected = reward === amount;
          const isDisabled = amount > balanceNum;

          return (
            <button
              key={amount}
              type="button"
              onClick={() => setAmount(amount)}
              disabled={isDisabled}
              className={`
                aspect-square flex items-center justify-center rounded-[20px]
                text-[15px] font-black transition-all duration-300
                ${
                  isSelected
                    ? "bg-main text-white shadow-lg shadow-main/30 scale-105 ring-4 ring-main/10"
                    : "bg-white border border-gray-100 text-gray-500 hover:border-main/30 hover:bg-main/5"
                }
                disabled:opacity-20 disabled:cursor-not-allowed disabled:scale-100
              `}
            >
              {amount}
            </button>
          );
        })}
      </div>

      {/* Custom Input */}
      <div className="flex flex-col gap-3">
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[13px] uppercase tracking-wider">
            Custom
          </div>
          <input
            type="number"
            value={customValue}
            onChange={handleCustomInput}
            min={0}
            max={balanceNum}
            placeholder="0"
            className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] py-5 pl-24 pr-16 text-right font-black text-[20px] text-gray-900 focus:bg-white focus:border-main/20 transition-all outline-none"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-main font-black text-[14px]">
            MZTK
          </div>
        </div>

        {reward >= balanceNum && balanceNum > 0 && (
          <div className="flex items-center gap-1.5 text-amber-500 px-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} strokeWidth={3} />
            <span className="text-[11px] font-black">
              최대 보유량까지만 설정 가능합니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPostRewardSelector;
