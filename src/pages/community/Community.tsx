import { Outlet } from "react-router-dom";
import { CommunityHeader, CreatePostButton } from "@components/community";

const Community = () => {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F9FAFB]">
      <CommunityHeader />

      <div className="h-[160px] w-full max-w-[450px]" />

      <main className="flex-1">
        <Outlet />
      </main>

      <CreatePostButton />
    </div>
  );
};

export default Community;
