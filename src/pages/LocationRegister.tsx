import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Map as MapIcon, Loader2 } from "lucide-react";
import { useUserStore } from "@store/userStore";
import { LocationMap } from "@components/location/LocationMap";
import { LocationLoadingOverlay } from "@components/location/LocationLoadingOverlay";
import { LOCATION_CONSTANTS, UI_TEXT } from "@constant/index";
import { LocationDetailCard } from "@components/location/LocationDetailCard";

const LocationRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSource = location.state?.from;
  const { registerGymLocation } = useUserStore();

  const [center, setCenter] = useState(LOCATION_CONSTANTS.DEFAULT_CENTER);
  const [panTarget, setPanTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState<string>(UI_TEXT.PHRASE_SELECT_LOC);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const hasSeenInitialCameraEventRef = useRef(false);

  // Get Current Location
  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCenter(newCenter);
          setPanTarget(newCenter);
          setAddress(UI_TEXT.PHRASE_REGISTER_LOC);
          setIsLocationSelected(true);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setIsMapLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsMapLoading(false);
    }
  }, []);

  useEffect(() => {
    handleCurrentLocation();

    // Safety timeout to hide map loading screen after some time anyway
    const timer = setTimeout(() => setIsMapLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [handleCurrentLocation]);

  const handleCameraChanged = (ev: {
    detail: { center: { lat: number; lng: number } };
  }) => {
    setCenter(ev.detail.center);
    // User interaction means map is definitely ready
    if (isMapLoading) setIsMapLoading(false);

    if (!hasSeenInitialCameraEventRef.current) {
      hasSeenInitialCameraEventRef.current = true;
      return;
    }

    const isDefaultCenter =
      Math.abs(ev.detail.center.lat - LOCATION_CONSTANTS.DEFAULT_CENTER.lat) <
        0.000001 &&
      Math.abs(ev.detail.center.lng - LOCATION_CONSTANTS.DEFAULT_CENTER.lng) <
        0.000001;

    if (!isDefaultCenter) {
      setAddress(UI_TEXT.PHRASE_REGISTER_LOC);
      setIsLocationSelected(true);
    }
  };

  const handleRegister = async () => {
    if (!isLocationSelected || address === UI_TEXT.PHRASE_SELECT_LOC) return;

    setIsRegistering(true);
    await new Promise((resolve) =>
      setTimeout(resolve, LOCATION_CONSTANTS.ANIMATION_DURATION)
    );

    await registerGymLocation({
      lat: center.lat,
      lng: center.lng,
      address: address,
    });

    if (fromSource === "my") {
      navigate("/my");
    } else {
      navigate("/verify");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white relative overflow-hidden font-pretendard">
      {/* Immersive Floating Header with Stronger Background for Legibility */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="bg-gradient-to-b from-white/100 via-white/90 to-transparent p-6 backdrop-blur-[2px]">
          <div className="flex flex-col gap-5 pb-20">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-white active:scale-90 transition-all pointer-events-auto"
            >
              <ChevronLeft size={26} className="text-gray-900" />
            </button>

            <div className="animate-in slide-in-from-left-6 duration-1000 ease-out">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-[3px] bg-main rounded-full" />
                <span className="text-[11px] font-black text-main uppercase tracking-[0.25em]">
                  Live Tracking
                </span>
              </div>
              <h1 className="text-[34px] font-black text-gray-900 tracking-tighter leading-none drop-shadow-md">
                위치 설정하기
              </h1>
              <p className="text-[15px] font-bold text-gray-700 mt-3 drop-shadow-sm max-w-[220px] leading-relaxed">
                정확한 보상 지급을 위해 <br />
                수업 위치를 확인해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative bg-gray-50">
        <LocationMap
          center={center}
          panTarget={panTarget}
          address={address}
          onCameraChanged={handleCameraChanged}
          onPanComplete={() => {
            setPanTarget(null);
            setIsMapLoading(false);
          }}
          onCurrentLocationClick={handleCurrentLocation}
        />

        {/* Subtle Map Loading Glass - Only for map load */}
        {isMapLoading && !isRegistering && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-[60] flex flex-col items-center justify-center transition-all duration-700 animate-in fade-in">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-main/10 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-main rounded-full animate-spin" />
              <MapIcon size={32} className="text-main animate-pulse" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-[16px] font-black text-gray-900 tracking-tight">
                지도 데이터를 동기화 중...
              </p>
              <div className="flex items-center gap-1.5">
                <Loader2 size={12} className="text-main animate-spin" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Initialising Google Maps
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Detail Card */}
      <LocationDetailCard
        address={address}
        isRegistering={isRegistering}
        canRegister={
          isLocationSelected && address !== UI_TEXT.PHRASE_SELECT_LOC
        }
        onRegister={handleRegister}
      />

      {/* Heavy Technical Loading - For actual registration */}
      {isRegistering && <LocationLoadingOverlay />}
    </div>
  );
};

export default LocationRegister;
