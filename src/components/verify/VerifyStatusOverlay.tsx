import { VERIFY_TEXT } from "@constant/location";

interface VerifyStatusOverlayProps {
  gymLocation: { lat: number; lng: number } | null; // Type according to your store definition
  distance: number | null;
  isNear: boolean;
}

export const VerifyStatusOverlay = ({
  gymLocation,
  distance,
  isNear,
}: VerifyStatusOverlayProps) => {
  if (!gymLocation || distance === null) return null;

  return (
    <div className="absolute top-28 left-0 right-0 z-20 flex flex-col items-center gap-2 pointer-events-none">
      {/* Slim Distance Pill */}
      <div className="bg-gray-100/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-gray-200">
        <span className="text-gray-800 font-bold text-lg">
          {VERIFY_TEXT.DISTANCE_PREFIX}
          {distance}
          {VERIFY_TEXT.DISTANCE_UNIT}
        </span>
      </div>

      {/* Warning Message */}
      {!isNear && (
        <span className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full font-bold shadow-sm border border-red-100">
          {VERIFY_TEXT.WARNING_OUT_OF_RANGE}
        </span>
      )}
    </div>
  );
};
