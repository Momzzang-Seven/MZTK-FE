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
        title="제재된 계정입니다"
        desc="이 계정은 서비스 이용이 제한되어 로그인할 수 없습니다. 이의 제기나 문의가 필요하면 아래 링크를 이용해주세요."
        confirmLabel="로그인 페이지로 이동"
        onConfirmClick={() => {
          setSanctioned(false);
          navigate("/login");
        }}
      >
        <a
          href={INQUIRY_FORM_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block w-full text-sm font-semibold text-blue-600 underline hover:text-blue-700 transition-colors"
        >
          이의 제기 문의하기
        </a>
      </CommonModal>
    );
  }

  if (unauthorized) {
    return (
      <CommonModal
        title="로그인이 필요해요"
        desc="서비스를 이용하려면 로그인이 필요해요.<br />로그인 페이지로 이동할까요?"
        confirmLabel="로그인 페이지로 이동"
        onConfirmClick={() => {
          setUnauthorized(false);
          navigate("/login");
        }}
      />
    );
  }

  return null;
};
