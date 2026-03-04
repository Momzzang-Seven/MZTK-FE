import { useNavigate } from "react-router-dom";

export const LeaderboardBanner = () => {
    const navigate = useNavigate();
    // 임시 랭킹 데이터 (추후 API 연동 필요)
    const myRank = 142;
    const totalUsers = 10000;

    return (
        <div
            onClick={() => navigate('/leaderboard')}
            className="w-full bg-gray-900 rounded-[20px] p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
            {/* 배경 장식 */}
            <div className="absolute -right-4 -top-8 w-32 h-32 bg-white opacity-[0.03] rounded-full blur-2xl pointer-events-none"></div>

            {/* 좌측: 상단 배너와 동일한 크기의 아이콘 영역 */}
            <div className="shrink-0 mr-4">
                <img
                    src="/icon/leaderboard.svg"
                    alt="leaderboard"
                    width={40}
                    height={40}
                    className="brightness-0 invert transform scale-110 opacity-90 drop-shadow-md"
                />
            </div>

            {/* 우측: 컨텐츠 */}
            <div className="flex flex-col flex-1 items-start gap-2">
                <span className="font-bold text-[16px] tracking-tight text-white/95">내 현재 등수</span>

                <div className="flex items-end gap-1.5 h-6">
                    <span className="text-[28px] font-extrabold leading-none tracking-tighter text-main translate-y-1">
                        {myRank.toLocaleString()}
                    </span>
                    <span className="text-[15px] font-bold text-white/90">위</span>
                </div>

                <p className="text-[12px] font-bold opacity-90 text-white">
                    전체 상위 {((myRank / totalUsers) * 100).toFixed(1)}% 달성 중! 🚀
                </p>
            </div>
        </div>
    );
};

export default LeaderboardBanner;
