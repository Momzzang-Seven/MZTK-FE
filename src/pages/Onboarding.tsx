import { useNavigate } from "react-router-dom";
import { FullScreenPage } from "@components/layout";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <FullScreenPage className="pt-16 pb-12 bg-white overflow-hidden">
      {/* ── Background Decoration ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-main opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* ── Header Section ── */}
      <div className="relative z-10 mb-12">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FAB12F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
            <path d="M16 12h5" />
            <circle cx="16" cy="12" r="2" />
          </svg>
        </div>
        <h1 className="text-[32px] font-black text-gray-900 leading-[1.2] tracking-tight mb-4">
          안전한 보상을 위해
          <br />
          <span className="text-main">지갑</span>을 연결할까요?
        </h1>
        <p className="text-gray-400 text-[16px] font-bold leading-relaxed">
          MZTK 토큰은 블록체인 지갑에 안전하게 보관됩니다.
          <br />
          처음이시라면 3초 만에 새 지갑을 만들 수 있습니다.
        </p>
      </div>

      {/* ── Action Card Section ── */}
      <div className="relative z-10 flex flex-col gap-5 flex-1 justify-center">
        {/* Create Wallet Card */}
        <button
          onClick={() => navigate("/create-wallet")}
          className="btn-press group relative w-full p-6 bg-white border border-gray-100 rounded-[28px] shadow-xl shadow-gray-100/50 flex items-center gap-6 text-left transition-all hover:border-main/30"
        >
          <div className="w-16 h-16 shrink-0 rounded-[20px] bg-amber-50 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-black text-gray-900 mb-0.5">
              새 지갑 생성하기
            </h3>
            <p className="text-[12px] font-bold text-gray-400 leading-snug">
              MZTK 전용 지갑을 즉시 생성해요
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-main group-hover:text-white transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>

        {/* Register Wallet Card */}
        <button
          onClick={() => navigate("/register-wallet")}
          className="btn-press group relative w-full p-6 bg-white border border-gray-100 rounded-[28px] shadow-xl shadow-gray-100/50 flex items-center gap-6 text-left transition-all hover:border-main/30"
        >
          <div className="w-16 h-16 shrink-0 rounded-[20px] bg-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-black text-gray-900 mb-0.5">
              기존 지갑 등록하기
            </h3>
            <p className="text-[12px] font-bold text-gray-400 leading-snug">
              사용 중인 지갑을 연결해요
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-main group-hover:text-white transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>

      {/* ── Help Footer ── */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-[12px] text-gray-300 font-bold">
          지갑은 암호화되어 로컬에만 저장됩니다.
          <br />
          자산 분실 방지를 위해 보안 지침을 준수해 주세요.
        </p>
      </div>
    </FullScreenPage>
  );
};

export default Onboarding;
