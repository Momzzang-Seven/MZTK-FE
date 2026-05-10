import { BoardToggle, SearchBar } from "@components/community";

const CommunityHeader = () => {
  return (
    <div className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] px-5 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <BoardToggle />
      <SearchBar />
    </div>
  );
};

export default CommunityHeader;
