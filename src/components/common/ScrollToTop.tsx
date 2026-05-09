import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 페이지 이동 시 항상 최상단으로 스크롤을 리셋하는 컴포넌트
 * 사용자 요청에 따라 부드러운 스크롤(smooth) 효과 적용
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 최상단으로 부드럽게 이동
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
