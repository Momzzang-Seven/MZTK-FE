import { useNavigate } from "react-router-dom";
import { CommonModal } from "@components/common";
import { INQUIRY_FORM_URL } from "@constant";
import { useAuthModalStore } from "@store";

export const AuthStatusModal = () => {
  const navigate = useNavigate();
  const { unauthorized, sanctioned, setUnauthorized, setSanctioned } =
    useAuthModalStore();

  if (sanctioned) {
    return (
      <CommonModal
        variant="error"
        title="계정이 제재되었습니다"
        desc="이 계정은 서비스 이용이 제한되어 로그인할 수 없습니다.<br/>이의 제기나 문의가 필요하면 아래 링크를 이용해 주세요."
        confirmLabel="로그인 페이지로 이동"
        onConfirmClick={() => {
          setSanctioned(false);
          const isAdmin = window.location.pathname.startsWith("/admin");
          navigate(isAdmin ? "/admin" : "/login");
        }}
      >
        <a
          href={INQUIRY_FORM_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span className="text-[13px] font-bold text-red-600 group-hover:text-red-700 transition-colors">
            이의 제기 문의하기
          </span>
        </a>
      </CommonModal>
    );
  }

  if (unauthorized) {
    return (
      <CommonModal
        variant="info"
        title="로그인이 필요해요"
        desc="서비스를 이용하려면 로그인이 필요해요.<br/>로그인 페이지로 이동할까요?"
        confirmLabel="로그인 페이지로 이동"
        cancelLabel="취소"
        onConfirmClick={() => {
          setUnauthorized(false);
          const isAdmin = window.location.pathname.startsWith("/admin");
          navigate(isAdmin ? "/admin" : "/login");
        }}
        onCancelClick={() => setUnauthorized(false)}
      />
    );
  }

  return null;
};
