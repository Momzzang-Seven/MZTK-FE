import { AuthStatusModal } from "@components/auth/AuthStatusModal";
import { useButtonClickGuard } from "@hooks";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminErrorModal } from "@components/admin/common/AdminErrorModal";
import { GlobalConfirmModal } from "@components/common/GlobalConfirmModal";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const handleButtonClickCapture = useButtonClickGuard();

  return (
    <div
      onClickCapture={handleButtonClickCapture}
      className="flex w-full min-h-dvh flex-col overflow-x-hidden bg-[#FAFAFA] lg:flex-row"
    >
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
        <AuthStatusModal />
        <AdminErrorModal />
        <GlobalConfirmModal />
      </div>
    </div>
  );
};
