import { useEffect, useState } from "react";
import { useLocationStore } from "@store";
import { useUserStore } from "@store/userStore";
import { MapView } from "@components/verify";
import { VerifyHeader } from "@components/verify/VerifyHeader";
import { VerifyStatusOverlay } from "@components/verify/VerifyStatusOverlay";
import { VerifySuccessOverlay } from "@components/verify/VerifySuccessOverlay";
import { CommonModal, CommonButton } from "@components/common";
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
  const [distance, setDistance] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { coor, setCoor } = useLocationStore();
  const { gymLocation, completeExercise } = useUserStore();

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoor({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        setErrorModalOpen(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
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
      setDistance(Math.floor(d)); // Integer meters
    }
  }, [coor, gymLocation]);

  const handleVerify = async () => {
    if (!gymLocation || !gymLocation.locationId) {
      alert(VERIFY_TEXT.MODAL_REG_DESC);
      return;
    }
    if (!coor) return;

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

          // Auto redirect after 2s
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setFailModalOpen(true);
        }
      } catch (e: unknown) {
        console.error("위치 인증 실패:", e);
        setFailModalOpen(true);
      } finally {
        setIsVerifying(false);
      }
    } else {
      setFailModalOpen(true);
    }
  };

  const isNear =
    distance !== null && distance <= LOCATION_CONSTANTS.VERIFICATION_RADIUS;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <VerifyHeader />

      {/* Map Area */}
      <div className="flex-1 w-full relative">
        <MapView center={coor} mapKey={MAP_KEY} mapId={MAP_ID} />
        <VerifyStatusOverlay
          gymLocation={gymLocation}
          distance={distance}
          isNear={isNear}
        />
      </div>

      {/* Verify Button */}
      <div className="absolute bottom-[110px] left-0 right-0 px-5 z-20">
        <CommonButton
          label={
            isVerifying
              ? "인증 중..."
              : isNear
                ? VERIFY_TEXT.BTN_VERIFY
                : VERIFY_TEXT.BTN_MOVE_TO_RANGE
          }
          onClick={handleVerify}
          disabled={isVerifying}
          bgColor={
            isNear && !isVerifying
              ? "bg-main hover:bg-[#E09E2B]"
              : "bg-gray-300"
          }
          textColor={isNear && !isVerifying ? "text-white" : "text-gray-500"}
          className="font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95 w-full"
        />
      </div>

      {/* Permission Error Modal */}
      {errModalOpen && (
        <CommonModal
          title={VERIFY_TEXT.MODAL_PERM_TITLE}
          desc={VERIFY_TEXT.MODAL_PERM_DESC}
          confirmLabel={VERIFY_TEXT.MODAL_RETRY}
          onConfirmClick={() => window.location.reload()}
        />
      )}

      {/* Registration Prompt Modal */}
      {registerModalOpen && (
        <CommonModal
          title=""
          desc={VERIFY_TEXT.MODAL_REG_DESC}
          confirmLabel={VERIFY_TEXT.MODAL_REG_CONFIRM}
          onConfirmClick={() => navigate("/location-register")}
        />
      )}

      {/* Verification Failure Modal */}
      {failModalOpen && (
        <CommonModal
          title={VERIFY_TEXT.MODAL_FAIL_TITLE}
          confirmLabel={VERIFY_TEXT.MODAL_RETRY}
          onConfirmClick={() => setFailModalOpen(false)}
        />
      )}

      {/* Success Overlay */}
      {successModalOpen && <VerifySuccessOverlay />}
    </div>
  );
};

export default Verify;
