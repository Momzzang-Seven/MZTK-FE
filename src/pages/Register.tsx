import { useNavigate } from "react-router-dom";
import { FullScreenPage } from "@components/layout";

const Register = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    console.log(`Selected Role: ${role}`);
    navigate("/onboarding");
  };

  return (
    <FullScreenPage className="pt-16 pb-12 bg-white overflow-hidden">
      {/* ── Background Decoration ── */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-main opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1 className="text-[32px] font-black text-gray-900 leading-[1.2] tracking-tight mb-4">
          MZTK 서비스에서
          <br />
          <span className="text-main">당신의 역할</span>을<br />
          선택해 주세요
        </h1>
        <p className="text-gray-400 text-[16px] font-bold leading-relaxed">
          선택한 역할에 따라 맞춤형 운동 대시보드와
          <br />
          차별화된 보상 시스템이 제공됩니다.
        </p>
      </div>

      {/* ── Role Card Section ── */}
      <div className="relative z-10 flex flex-col gap-5 flex-1 justify-center">
        {/* User Role Card */}
        <button
          onClick={() => handleRoleSelect("USER")}
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-black text-gray-900 mb-0.5">
              일반 사용자
            </h3>
            <p className="text-[12px] font-bold text-gray-400 leading-snug">
              인증하고 토큰 보상을 받아요
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

        {/* Trainer Role Card */}
        <button
          onClick={() => handleRoleSelect("TRAINER")}
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
              <path d="M12 2v10" />
              <path d="M18.4 4.6a9 9 0 1 1-12.8 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-black text-gray-900 mb-0.5">
              트레이너
            </h3>
            <p className="text-[12px] font-bold text-gray-400 leading-snug">
              회원을 코칭하고 클래스를 운영해요
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

      {/* ── Footer Info ── */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-[12px] text-gray-300 font-bold">
          역할은 나중에 설정에서 변경할 수 없습니다.
          <br />
          신중하게 선택해 주세요.
        </p>
      </div>
    </FullScreenPage>
  );
};

export default Register;
