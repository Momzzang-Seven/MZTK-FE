import { useEffect } from "react";
import { useAdminStore } from "@store/adminStore";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";
import UserTable from "@components/admin/user/UserTable";
import { ADMIN_TEXT } from "@constant/admin";

const UserManagement = () => {
    const {
        fetchUsers,
        totalUsers,
        bannedUsers,
        searchUsers,
        statusFilter,
        setStatusFilter,
        roleFilter,
        setRoleFilter
    } = useAdminStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex justify-end items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-main rounded-lg text-white font-bold text-sm shadow-sm">
                    <span>{ADMIN_TEXT.USER.TITLE_TOTAL}</span>
                    <span className="text-lg">{totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] rounded-lg text-white font-bold text-sm shadow-sm">
                    <span>{ADMIN_TEXT.USER.TITLE_BANNED}</span>
                    <span className="text-lg">{bannedUsers.toLocaleString()}</span>
                </div>
            </div>

            {/* Search & Filter Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <AdminSearchBar
                        placeholder={ADMIN_TEXT.USER.SEARCH_PLACEHOLDER}
                        onSearch={searchUsers}
                    />
                </div>

                <div className="flex gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-4 pl-4 pr-10 rounded-xl focus:outline-none focus:border-main text-sm font-bold min-w-[130px] cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as Parameters<typeof setStatusFilter>[0])}
                        >
                            <option value="ALL">{ADMIN_TEXT.COMMON.FILTER.ALL}</option>
                            <option value="ACTIVE">{ADMIN_TEXT.COMMON.FILTER.ACTIVE}</option>
                            <option value="BANNED">{ADMIN_TEXT.COMMON.FILTER.BANNED}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-4 pl-4 pr-10 rounded-xl focus:outline-none focus:border-main text-sm font-bold min-w-[130px] cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as Parameters<typeof setRoleFilter>[0])}
                        >
                            <option value="ALL">{ADMIN_TEXT.COMMON.FILTER.ALL_ROLES}</option>
                            <option value="TRAINER">{ADMIN_TEXT.COMMON.FILTER.TRAINER}</option>
                            <option value="MEMBER">{ADMIN_TEXT.COMMON.FILTER.MEMBER}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <UserTable />
        </div>
    );
};

export default UserManagement;
