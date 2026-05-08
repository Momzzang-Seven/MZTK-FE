import { useNavigate } from "react-router-dom";

const ACTION_ITEMS = [
  {
    id: "wallet",
    label: "지갑 변경",
    desc: "연결 지갑 교체",
    path: "/register-wallet",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAB12F"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "토큰 내역",
    desc: "입출금 기록 조회",
    path: "/my-tkn-history",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAB12F"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
] as const;

export const TokenActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 w-full">
      {ACTION_ITEMS.map(({ id, label, desc, path, icon }) => (
        <button
          key={id}
          onClick={() => navigate(path)}
          className="btn-press flex-1 bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-100/50 p-4 text-left hover:border-main/20 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-main/8 flex items-center justify-center mb-3 group-hover:bg-main/15 transition-colors">
            {icon}
          </div>
          <p className="text-gray-900 font-black text-[13px]">{label}</p>
          <p className="text-gray-400 text-[11px] font-bold mt-0.5">{desc}</p>
        </button>
      ))}
    </div>
  );
};
