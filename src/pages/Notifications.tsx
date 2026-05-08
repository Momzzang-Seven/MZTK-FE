import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] px-6 pt-12 pb-24">
      {/* Header */}
      <div
        className="flex items-center gap-4 mb-12 animate-fade-slide-up"
        style={{ animationDelay: "0s" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="btn-press w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-gray-900 text-xl font-black tracking-tight">
          알림
        </h1>
      </div>

      {/* Empty State / Coming Soon */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center animate-scale-in"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="relative mb-8">
          {/* Decorative Circles */}
          <div className="absolute inset-0 bg-main opacity-[0.08] blur-[40px] rounded-full scale-150" />

          <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl shadow-main/10 flex items-center justify-center border border-gray-50">
            {/* Lucide: BellOff / Construction */}
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              <path d="M17 17H3" />
              <path d="M7 17v-2.8c.4-1.3.8-2.6.8-4.2 0-2.3 1.9-4.2 4.2-4.2s4.2 1.9 4.2 4.2c0 1.6.4 2.9.8 4.2V17" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          </div>
        </div>

        <h2 className="text-gray-900 text-2xl font-black mb-3">
          알림 기능 준비 중
        </h2>
        <p className="text-gray-400 text-sm font-bold leading-relaxed max-w-[240px]">
          더 스마트한 운동 알림 서비스를 <br />
          열심히 개발하고 있어요! 조금만 기다려주세요. 👷‍♂️
        </p>

        <button
          onClick={() => navigate("/")}
          className="btn-press mt-12 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-900/20 border-none"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default Notifications;
