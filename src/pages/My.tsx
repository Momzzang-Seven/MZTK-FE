import {
  CurrentTkn,
  LevelProgress,
  LevelReward,
  TokenActionButtons,
  UserProfile,
} from "@components/my";
import { useNavigate } from "react-router-dom";

const ACTIVITY_BUTTONS = [
  {
    label: "내가 쓴 글",
    tab: "written",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43739 22.1213 4.00001C22.1213 4.56263 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "좋아요",
    tab: "liked",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39462C21.7563 5.72715 21.351 5.12076 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "댓글 단 글",
    tab: "commented",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
] as const;

const My = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col pt-[38px] px-[22px] gap-y-5 items-start justify-start pb-20 overflow-y-auto w-full">
      <UserProfile />

      {/* 인증 위치 변경 버튼 */}
      <button
        onClick={() => navigate("/location-register", { state: { from: "my" } })}
        className="w-full bg-gray-50 text-gray-500 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
      >
        인증 위치 변경하기
      </button>

      <div className="flex flex-col gap-3 w-full">
        <CurrentTkn />
        <TokenActionButtons />
      </div>
      <LevelProgress />
      <LevelReward />

      {/* 내 커뮤니티 활동 — 1열 3행 버튼 */}
      <div className="w-full h-px bg-gray-100" />
      <div className="flex flex-col w-full gap-2">
        <h2 className="font-bold text-[15px] text-gray-800">내 커뮤니티 활동</h2>
        <div className="flex flex-col gap-2 w-full">
          {ACTIVITY_BUTTONS.map(({ label, tab, icon }) => (
            <button
              key={tab}
              onClick={() => navigate(`/my/activity/${tab}`)}
              className="w-full bg-white text-main font-bold py-3.5 px-4 rounded-xl border-2 border-main hover:bg-main/5 transition-colors text-sm flex items-center gap-2.5"
            >
              <span className="text-main shrink-0">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="caption text-center flex justify-center w-full text-grey-main">
        지급 오류 또는 지연 관련 문의는
        <span className="text-main"> 다음 링크 </span>를 이용해 주세요.
      </div>
    </div>
  );
};

export default My;
