interface WithdrawAmtProps {
  amt: number;
  value: string;
  onChange: (val: string) => void;
}

export const WithdrawAmt = ({ amt, value, onChange }: WithdrawAmtProps) => {
  const percentageList = [25, 50, 75, 100];

  const handlePercentageClick = (percentage: number) => {
    if (amt <= 0) return;

    const calculatedAmt = amt * (percentage / 100);

    onChange(Math.floor(calculatedAmt).toString());
  };

  const isSelected = (percentage: number) => {
    if (!value || amt === 0) return false;
    const currentPercent = (Number(value) / amt) * 100;
    return Math.round(currentPercent) === percentage;
  };

  return (
    <div className="flex flex-col rounded-lg w-full h-fit gap-y-3 items-start justify-start animate-in fade-in duration-300">
      <div className="flex justify-between w-full">
        <div className="text-grey-deep label">출금 금액</div>
        <div className="text-xs text-grey-main">
          잔액: {amt.toLocaleString()} MZT
        </div>
      </div>

      <div className="flex flex-col rounded-lg p-6 w-full h-fit gap-y-3 items-start justify-start border border-1 border-grey-main focus-within:border-main transition-colors">
        <div className="w-full flex flex-row gap-x-2 items-end justify-end">
          <input
            className="text-[30px] font-bold flex-1 w-full text-right outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-grey-pale"
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
          />
          <div className="body shrink-0 pb-2 text-black font-medium">MZTK</div>
        </div>

        <div className="flex flex-row gap-x-2 w-full mt-2">
          {percentageList.map((percentage) => {
            const active = isSelected(percentage);
            return (
              <button
                key={percentage}
                type="button"
                onClick={() => handlePercentageClick(percentage)}
                className={`${active
                    ? "bg-main text-white shadow-sm"
                    : "bg-grey-pale text-grey-deep"
                  } w-full text-center rounded-xl py-2 px-3 label hover:brightness-95 active:scale-95 transition-all`}
              >
                {percentage === 100 ? "전체" : `${percentage}%`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
