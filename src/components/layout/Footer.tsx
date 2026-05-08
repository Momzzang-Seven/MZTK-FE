import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@store";

/* ── Inline SVG icon set (Lucide-style) ── */
const NAV_ITEMS = [
  {
    label: "홈",
    path: "/",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? "#FAB12F" : "none"}
        stroke={active ? "#FAB12F" : "#9CA3AF"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "커뮤니티",
    path: "/community",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#FAB12F" : "#9CA3AF"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          fill={active ? "#FAB12F22" : "none"}
        />
      </svg>
    ),
  },
  {
    label: "마켓",
    path: "/market",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#FAB12F" : "#9CA3AF"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
          fill={active ? "#FAB12F22" : "none"}
        />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "내 클래스",
    path: "/trainer",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#FAB12F" : "#9CA3AF"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          ry="2"
          fill={active ? "#FAB12F22" : "none"}
        />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="9 16 11 18 15 14" />
      </svg>
    ),
  },
  {
    label: "마이페이지",
    path: "/my",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#FAB12F" : "#9CA3AF"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" fill={active ? "#FAB12F22" : "none"} />
        <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
  },
] as const;

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();

  const isTrainer = user?.role === "TRAINER";

  return (
    <div className="z-[998] w-full fixed max-w-[450px] bottom-0">
      {/* Frosted glass bar */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] px-4 pt-3 pb-6">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const effectivePath =
              item.label === "내 클래스"
                ? isTrainer
                  ? "/trainer"
                  : "/market/reservations"
                : item.path;

            const isActive =
              effectivePath === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(effectivePath) &&
                  !NAV_ITEMS.some((other) => {
                    const otherPath =
                      other.label === "내 클래스"
                        ? isTrainer
                          ? "/trainer"
                          : "/market/reservations"
                        : other.path;
                    return (
                      otherPath !== effectivePath &&
                      otherPath !== "/" &&
                      location.pathname.startsWith(otherPath) &&
                      otherPath.length > effectivePath.length
                    );
                  });

            return (
              <button
                key={item.label}
                onClick={() => navigate(effectivePath)}
                className="btn-press relative flex flex-col items-center gap-1 min-w-[52px] group border-none bg-transparent"
              >
                {/* Active pill indicator */}
                <div
                  className={`relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all duration-300 ${
                    isActive ? "bg-main/8" : "bg-transparent"
                  }`}
                >
                  {item.icon(isActive)}
                  {/* Active glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-main/5 blur-sm pointer-events-none" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-black transition-colors duration-200 tracking-tight ${
                    isActive ? "text-main" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-main" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
