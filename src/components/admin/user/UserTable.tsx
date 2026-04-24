import { useAdminStore, type AdminUser } from "@store/adminStore";
import { ADMIN_TEXT } from "@constant/admin";

const UserTable = () => {
    const { filteredUsers, isLoading, banUser, unbanUser } = useAdminStore();

    if (isLoading) {
        return <div className="p-10 text-center text-gray-500">{ADMIN_TEXT.COMMON.LOADING}</div>;
    }

    if (!filteredUsers || filteredUsers.length === 0) {
        return <div className="p-10 text-center text-gray-500">{ADMIN_TEXT.COMMON.NO_RESULT}</div>;
    }

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-sm">
                        {[
                            ADMIN_TEXT.USER.TABLE.USER,
                            ADMIN_TEXT.USER.TABLE.EMAIL,
                            ADMIN_TEXT.USER.TABLE.JOIN_DATE,
                            ADMIN_TEXT.USER.TABLE.STATUS,
                            ADMIN_TEXT.USER.TABLE.ACTIVITY,
                            ADMIN_TEXT.USER.TABLE.MANAGE
                        ].map((header, index) => (
                            <th key={index} className="py-5 px-6 font-medium">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {filteredUsers.map((user: AdminUser) => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                            <td className="py-4 px-6 flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                    style={{ backgroundColor: user.profileColor }}
                                >
                                    {/* Using first char of nickname if no image */}
                                    {user.nickname.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">{user.nickname}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${user.role === 'TRAINER'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-orange-100 text-main'
                                            }`}>
                                            {user.role === 'TRAINER' ? ADMIN_TEXT.COMMON.FILTER.TRAINER : ADMIN_TEXT.COMMON.FILTER.MEMBER}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-gray-500">{user.email}</td>
                            <td className="py-4 px-6 text-gray-500">{user.joinDate}</td>
                            <td className="py-4 px-6">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold w-16 text-center
                                    ${user.status === 'ACTIVE' ? 'text-green-500 bg-green-50' :
                                        user.status === 'BANNED' ? 'text-gray-500 bg-gray-100' : 'text-red-500 bg-red-50'
                                    }`}
                                >
                                    {user.status === 'ACTIVE' ? ADMIN_TEXT.COMMON.FILTER.ACTIVE :
                                        user.status === 'BANNED' ? ADMIN_TEXT.COMMON.FILTER.BANNED : user.status}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                                게시글 {user.postCount} · 댓글 {user.commentCount}
                            </td>
                            <td className="py-4 px-6">
                                {user.status === 'ACTIVE' && (
                                    <button
                                        aria-label={`${user.email} 사용자 제한`}
                                        onClick={() => banUser(user.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 w-24"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                        {ADMIN_TEXT.USER.BTN_BAN}
                                    </button>
                                )}

                                {user.status === 'BANNED' && (
                                    <button
                                        aria-label={`${user.email} 사용자 제한 해제`}
                                        onClick={() => unbanUser(user.id)}
                                        className="bg-gray-400 hover:bg-gray-500 text-white text-sm font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center w-24"
                                    >
                                        {ADMIN_TEXT.USER.BTN_UNBAN}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
