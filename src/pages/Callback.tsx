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
          localStorage.setItem("wallet_address", response.userInfo.walletAddress);
        }

        if (response) {
          const { userInfo, accessToken } = response;
          setUser(userInfo);
          setAccessToken(accessToken);
          navigate("/register");
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

  const providerName = searchParams.get("state") === "google" ? "구글" : "카카오";

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
