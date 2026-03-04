import { CommonButton } from "@components/common";
import { useEffect, useState, useRef, useCallback } from "react";

const Login = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      id: 1,
      title: "매일 운동하고\n인증하세요",
      description:
        "러닝, 헬스, 홈트레이닝...\n어떤 운동이든 사진 한 장이면 인증 완료!",
      icon: (
        <svg
          width="120"
          height="120"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#FAB12F]"
        >
          <g clipPath="url(#clip0_7_1406)">
            <path
              d="M24.6305 5.47329C23.7586 6.70845 22.0633 6.99907 20.8282 6.15141C19.593 5.30376 19.3024 3.58423 20.15 2.34907C21.0219 1.11391 22.7172 0.82329 23.9524 1.67095C25.1875 2.5186 25.5024 4.23813 24.6305 5.47329ZM30.7821 8.50063L27.5852 13.1022C27.2219 13.6592 26.4711 13.7803 25.9141 13.417L21.3125 10.2202L16.3961 17.51L20.586 20.4405C20.9493 20.6827 21.2399 21.0944 21.3125 21.5303L22.4993 28.2389C22.6446 29.1592 22.0149 30.0553 21.0946 30.2249C20.1743 30.3702 19.2782 29.7405 19.1086 28.8202L18.043 22.7897L12.7633 19.0358C12.7633 19.0358 9.97817 23.0561 9.78442 23.2983C9.59067 23.5405 9.42113 23.8795 9.10629 24.0491C8.69457 24.2913 8.2102 24.3155 7.79848 24.2186L1.21098 22.4506C0.314886 22.2084 -0.217927 21.2881 0.0242603 20.3678C0.266448 19.4717 1.18676 18.9389 2.10707 19.1811L7.50785 20.61L16.1297 8.08891H12.8118L9.97817 12.1577C9.61489 12.7147 8.8641 12.8358 8.30707 12.4725C7.75004 12.1092 7.62895 11.3584 7.99223 10.8014L11.1891 6.22407C11.4313 5.86079 11.843 5.66704 12.2547 5.71548H17.7766C18.6 5.71548 19.4235 5.95766 20.1258 6.46626L21.8938 7.72563L26.2532 10.8014L28.8204 7.1686C29.1836 6.61157 29.9344 6.49048 30.4914 6.85376C31.0485 7.21704 31.1696 7.99204 30.7821 8.50063Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="clip0_7_1406">
              <rect width="31" height="31" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      id: 2,
      title: "인증하면\n코인을 드려요",
      description: "운동 완료 후 인증만 해도\n매일매일 코인이 차곡차곡 쌓여요.",
      icon: (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#FAB12F]"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 16V8l4 5 4-5v8" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "트레이너를 위한\n전문 관리 도구",
      description:
        "나만의 클래스를 등록하고 관리하세요. \n트레이너 전용 대시보드로 통계를 한눈에 확인하세요.",
      icon: (
        <svg
          width="120"
          height="120"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#FAB12F]"
        >
          <path d="M12.5 10L15.5 13L21.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 26.5V23.5C5 21.8431 6.34315 20.5 8 20.5H16C17.6569 20.5 19 21.8431 19 23.5V26.5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="11.5" r="4" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="27" width="25" height="1" fill="currentColor" />
        </svg>
      ),
    },
  ];

  // Auto-slide logic
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  // Swipe logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (distance > threshold) {
      // Swipe Left (Next)
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      resetTimer();
    } else if (distance < -threshold) {
      // Swipe Right (Prev)
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      resetTimer();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleLogin = (type: "kakao" | "google") => {
    const redirectUri = window.location.origin + "/callback";
    let url = "";

    if (type === "kakao") {
      const clientId =
        import.meta.env.VITE_KAKAO_CLIENT_ID || "YOUR_KAKAO_CLIENT_ID";
      url = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=kakao`;
    } else if (type === "google") {
      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&state=google`;
    }

    window.location.href = url;
  };

  return (
    <div className="flex flex-col h-full items-center bg-white px-5 pt-16 pb-10">
      {/* 1. Logo Title */}
      <div className="font-gmarket text-[52px] leading-tight text-[#FAB12F] text-center mb-10 shrink-0">
        몸짱
        <br />
        코인
      </div>

      {/* 2. Slider Area (Flexible Height) */}
      <div
        className="flex-1 w-full flex flex-col items-center justify-center max-w-sm mb-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-[#FAB12F] w-6" : "bg-gray-200"
                }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="mb-8 p-6 bg-yellow-50 rounded-full shrink-0 transition-all duration-500 ease-in-out">
          {slides[currentSlide].icon}
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-900 text-center whitespace-pre-line mb-4 h-16 flex items-center justify-center">
          {slides[currentSlide].title}
        </h2>
        <p className="text-gray-500 text-center whitespace-pre-line text-sm leading-relaxed h-12">
          {slides[currentSlide].description}
        </p>
      </div>

      {/* 3. Action Buttons (Fixed Bottom Area) */}
      <div className="w-full max-w-sm flex flex-col gap-3 shrink-0">
        <CommonButton
          label="카카오로 시작하기"
          img="/icon/kakao.svg"
          bgColor="bg-[#FEE500]"
          textColor="text-black"
          onClick={() => handleLogin("kakao")}
          className="w-full title h-[56px] shadow-sm rounded-xl"
        />
        <CommonButton
          label="구글로 시작하기"
          img="/icon/google.svg"
          bgColor="bg-white border border-gray-200"
          textColor="text-black"
          onClick={() => handleLogin("google")}
          className="w-full title h-[56px] shadow-sm rounded-xl"
        />
      </div>
    </div>
  );
};

export default Login;
