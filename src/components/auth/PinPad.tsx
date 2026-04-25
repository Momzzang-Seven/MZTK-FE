interface Props {
  title: string;
  desc?: React.ReactNode;
  pin: string;
  onInput: (num: number) => void;
  onDelete: () => void;
}

export const PinPad = ({ title, desc, pin, onInput, onDelete }: Props) => {
  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="mt-16 mb-12">
        <h1 className="font-gmarket text-[28px] leading-tight mb-4">{title}</h1>
        <p className="body text-color-grey-deep">
          {desc || (
            <>
              지갑 이용 승인 시 사용하실 <br /> 6자리 숫자를 입력해주세요
            </>
          )}
        </p>
      </div>

      <div className="flex gap-4 justify-center mb-16">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? "bg-main" : "bg-gray-200"}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((v, i) => {
          if (v === "") return <div key={i} />;
          if (v === "back")
            return (
              <button
                key={i}
                data-click-guard="off"
                onClick={onDelete}
                className="h-[64px] flex items-center justify-center text-color-grey-main"
              >
                ←
              </button>
            );
          return (
            <button
              key={i}
              data-click-guard="off"
              onClick={() => onInput(v as number)}
              className="h-[64px] bg-white border border-gray-50 rounded-2xl font-gmarket text-xl shadow-sm active:bg-main/20"
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PinPad;
