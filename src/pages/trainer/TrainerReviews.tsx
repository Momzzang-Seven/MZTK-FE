import TrainerHeader from "@components/trainer/TrainerHeader";

const TrainerReviews = () => {
  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh">
      <TrainerHeader title="후기 보기" showBack />

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32 animate-in zoom-in-95 duration-700">
        <div className="relative mb-10">
          {/* Ambient Glow Decorative */}
          <div className="absolute inset-0 bg-main opacity-[0.15] blur-[40px] rounded-full scale-150" />

          {/* Main Visual Icon Container */}
          <div className="relative w-24 h-24 rounded-[32px] bg-white shadow-2xl shadow-gray-200/50 flex items-center justify-center border border-white">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
          </div>

          {/* Status Badge Decor */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-gray-900 shadow-xl flex items-center justify-center border-4 border-[#FDFDFD]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin-slow"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>

        <h2 className="text-[22px] font-black text-gray-900 tracking-tight mb-3 text-center">
          후기 시스템 고도화 중
        </h2>
        <p className="text-gray-400 text-[14px] font-bold text-center leading-relaxed max-w-[280px]">
          트레이너님과 수강생이 더 긴밀하게 소통할 수 있도록{" "}
          <span className="text-main/80">리뷰 API</span> 및 전용 관리 화면을
          준비하고 있습니다.
        </p>

        {/* Indicators */}
        <div className="mt-12 flex gap-2.5">
          <div className="px-4 py-2 rounded-full bg-amber-50 text-main text-[10px] font-black tracking-widest uppercase border border-main/10 shadow-sm">
            Coming Soon
          </div>
          <div className="px-4 py-2 rounded-full bg-gray-50 text-gray-400 text-[10px] font-black tracking-widest uppercase border border-gray-100">
            API Preparing
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerReviews;
