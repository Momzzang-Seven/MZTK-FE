import { MapPin } from "lucide-react";
import { UI_TEXT } from "@constant/index";
import { CommonButton } from "@components/common";

interface LocationDetailCardProps {
  address: string;
  isRegistering: boolean;
  onRegister: () => void;
}

export const LocationDetailCard = ({
  address,
  isRegistering,
  onRegister,
}: LocationDetailCardProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 px-5 pb-10 pt-6 bg-white rounded-t-[32px] shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.1)] border-t border-gray-50 animate-in slide-in-from-bottom duration-500">
      {/* Visual Handle */}
      <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />

      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-main/10 flex items-center justify-center">
            <MapPin size={12} className="text-main" />
          </div>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            {UI_TEXT.PHRASE_REGISTER_LOC}
          </span>
        </div>
        <h3 className="text-[17px] font-black text-gray-900 leading-snug">
          {address === UI_TEXT.PHRASE_SELECT_LOC ? (
            <span className="text-gray-300">
              지도를 움직여 위치를 설정하세요
            </span>
          ) : (
            address
          )}
        </h3>
        <p className="mt-3 text-[12px] text-gray-400 font-medium leading-relaxed">
          {UI_TEXT.HEADER_TIP}
        </p>
      </div>

      <CommonButton
        label={isRegistering ? UI_TEXT.REGISTERING_BTN : UI_TEXT.REGISTER_BTN}
        onClick={onRegister}
        disabled={isRegistering}
        bgColor={
          isRegistering ? "bg-gray-100" : "bg-main shadow-xl shadow-main/20"
        }
        textColor={isRegistering ? "text-gray-300" : "text-white"}
        className="font-black text-[16px] py-4.5 rounded-2xl transition-all active:scale-[0.98] w-full border-none"
      />
    </div>
  );
};
