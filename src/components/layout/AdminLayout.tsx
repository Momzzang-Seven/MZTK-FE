import { AuthStatusModal } from "@components/auth/AuthStatusModal";
import { useButtonClickGuard } from "@hooks";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const handleButtonClickCapture = useButtonClickGuard();

  return (
    <div
      onClickCapture={handleButtonClickCapture}
      className="flex w-full min-h-screen bg-[#F8F9FB]"
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-10 flex-1 overflow-y-auto">{children}</main>
        <AuthStatusModal />
      </div>
    </div>
  );
};
