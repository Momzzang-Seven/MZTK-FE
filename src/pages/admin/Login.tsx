import { useState } from "react";
import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";
import { CommonButton } from "@components/common";
import { useNavigate } from "react-router-dom";
import { PostLogin } from "@services/auth";
import { useUserStore } from "@store/userStore";

const Login = () => {
  const navigate = useNavigate();
  const { setAccessToken, setUser, showSnackbar, clearUser } = useUserStore();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!id || !password) {
      showSnackbar("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      clearUser();
      const res = await PostLogin({
        provider: "LOCAL_ADMIN",
        loginId: id,
        password: password,
      });

      setAccessToken(res.accessToken);
      setUser(res.userInfo);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin Login Failed:", error);
      showSnackbar("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 bg-white min-h-screen">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <div className="flex flex-col text-[32px] font-bold mb-8 text-center leading-tight">
          <span className="text-main">몸짱코인</span>
          <span className="text-gray-800">ADMIN</span>
        </div>

        <div className="flex justify-center items-center w-64 h-64">
          <Lottie animationData={runnerAnimation} loop={true} />
        </div>

        <div className="w-full mt-8 space-y-4">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력하세요"
            className="w-full bg-white border border-gray-300 rounded-[4px] p-4 focus:outline-none focus:ring-2 focus:ring-main transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full bg-white border border-gray-300 rounded-[4px] p-4 focus:outline-none focus:ring-2 focus:ring-main transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          />
        </div>

        <div className="w-full mt-8">
          <CommonButton
            label={isLoading ? "로그인 중..." : "로그인하기"}
            onClick={handleLogin}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
