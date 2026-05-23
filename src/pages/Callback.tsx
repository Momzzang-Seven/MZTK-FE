import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CommonModal } from "@components/common/CommonModal";
import { PostLogin } from "@services/auth";
import { useAuthModalStore, useUserStore } from "@store";
import { isSanctionedAccountError } from "@utils";

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setAccessToken = useUserStore((state) => state.setAccessToken);
  const setSanctioned = useAuthModalStore((state) => state.setSanctioned);
  const loginAttempted = useRef(false);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      alert("로그인 실패: 인증 코드가 없습니다.");
      navigate("/login");
      return;
    }

    if (loginAttempted.current) return;
    loginAttempted.current = true;

    const login = async () => {
      try {
        let provider: "KAKAO" | "GOOGLE" = "KAKAO";
        if (state === "google") provider = "GOOGLE";

        const redirectUri = window.location.origin + "/callback";

        const response = await PostLogin({
          provider,
          authorizationCode: code,
          redirectUri,
        });

        if (response?.userInfo.walletAddress) {
          localStorage.setItem(
            "wallet_address",
            response.userInfo.walletAddress
          );
        }

        if (response) {
          const { userInfo, accessToken, isNewUser } = response;
          setUser(userInfo);
          setAccessToken(accessToken);

          if (isNewUser) {
            navigate("/register");
          } else if (
            userInfo.walletAddress &&
            !localStorage.getItem("encrypted_wallet")
          ) {
            navigate("/restore-wallet");
          } else if (userInfo.role === "TRAINER") {
            navigate("/trainer");
          } else {
            navigate("/");
          }
        }
      } catch (err: unknown) {
        if (isSanctionedAccountError(err, { allowBareForbidden: true })) {
          setSanctioned(true);
          return;
        }

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 409) {
            setErrorMessage(
              err.response.data.message ||
                "이미 다른 소셜 계정으로 가입된 이메일입니다."
            );
            setIsErrorModalOpen(true);
            return;
          }

          console.error("Login failed", err.message);
        } else {
          console.error("Login failed: Unknown error");
        }
        navigate("/login");
      }
    };

    login();
  }, [searchParams, navigate, setUser, setAccessToken, setSanctioned]);

  const providerName =
    searchParams.get("state") === "google" ? "구글" : "카카오";

  return (
    <>
      <div className="relative flex flex-col items-center justify-center h-dvh bg-[#FDFDFD] overflow-hidden">
        {/* Luxury Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-main/5 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 bg-orange-100/10 rounded-full blur-[100px] animate-pulse" />

        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          {/* Refined Spinner Container */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-main rounded-full animate-spin shadow-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-main rounded-full animate-ping" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-gray-900 text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="text-main">{providerName}</span> 로그인 진행 중
            </h1>
            <div className="flex flex-col gap-1.5">
              <p className="text-gray-400 text-[14px] font-bold tracking-tight">
                안전하게 계정 정보를 확인하고 있습니다
              </p>
              <div className="flex items-center justify-center gap-1">
                <span
                  className="w-1 h-1 bg-gray-200 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <span
                  className="w-1 h-1 bg-gray-200 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1 h-1 bg-gray-200 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="absolute bottom-12 flex items-center gap-2.5 opacity-30 grayscale pointer-events-none">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-black text-[12px] tracking-[0.3em] text-gray-900 uppercase">
            MOMZZANG-7
          </span>
        </div>
      </div>

      {isErrorModalOpen && (
        <CommonModal
          title="로그인 실패"
          desc={errorMessage}
          confirmLabel="확인"
          onConfirmClick={() => navigate("/login")}
        />
      )}
    </>
  );
};

export default Callback;
