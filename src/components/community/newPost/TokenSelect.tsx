import { useState } from "react";
// import { useTokenBalance } from "@hooks";

interface TokenSelectProps {
  reward: number;
  setReward: React.Dispatch<React.SetStateAction<number>>;
}

const TokenSelect = ({ reward, setReward }: TokenSelectProps) => {
  // const { balance } = useTokenBalance();
  const dummyBalance = 80;
  const [customValue, setCustomValue] = useState("");

  const setAmount = (value: number) => {
    if (value < 0) return;
    if (value > dummyBalance) value = dummyBalance;
    setReward(value);
  };

  const amountButtons = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomValue(value);

    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
      setAmount(numberValue);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 10단위 선택 버튼 */}
      <div className="grid grid-cols-5 w-full border border-gray-300">
        {amountButtons.map((amount, index) => {
          const isSelected = reward === amount;

          const isLastCol = (index + 1) % 5 === 0;
          const isLastRow = index >= amountButtons.length - 5;

          return (
            <button
              key={amount}
              onClick={() => setAmount(amount)}
              disabled={amount > dummyBalance}
              className={`
                w-full aspect-square flex items-center justify-center
                transition-colors

                border-gray-300
                ${!isLastCol ? "border-r" : ""}
                ${!isLastRow ? "border-b" : ""}

                ${
                  isSelected
                    ? "bg-main text-white font-semibold"
                    : "bg-white hover:bg-gray-50"
                }

                disabled:opacity-30
              `}
            >
              {amount}
            </button>
          );
        })}
      </div>

      {/* 직접 입력 */}
      <div className="flex flex-col gap-1">
        <input
          type="number"
          value={customValue}
          onChange={handleCustomInput}
          min={0}
          max={dummyBalance}
          placeholder={"직접 입력"}
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex justify-end text-main font-semibold mr-1">
        보유 토큰: {dummyBalance}
      </div>
    </div>
  );
};

export default TokenSelect;
