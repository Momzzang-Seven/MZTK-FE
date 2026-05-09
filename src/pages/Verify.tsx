import { useEffect, useState } from "react";
import { useLocationStore } from "@store";
import { useUserStore } from "@store/userStore";
import { MapView } from "@components/verify";
import { VerifyStatusOverlay } from "@components/verify/VerifyStatusOverlay";
import { CommonModal } from "@components/common";
import { AuthSuccessOverlay } from "@components/common/AuthSuccessOverlay";
import { LocationLoadingOverlay } from "@components/location/LocationLoadingOverlay";

import { useNavigate } from "react-router-dom";
import { getDistanceFromLatLonInMeters } from "@utils/geo";
import { LOCATION_CONSTANTS, VERIFY_TEXT } from "@constant/location";
import { ChevronLeft, MapPin, Navigation, Info, Loader2 } from "lucide-react";

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
  const [isMapLoading, setIsMapLoading] = useState(true);

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
    if (!gymLocation) {
      setRegisterModalOpen(true);
    }
  }, [gymLocation]);

  useEffect(() => {
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
          setTimeout(() => navigate("/"), 2500);
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
    <div className="flex flex-col h-screen bg-[#FDFDFD] relative overflow-hidden font-pretendard">
      {/* ── Loading State ── */}
      {isMapLoading && <LocationLoadingOverlay />}

      {/* ── Persistent Sticky Header ── */}
      <div className="sticky top-6 z-[100] px-6 h-0 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => navigate("/")}
            className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50 active:scale-90 transition-all"
          >
            <ChevronLeft size={26} className="text-gray-900" />
          </button>

          <div className="bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[20px] px-5 py-2.5 flex items-center gap-2.5 border border-white/50 animate-in slide-in-from-top-4 duration-700">
            <div className="w-8 h-8 rounded-xl bg-main/10 flex items-center justify-center">
              <MapPin size={16} className="text-main" />
            </div>
            <span className="text-gray-900 font-black text-[14px] tracking-tight">
              {VERIFY_TEXT.TITLE}
            </span>
          </div>
        </div>
      </div>

      {/* ── Full Background Map ── */}
      <div className="flex-1 w-full relative z-10">
        <MapView
          center={coor}
          mapKey={MAP_KEY}
          mapId={MAP_ID}
          onMapLoad={() => setTimeout(() => setIsMapLoading(false), 1000)}
        />

        {/* Distance Indicator floating on map */}
        {!isMapLoading && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in-95 duration-700">
            <div
              className={`px-5 py-2 rounded-full backdrop-blur-md shadow-xl border text-[13px] font-black flex items-center gap-2 transition-all duration-500 ${
                isNear
                  ? "bg-green-500 border-green-400 text-white"
                  : "bg-white/80 border-white text-gray-500"
              }`}
            >
              <Navigation size={14} className={isNear ? "animate-pulse" : ""} />
              {distance !== null ? `${distance}m` : "측정 중..."}
            </div>
          </div>
        )}

        <VerifyStatusOverlay
          gymLocation={gymLocation}
          distance={distance}
          isNear={isNear}
        />
      </div>

      {/* ── Bottom Action Card ── */}
      <div className="absolute bottom-10 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-700 delay-300">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${isNear ? "bg-green-50" : "bg-orange-50"}`}
            >
              <Info
                size={20}
                className={isNear ? "text-green-500" : "text-main"}
              />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Verification Status
              </p>
              <p className="text-[14px] font-black text-gray-800 leading-tight">
                {isNear
                  ? "인증 가능한 범위에 있습니다"
                  : "운동 장소로 이동해주세요"}
              </p>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`w-full py-5 rounded-2xl font-black text-[16px] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
              isNear && !isVerifying
                ? "bg-main text-white shadow-main/30"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>데이터 검증 중...</span>
              </>
            ) : isNear ? (
              <>
                <CheckCircle2 size={20} strokeWidth={3} />
                <span>{VERIFY_TEXT.BTN_VERIFY}</span>
              </>
            ) : (
              <span>{VERIFY_TEXT.BTN_MOVE_TO_RANGE}</span>
            )}
          </button>
        </div>
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
      {successModalOpen && (
        <AuthSuccessOverlay
          title={VERIFY_TEXT.SUCCESS_TITLE}
          subTitle="지정한 장소에서 운동 인증을 성공했습니다"
          rewardXp={100}
          onClose={() => navigate("/")}
        />
      )}
    </div>
  );
};

// Mock Lucide components if needed or import correctly
import { CheckCircle2 } from "lucide-react";

export default Verify;
