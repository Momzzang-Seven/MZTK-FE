interface Props {
  userInputs: string[];
  emptyIndices: number[];
  onChange: (idx: number, val: string) => void;
  onVerify: () => void;
}

export const MnemonicVerify = ({
  userInputs,
  emptyIndices,
  onChange,
  onVerify,
}: Props) => (
  <div className="flex flex-col h-full pt-12 animate-in slide-in-from-right-4 duration-500">
    {/* ── Header ── */}
    <div className="mb-8">
      <h1 className="text-[28px] font-black text-gray-900 leading-tight tracking-tight mb-3">
        구문 확인 단계
      </h1>
      <p className="text-gray-400 text-[14px] font-bold leading-relaxed">
        기록해두신 단어들을 순서대로 입력해 주세요.
        <br />
        모든 단어가 일치해야 지갑 생성이 완료됩니다.
      </p>
    </div>

    {/* ── Input Grid ── */}
    <div className="grid grid-cols-3 gap-2.5 my-10">
      {userInputs.map((word, i) => {
        const isEditable = emptyIndices.includes(i);
        return (
          <div key={i} className="relative group">
            <span
              className={`absolute top-1.5 left-2.5 text-[9px] font-black ${isEditable ? "text-main" : "text-gray-300"}`}
            >
              {i + 1}
            </span>
            <input
              value={word}
              onChange={(e) => onChange(i, e.target.value)}
              disabled={!isEditable}
              placeholder={isEditable ? "???" : ""}
              className={`w-full h-[56px] px-2 pt-2 border rounded-2xl text-center text-[14px] font-black outline-none transition-all ${
                isEditable
                  ? "border-main/50 bg-white shadow-sm focus:ring-4 focus:ring-main/10 focus:border-main text-gray-900 placeholder:text-gray-200"
                  : "border-gray-50 bg-gray-50 text-gray-300"
              }`}
            />
          </div>
        );
      })}
    </div>

    {/* ── Action Button ── */}
    <div className="mt-auto pb-8">
      <button
        onClick={onVerify}
        className="btn-press w-full h-[60px] bg-main text-black rounded-[22px] font-black text-[16px] shadow-lg shadow-main/20 border-none"
      >
        비밀번호 설정 단계로
      </button>
    </div>
  </div>
);
