import { useLocation } from "react-router-dom";
import { AuthStatusModal } from "@components/auth/AuthStatusModal";
import { useButtonClickGuard } from "@hooks";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const handleButtonClickCapture = useButtonClickGuard();

  const hideFooterPages = [
    "/login",
    "/onboarding",
    "/register",
    "/create-wallet",
    "/register-wallet",
    "/community/free/",
    "/community/question/",
    "/community/free/new",
    "/community/question/new",
    "/community/answer/new",
    "/community/free/edit",
    "/community/question/edit",
    "/community/answer/edit",
    "/exercise-auth",
    "/record-auth",
    "/location-register",
    "/trainer/list",
    "/trainer/reservations",
    "/trainer/reviews",
    "/trainer/store-register",
    "/market/purchase",
    "/market/review",
    "/verify-wallet"
  ];
  const showHeaderPages: string[] = ["/leaderboard"];
  const shouldShowHeader = showHeaderPages.includes(location.pathname);
  const shouldHideFooter = hideFooterPages.some((path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  return (
    <div
      onClickCapture={handleButtonClickCapture}
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
        <AuthStatusModal />
      </div>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};
