import { BoardToggle, SearchBar } from "@components/community";

const CommunityHeader = () => {
  return (
    <div className="flex flex-col gap-2 mx-4 mt-4">
      <BoardToggle />
      <div className="p-1">
        <SearchBar />
      </div>
    </div>
  );
};

export default CommunityHeader;
