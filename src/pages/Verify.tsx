import { useEffect, useState } from "react";
import { useLocationStore } from "@store";
import { useUserStore } from "@store/userStore";
import { MapView } from "@components/verify";
import { VerifyStatusOverlay } from "@components/verify/VerifyStatusOverlay";
import { VerifySuccessOverlay } from "@components/verify/VerifySuccessOverlay";
import { CommonModal } from "@components/common";

import { useNavigate } from "react-router-dom";
import { getDistanceFromLatLonInMeters } from "@utils/geo";
import { LOCATION_CONSTANTS, VERIFY_TEXT } from "@constant/location";

const Verify = () => {
  const MAP_KEY = import.meta.env.VITE_GOOGLE_MAP_API;
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;
  const navigate = useNavigate();

  const [errModalOpen, setErrorModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [failMsg, setFailMsg] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { coor, setCoor } = useLocationStore();
  const { gymLocation, completeExercise } = useUserStore();

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoor({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error(err);
        setErrorModalOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [setCoor]);

  useEffect(() => {
    if (coor && !gymLocation) {
      setRegisterModalOpen(true);
    }
    if (coor && gymLocation) {
      const d = getDistanceFromLatLonInMeters(
        coor.lat,
        coor.lng,
        gymLocation.lat,
        gymLocation.lng
      );
      setDistance(Math.floor(d));
    }
  }, [coor, gymLocation]);

  const handleVerify = async () => {
    if (!gymLocation?.locationId || !coor) return;
    if (
      distance !== null &&
      distance <= LOCATION_CONSTANTS.VERIFICATION_RADIUS
    ) {
      setIsVerifying(true);
      try {
        const { locationService } = await import("@services/location");
        const result = await locationService.verifyLocation({
          locationId: gymLocation.locationId,
          currentLatitude: coor.lat,
          currentLongitude: coor.lng,
        });
        if (result.isVerified) {
          completeExercise(result.grantedXp || 100);
          setSuccessModalOpen(true);
          setTimeout(() => navigate("/"), 2000);
        } else {
          setFailMsg(result.xpGrantMessage || VERIFY_TEXT.MODAL_FAIL_TITLE);
          setFailModalOpen(true);
        }
      } catch (e: unknown) {
        console.error("위치 인증 실패:", e);
        setFailMsg("서버 통신 중 오류가 발생했습니다.");
        setFailModalOpen(true);
      } finally {
        setIsVerifying(false);
      }
    } else {
      setFailMsg(VERIFY_TEXT.WARNING_OUT_OF_RANGE);
      setFailModalOpen(true);
    }
  };

  const isNear =
    distance !== null && distance <= LOCATION_CONSTANTS.VERIFICATION_RADIUS;

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] relative">
      {/* ── Floating Header ── */}
      <div className="absolute top-0 left-0 right-0 z-20 px-5 pt-10 pb-4">
        <div className="flex items-center justify-between">
          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="btn-press w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border-none"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Title chip */}
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span className="text-gray-900 font-black text-[14px]">
              {VERIFY_TEXT.TITLE}
            </span>
          </div>

          {/* Distance badge */}
          <div
            className={`px-3 py-2 rounded-xl text-[12px] font-black backdrop-blur-md shadow-lg ${
              isNear ? "bg-green-500 text-white" : "bg-white/90 text-gray-500"
            }`}
          >
            {distance !== null ? `${distance}m` : "측정 중"}
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 w-full relative">
        <MapView center={coor} mapKey={MAP_KEY} mapId={MAP_ID} />
        <VerifyStatusOverlay
          gymLocation={gymLocation}
          distance={distance}
          isNear={isNear}
        />
      </div>

      {/* ── CTA Button (floating above footer) ── */}
      <div className="absolute bottom-[100px] left-0 right-0 px-5 z-20">
        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className={`btn-press w-full py-4 rounded-[20px] font-black text-[16px] border-none transition-all shadow-xl ${
            isNear && !isVerifying
              ? "bg-main text-white shadow-main/30"
              : "bg-white text-gray-400 shadow-gray-100/50"
          }`}
        >
          {isVerifying ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              인증 중...
            </div>
          ) : isNear ? (
            VERIFY_TEXT.BTN_VERIFY
          ) : (
            VERIFY_TEXT.BTN_MOVE_TO_RANGE
          )}
        </button>
      </div>

      {/* ── Modals ── */}
      {errModalOpen && (
        <CommonModal
          variant="error"
          title={VERIFY_TEXT.MODAL_PERM_TITLE}
          desc={VERIFY_TEXT.MODAL_PERM_DESC}
          confirmLabel={VERIFY_TEXT.MODAL_RETRY}
          onConfirmClick={() => window.location.reload()}
        />
      )}
      {registerModalOpen && (
        <CommonModal
          variant="info"
          title="헬스장을 등록해주세요"
          desc={VERIFY_TEXT.MODAL_REG_DESC}
          confirmLabel={VERIFY_TEXT.MODAL_REG_CONFIRM}
          onConfirmClick={() => navigate("/location-register")}
        />
      )}
      {failModalOpen && (
        <CommonModal
          variant="warning"
          title={VERIFY_TEXT.MODAL_FAIL_TITLE}
          desc={failMsg}
          confirmLabel={VERIFY_TEXT.MODAL_RETRY}
          onConfirmClick={() => setFailModalOpen(false)}
        />
      )}
      {successModalOpen && <VerifySuccessOverlay />}
    </div>
  );
};

export default Verify;
