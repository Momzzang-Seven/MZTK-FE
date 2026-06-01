import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/auth/useAuth";
import { CommonButton } from "@components/common";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const handleLocalLogin = async () => {
    const email = localEmail.trim();

    if (!email || !localPassword) {
      setLocalError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setIsLocalSubmitting(true);
      setLocalError("");

      const response = await login({
        provider: "LOCAL",
        email,
        password: localPassword,
      });

      if (
        response &&
        !response.isNewUser &&
        response.userInfo.walletAddress &&
        !localStorage.getItem("encrypted_wallet")
      ) {
        navigate("/restore-wallet");
        return;
      }

      if (response?.isNewUser) {
        navigate("/register");
        return;
      }

      if (response?.userInfo.role === "TRAINER") {
        navigate("/trainer");
        return;
      }

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLocalError(
          error.response?.data?.message ??
            "로그인에 실패했습니다. 입력값을 다시 확인해 주세요."
        );
      } else {
        setLocalError("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const slides = [
    {
      title: "매일의 운동이\n가치가 되는 순간",
      description:
        "어떤 운동이든 사진 한 장으로 인증하고\nMZTK 토큰 보상을 받으세요.",
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-amber-400 opacity-20 blur-[30px] rounded-full animate-pulse" />
          <svg
            width="64"
            height="64"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26 12C26 10.3431 24.6569 9 23 9H9C7.34315 9 6 10.3431 6 12V20C6 21.6569 7.34315 23 9 23H23C24.6569 23 26 21.6569 26 20V12Z"
              fill="#FAB12F"
              fillOpacity="0.15"
              stroke="#FAB12F"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M11 16H21"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M16 11V21"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="23"
              cy="9"
              r="3"
              fill="#FFD95A"
              stroke="#FAB12F"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "기록을 넘어선\n새로운 운동 경험",
      description:
        "블록체인 기술로 투명하게 기록되는\n당신만의 운동 히스토리를 확인하세요.",
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-orange-400 opacity-20 blur-[30px] rounded-full animate-pulse" />
          <svg
            width="64"
            height="64"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="16"
              cy="16"
              r="10"
              fill="#FAB12F"
              fillOpacity="0.2"
              stroke="#FAB12F"
              strokeWidth="2"
            />
            <circle
              cx="16"
              cy="16"
              r="6"
              fill="#FFD95A"
              stroke="#FAB12F"
              strokeWidth="2"
            />
            <path
              d="M16 13V19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M13 16H19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "함께 성장하는\n운동 커뮤니티",
      description: "동기부여가 필요할 때,\n함께 운동하고 보상을 나눠보세요.",
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-yellow-400 opacity-20 blur-[30px] rounded-full animate-pulse" />
          <svg
            width="64"
            height="64"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="12"
              r="4"
              fill="#FAB12F"
              fillOpacity="0.2"
              stroke="#FAB12F"
              strokeWidth="2"
            />
            <circle
              cx="21"
              cy="12"
              r="4"
              fill="#FAB12F"
              fillOpacity="0.2"
              stroke="#FAB12F"
              strokeWidth="2"
            />
            <path
              d="M6 22C6 19.7909 7.79086 18 10 18H12C14.2091 18 16 19.7909 16 22V24H6V22Z"
              fill="#FFD95A"
              stroke="#FAB12F"
              strokeWidth="2"
            />
            <path
              d="M16 22C16 19.7909 17.7909 18 20 18H22C24.2091 18 26 19.7909 26 22V24H16V22Z"
              fill="#FFD95A"
              stroke="#FAB12F"
              strokeWidth="2"
            />
          </svg>
        </div>
      ),
    },
  ];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleLogin = (type: "kakao" | "google") => {
    const redirectUri = `${window.location.origin}/callback`;
    let url = "";
    if (type === "kakao") {
      url = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=kakao`;
    } else {
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&state=google`;
    }
    window.location.href = url;
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white relative overflow-hidden">
      {/* ── Background Decoration ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[100%] h-[40%] bg-main opacity-[0.03] blur-[100px] rounded-full" />
      </div>

      {/* ── Main Hero Section ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10">
        <div className="mb-12 transition-all duration-700">
          {slides[currentSlide].icon}
        </div>

        {/* Text Section with Smooth Transitions */}
        <div className="text-center h-36 flex flex-col items-center justify-start">
          <h2 className="text-gray-900 text-[26px] font-black leading-[1.2] tracking-tight whitespace-pre-line mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {slides[currentSlide].title}
          </h2>
          <p className="text-gray-400 text-[15px] font-bold leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mt-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide ? "bg-main w-8" : "bg-gray-100 w-1.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Action Section ── */}
      <div className="px-8 pb-14 w-full flex flex-col gap-3.5 z-20">
        <button
          onClick={() => handleLogin("kakao")}
          className="btn-press w-full h-[60px] bg-[#FEE500] rounded-[22px] flex items-center justify-center gap-3.5 shadow-xl shadow-yellow-100/50 border-none"
        >
          <img src="/icon/kakao.svg" alt="kakao" className="w-5 h-5" />
          <span className="text-black font-black text-[16px]">
            카카오로 로그인
          </span>
        </button>

        <button
          onClick={() => handleLogin("google")}
          className="btn-press w-full h-[60px] bg-white border border-gray-100 rounded-[22px] flex items-center justify-center gap-3.5 shadow-xl shadow-gray-100/50"
        >
          <img src="/icon/google.svg" alt="google" className="w-5 h-5" />
          <span className="text-gray-900 font-black text-[16px]">
            구글로 로그인
          </span>
        </button>

        <div className="mt-3 flex flex-col gap-2.5">
          <input
            type="email"
            value={localEmail}
            onChange={(event) => setLocalEmail(event.target.value)}
            placeholder="이메일"
            autoComplete="username"
            className="h-11 rounded-xl border border-white bg-white px-4 text-sm text-gray-900 outline-none focus:border-[#FAB12F]/40 focus:ring-2 focus:ring-[#FAB12F]/20"
          />
          <input
            type="password"
            value={localPassword}
            onChange={(event) => setLocalPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleLocalLogin();
              }
            }}
            placeholder="비밀번호"
            autoComplete="current-password"
            className="h-11 rounded-xl border border-white bg-white px-4 text-sm text-gray-900 outline-none focus:border-[#FAB12F]/40 focus:ring-2 focus:ring-[#FAB12F]/20"
          />
          {localError && (
            <p className="px-1 text-[12px] font-medium text-red-500">
              {localError}
            </p>
          )}
          <CommonButton
            label={isLocalSubmitting ? "로그인 중..." : "로컬 계정 로그인"}
            bgColor="bg-[#FAB12F]"
            textColor="text-white"
            onClick={handleLocalLogin}
            disabled={isLocalSubmitting}
            className="h-[48px] rounded-xl text-sm font-bold shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
