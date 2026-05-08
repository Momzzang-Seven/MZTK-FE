import { UI_TEXT } from "@constant/index";
import { CommonButton } from "@components/common";
import { LocateFixed } from "lucide-react";

interface LocationMapOverlayProps {
  onCurrentLocationClick: () => void;
}

export const LocationMapOverlay = ({
  onCurrentLocationClick,
}: LocationMapOverlayProps) => {
  return (
    <>
      {/* 20m Radius Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none w-[360px] h-[360px] rounded-full border-2 border-main bg-white/30" />

      {/* Fixed Center Pin (Visual) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none pb-[38px]">
        <img
          src="/icon/pin_center.svg"
          alt="Center Pin"
          width={50}
          height={50}
          className="drop-shadow-lg"
        />
      </div>
      {/* Current Location Button with Tooltip */}
      <div className="absolute bottom-[130px] right-5 z-40 flex items-center gap-3 select-none">
        {/* Tooltip */}
        <div className="bg-main text-white text-xs font-bold px-2 py-1.5 rounded-md relative shadow-md animate-fade-in-right">
          {UI_TEXT.MY_LOCATION_TOOLTIP}
          <div className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-main border-b-[6px] border-b-transparent"></div>
        </div>

        {/* Button */}
        <CommonButton
          label=""
          onClick={onCurrentLocationClick}
          className="rounded-xl shadow-lg active:bg-gray-50 transition-all active:scale-95 w-auto"
          bgColor="bg-white"
          icon={<LocateFixed size={22} className="text-main" />}
        />
      </div>
    </>
  );
};
