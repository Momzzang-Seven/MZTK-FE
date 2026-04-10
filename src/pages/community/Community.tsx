import { Outlet } from "react-router-dom";
import { CommunityHeader, CreatePostButton } from "@components/community";

const Community = () => {
  return (
    <div className="flex flex-col">
      <CommunityHeader />

      <Outlet />

      <CreatePostButton />
    </div>
  );
};

export default Community;
