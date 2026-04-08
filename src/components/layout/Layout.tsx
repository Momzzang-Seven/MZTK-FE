import { useNavigate, useLocation } from "react-router-dom";
import { useAuthModalStore } from "@store";
import { CommonModal } from "@components/common";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unauthorized, setUnauthorized } = useAuthModalStore();

  const hideFooterPages = [
    "/login",
    "/onboarding",
    "/register",
    "/create-wallet",
    "/register-wallet",
    "/community/free/",
    "/community/question/",
    "/community/new/free",
    "/community/new/question",
    "/community/new/answer",
    "/community/edit",
    "/exercise-auth",
    "/record-auth",
    "/location-register",
    "/trainer/list",
    "/trainer/reservations",
    "/trainer/reviews",
    "/trainer/store-register",
    "/market/purchase",
    "/market/review",
  ];
  const showHeaderPages: string[] = ["/leaderboard"];
  const shouldShowHeader = showHeaderPages.includes(location.pathname);
  const shouldHideFooter = hideFooterPages.some((path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  return (
    <div
      className={`bg-white w-full min-h-screen mx-auto flex flex-col max-w-[420px] items-center`}
    >
      {shouldShowHeader && <Header />}
      <div
        className={`w-full flex flex-col flex-1 overflow-y-auto
          ${!shouldHideFooter ? "pb-[82px]" : ""}
          ${shouldShowHeader ? "pt-[72px]" : ""}
          `}
      >
        {children}

        {unauthorized && (
          <CommonModal
            title="로그인이 필요해요"
            desc="  서비스를 이용하시려면 로그인이 필요해요. <br /> 로그인 페이지로 이동할까요?"
            confirmLabel="로그인 페이지로 이동"
            onConfirmClick={() => {
              setUnauthorized(false);
              navigate("/login");
            }}
          />
        )}
      </div>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};
