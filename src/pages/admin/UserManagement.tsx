import { useEffect } from "react";
import { useAdminStore } from "@store/adminStore";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";
import UserTable from "@components/admin/user/UserTable";
import { ADMIN_TEXT } from "@constant/admin";

const UserManagement = () => {
  const {
    fetchUsers,
    totalUsers,
    blockedUsers,
    searchUsers,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    userPage,
    userTotalPages,
    setUserPage,
  } = useAdminStore();

  useEffect(() => {
    void fetchUsers(0);
  }, [fetchUsers]);

  const currentPage = userPage ?? 0;
  const totalPageCount = Math.max(userTotalPages ?? 1, 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:space-y-8">
      {/* Header Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            User Database
          </span>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            {ADMIN_TEXT.USER.TABLE.USER} 관리
          </h3>
        </div>

        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm sm:w-auto sm:px-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {ADMIN_TEXT.USER.TITLE_TOTAL}
              </span>
              <span className="text-xl font-black text-gray-900 tabular-nums">
                {(totalUsers ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                {ADMIN_TEXT.USER.TITLE_BANNED}
              </span>
              <span className="text-xl font-black text-red-500 tabular-nums">
                {(blockedUsers ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white p-5 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <AdminSearchBar
            placeholder={ADMIN_TEXT.USER.SEARCH_PLACEHOLDER}
            onSearch={searchUsers}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative flex-1 md:flex-initial">
            <select
              className="appearance-none w-full bg-gray-50/50 border border-gray-100 text-gray-700 py-3.5 pl-5 pr-12 rounded-[18px] focus:outline-none focus:border-main focus:bg-white text-[13px] font-black transition-all cursor-pointer shadow-sm"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as Parameters<typeof setStatusFilter>[0]
                )
              }
            >
              <option value="ALL">{ADMIN_TEXT.COMMON.FILTER.ALL}</option>
              <option value="ACTIVE">
                {ADMIN_TEXT.COMMON.FILTER.ACTIVE} 회원
              </option>
              <option value="BLOCKED">
                {ADMIN_TEXT.COMMON.FILTER.BANNED} 회원
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Role Filter */}
          <div className="relative flex-1 md:flex-initial">
            <select
              className="appearance-none w-full bg-gray-50/50 border border-gray-100 text-gray-700 py-3.5 pl-5 pr-12 rounded-[18px] focus:outline-none focus:border-main focus:bg-white text-[13px] font-black transition-all cursor-pointer shadow-sm"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value as Parameters<typeof setRoleFilter>[0]
                )
              }
            >
              <option value="ALL">{ADMIN_TEXT.COMMON.FILTER.ALL_ROLES}</option>
              <option value="TRAINER">
                {ADMIN_TEXT.COMMON.FILTER.TRAINER}
              </option>
              <option value="MEMBER">{ADMIN_TEXT.COMMON.FILTER.MEMBER}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <UserTable />

      <div className="flex flex-col gap-3 rounded-[24px] border border-gray-100 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)] sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.18em]">
          Page {currentPage + 1} / {totalPageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void setUserPage(currentPage - 1)}
            disabled={currentPage <= 0}
            className="px-4 py-2 rounded-xl border border-gray-100 text-[12px] font-black text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => void setUserPage(currentPage + 1)}
            disabled={currentPage + 1 >= totalPageCount}
            className="px-4 py-2 rounded-xl border border-gray-100 text-[12px] font-black text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
