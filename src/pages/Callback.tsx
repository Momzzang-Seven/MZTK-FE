import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostLogin } from "@services/auth";
import { useUserStore } from "@store";
import { CommonModal } from "@components/common/CommonModal";
import axios from "axios";

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setAccessToken = useUserStore((state) => state.setAccessToken);
  const loginAttempted = useRef(false);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 추가

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // Use state to identify provider

    if (!code) {
      alert("로그인 실패: 인증 코드가 없습니다.");
      navigate("/login");
      return;
    }

    if (loginAttempted.current) return;
    loginAttempted.current = true;

    const login = async () => {
      try {
        // Simple provider detection based on state or hardcoded for now.
        // You should pass 'kakao' or 'google' in state when redirecting.
        let provider: "KAKAO" | "GOOGLE" = "KAKAO";
        if (state === "google") provider = "GOOGLE";

        const redirectUri = window.location.origin + "/callback";

        const response = await PostLogin({ provider, authorizationCode: code, redirectUri });

        if (response) {
          const { userInfo, accessToken, isNewUser } = response;
          setUser(userInfo);
          setAccessToken(accessToken);
          
          if (isNewUser) {
            navigate("/register");
          } else {
            navigate("/");
          }
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          // 409 Conflict: 이미 다른 소셜로 가입된 경우
          if (err.response?.status === 409) {
            setErrorMessage(err.response.data.message || "이미 다른 소셜 계정으로 가입된 이메일입니다.");
            setIsErrorModalOpen(true);
            return;
          }
          console.error("Login failed", err.message);
        } else {
          console.error("Login failed: Unknown error");
        }
        // 그 외 에러는 일단 기존 처리 (alert 제거하고 리다이렉트만 하거나, 모달 띄우기)
        // 여기서는 명시적인 409 외에는 조용히 실패 후 로그인 이동하거나, 필요 시 모달 확장 가능
        // 일단 409가 아니면 로그인 페이지로 이동
        navigate("/login");
      }
    };

    login();
  }, [searchParams, navigate, setUser, setAccessToken]);

  const providerName =
    searchParams.get("state") === "google" ? "구글" : "카카오";

  return (
    <>
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <div className="text-xl font-bold">{providerName} 로그인 중입니다...</div>
        <div className="text-gray-500">잠시만 기다려주세요.</div>
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
