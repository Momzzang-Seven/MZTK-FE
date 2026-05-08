import { useNavigate } from "react-router-dom";

interface AuthPageShellProps {
  /** 뒤로가기 경로, 없으면 navigate(-1) */
  backTo?: string;
  /** 상단 배지 텍스트 (예: "STEP 1 · 위치 인증") */
  badge?: string;
  /** 페이지 제목 */
  title: string;
  /** 제목 아래 설명 */
  subtitle?: string;
  /** 아이콘 박스 내부 SVG */
  icon: React.ReactNode;
  /** 아이콘 박스 배경 */
  iconBg?: string;
  children: React.ReactNode;
}

/**
 * 운동 인증 계열 페이지 공통 쉘
 * 헤더(뒤로가기 + 아이콘 + 제목) + 콘텐츠 슬롯
 */
const AuthPageShell = ({
  backTo,
  badge,
  title,
  subtitle,
  icon,
  iconBg = "bg-main/10",
  children,
}: AuthPageShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-10">
      {/* ── Header ── */}
      <div className="relative px-6 pt-12 pb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-main opacity-[0.07] blur-[60px] rounded-full pointer-events-none" />

        {/* Back button */}
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="btn-press mb-6 w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-main animate-pulse" />
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              {badge}
            </span>
          </div>
        )}

        {/* Title row */}
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}
          >
            {icon}
          </div>
          <div className="pt-0.5">
            <h1 className="text-gray-900 text-2xl font-black tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 text-[12px] font-bold mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 px-6 gap-5">{children}</div>
    </div>
  );
};

export default AuthPageShell;
