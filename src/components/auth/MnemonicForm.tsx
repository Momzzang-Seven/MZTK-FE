import React, { useState } from "react";

interface Props {
  mnemonics: string[];
  description?: React.ReactNode;
  onChange: (idx: number, value: string) => void;
  onBulkChange: (words: string[]) => void;
  onSubmit: () => void;
}

export const MnemonicForm = ({
  mnemonics,
  description,
  onChange,
  onBulkChange,
  onSubmit,
}: Props) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter" && idx < 11) {
      e.preventDefault();
      document.getElementById(`mnemonic-${idx + 1}`)?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const words = text.trim().split(/\s+/);
      if (words.length === 12) {
        onBulkChange(words);
      } else {
        showToast("12개의 단어가 필요합니다");
      }
    } catch {
      showToast("클립보드 접근 실패");
    }
  };

  const handleClearAll = () => {
    onBulkChange(Array(12).fill(""));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 bg-white px-6">
      <div className="mt-16 mb-8">
        <h1 className="text-gray-900 text-[28px] font-black leading-tight mb-3 tracking-tight">
          비밀 복구 구문을
          <br /> 입력해 주세요
        </h1>
        <p className="text-gray-400 text-[14px] font-bold leading-relaxed tracking-tight">
          {description || "사용 중인 지갑의 12개 단어를 입력하세요."}
        </p>
      </div>

      <div className="flex flex-col gap-y-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
            Phrase
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-press flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-[11px] font-black text-gray-400 border-none"
            >
              모두 삭제
            </button>
            <button
              type="button"
              onClick={handlePaste}
              className="btn-press flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-[11px] font-black text-main border-none"
            >
              붙여넣기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {mnemonics.map((word, idx) => (
            <div key={idx} className="relative">
              <span className="absolute left-2.5 top-1.5 text-[9px] font-black text-gray-200">
                {idx + 1}
              </span>
              <input
                id={`mnemonic-${idx}`}
                type="text"
                value={word}
                onChange={(e) => onChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-full h-[52px] pt-2 text-center bg-gray-50/50 border border-transparent rounded-xl text-[14px] font-black text-gray-900 focus:bg-white focus:border-main outline-none transition-all"
                autoComplete="off"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pb-8">
        <button
          onClick={onSubmit}
          disabled={mnemonics.some((w) => w.trim() === "")}
          className="btn-press w-full h-[60px] bg-main text-black rounded-[22px] font-black text-[16px] shadow-lg shadow-main/20 border-none disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none"
        >
          지갑 등록 완료
        </button>
      </div>

      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[12px] font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default MnemonicForm;
