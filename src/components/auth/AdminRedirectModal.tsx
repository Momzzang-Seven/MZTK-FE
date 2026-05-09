import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "@store/userStore";
import { CommonModal } from "@components/common/CommonModal";

export const AdminRedirectModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only check if user has ADMIN_SEED role and is not already on an admin page
    if (
      user?.role === "ADMIN_SEED" &&
      !location.pathname.startsWith("/admin")
    ) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, location.pathname]);

  if (!isOpen) return null;

  return (
    <CommonModal
      title="관리자 계정 확인"
      desc="현재 관리자 계정으로 로그인되어 있습니다.<br/>관리자 대시보드로 이동하시겠습니까?"
      confirmLabel="대시보드로 이동"
      onConfirmClick={() => {
        setIsOpen(false);
        navigate("/admin/dashboard");
      }}
      cancelLabel="현재 페이지 유지"
      onCancelClick={() => setIsOpen(false)}
      variant="info"
    />
  );
};
