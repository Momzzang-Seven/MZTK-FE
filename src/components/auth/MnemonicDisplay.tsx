import { useState } from "react";

interface Props {
  mnemonics: string[];
  onNext: () => void;
}

export const MnemonicDisplay = ({ mnemonics, onNext }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonics.join(" "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full pt-12 animate-in fade-in duration-500 px-6 bg-white">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-gray-900 leading-tight tracking-tight mb-3">
          비밀 복구 구문을
          <br />
          <span className="text-main">안전하게</span> 보관하세요
        </h1>
        <p className="text-gray-400 text-[14px] font-bold leading-relaxed">
          이 12개의 단어는 지갑을 복구할 수 있는 유일한 방법입니다.
          <br />
          반드시 오프라인에 기록하여 보관해 주세요.
        </p>
      </div>

      {/* ── Security Alert (Simpler) ── */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm shadow-red-100">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <p className="text-[12px] font-black text-red-500 leading-tight">
          절대로 타인에게 노출하거나 온라인에 기록하지 마세요.
        </p>
      </div>

      {/* ── Mnemonic Grid ── */}
      <div className="grid grid-cols-3 gap-2 mb-10">
        {mnemonics.map((word, i) => (
          <div
            key={i}
            className="h-[52px] flex items-center justify-center border border-gray-100 rounded-xl bg-gray-50/30 text-[14px] font-black text-gray-900 tracking-tight"
          >
            <span className="mr-1.5 text-[10px] text-gray-300">{i + 1}</span>
            {word}
          </div>
        ))}
      </div>

      {/* ── Action Buttons (Cleaner) ── */}
      <div className="mt-auto flex flex-col gap-3 pb-8">
        <button
          onClick={handleCopy}
          className={`btn-press w-full h-[60px] rounded-[22px] font-black text-[15px] flex items-center justify-center gap-2 border-none transition-all ${
            copied ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {copied ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
          {copied ? "복사 완료" : "구문 전체 복사"}
        </button>

        <button
          onClick={onNext}
          className="btn-press w-full h-[60px] bg-main text-black rounded-[22px] font-black text-[16px] shadow-lg shadow-main/20 border-none"
        >
          안전한 곳에 보관했습니다
        </button>
      </div>
    </div>
  );
};
