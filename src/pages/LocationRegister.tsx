import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "@store/userStore";
import { LocationHeader } from "@components/location/LocationHeader";
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
  const [isRegistering, setIsRegistering] = useState(false);

  // Get Current Location
  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPanTarget(newCenter);
          setAddress(UI_TEXT.PHRASE_REGISTER_LOC);
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    handleCurrentLocation();
  }, [handleCurrentLocation]);

  // Camera change handler for dragging
  const handleCameraChanged = (ev: {
    detail: { center: { lat: number; lng: number } };
  }) => {
    setCenter(ev.detail.center);
  };

  const handleRegister = async () => {
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
    <div className="flex flex-col h-[100dvh] w-full bg-white relative overflow-hidden">
      <LocationHeader />

      <div className="flex-1 w-full relative">
        <LocationMap
          center={center}
          panTarget={panTarget}
          address={address}
          onCameraChanged={handleCameraChanged}
          onPanComplete={() => setPanTarget(null)}
          onCurrentLocationClick={handleCurrentLocation}
        />
      </div>

      {/* Bottom Detail Card */}
      <LocationDetailCard
        address={address}
        isRegistering={isRegistering}
        onRegister={handleRegister}
      />

      {/* Registration Loading Overlay */}
      {isRegistering && <LocationLoadingOverlay />}
    </div>
  );
};

export default LocationRegister;
