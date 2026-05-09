import { UI_TEXT } from "@constant/index";
import { LocateFixed } from "lucide-react";

interface LocationMapOverlayProps {
  onCurrentLocationClick: () => void;
}

export const LocationMapOverlay = ({
  onCurrentLocationClick,
}: LocationMapOverlayProps) => {
  return (
    <>
      {/* 20m Radius Indicator - Subtle glass effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-[280px] h-[280px] rounded-full border-[3px] border-main/30 bg-main/5 ring-1 ring-main/10 shadow-[inset_0_0_40px_rgba(250,177,47,0.05)]" />

      {/* Fixed Center Pin (Visual) - Refined Premium Map Pin */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[calc(50%+24px)] z-20 pointer-events-none">
        <div className="relative flex flex-col items-center">
          {/* Main Pin Body */}
          <div className="drop-shadow-[0_8px_16px_rgba(250,177,47,0.4)] animate-bounce-subtle">
            <svg
              width="44"
              height="52"
              viewBox="0 0 44 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 52C22 52 44 34.5111 44 21.6667C44 8.82222 34.1503 0 22 0C9.84974 0 0 8.82222 0 21.6667C0 34.5111 22 52 22 52Z"
                fill="#FAB12F"
              />
              <circle cx="22" cy="21" r="9" fill="white" />
              <circle cx="22" cy="21" r="5" fill="#FAB12F" />
            </svg>
          </div>
          {/* Pulsing Shadow below pin */}
          <div className="w-4 h-1.5 bg-black/10 rounded-full blur-[3px] mt-1 animate-pulse" />
        </div>
      </div>

      {/* Current Location Button */}
      <div className="absolute bottom-[280px] right-5 z-40 flex items-center gap-3 select-none animate-in fade-in slide-in-from-right duration-700 delay-300">
        <div className="hidden sm:flex bg-white/90 backdrop-blur-sm text-gray-900 text-[11px] font-black px-3 py-2 rounded-xl shadow-xl shadow-black/5 border border-white">
          {UI_TEXT.MY_LOCATION_TOOLTIP}
        </div>

        <button
          onClick={onCurrentLocationClick}
          className="w-12 h-12 rounded-2xl bg-white shadow-2xl shadow-black/10 flex items-center justify-center active:scale-90 transition-all border-none cursor-pointer group"
        >
          <LocateFixed
            size={20}
            className="text-main group-hover:scale-110 transition-transform"
          />
        </button>
      </div>
    </>
  );
};
