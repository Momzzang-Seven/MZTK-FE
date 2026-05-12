import { BoardToggle, SearchBar } from "@components/community";

const CommunityHeader = () => {
  return (
    <div className="z-[998] fixed top-0 w-full max-w-[450px] bg-gradient-to-b from-[#F9FAFB] from-60% via-[#F9FAFB]/60 via-70% to-transparent to-100% px-5 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <BoardToggle />
      <SearchBar />
    </div>
  );
};

export default CommunityHeader;
