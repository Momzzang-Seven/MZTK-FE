import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "@store/userStore";
import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";
import { LocationHeader } from "@components/location/LocationHeader";
import { LocationMap } from "@components/location/LocationMap";
import { CommonButton } from "@components/common/CommonButton";
import { LOCATION_CONSTANTS, UI_TEXT } from "@constant/index";

const LocationRegister = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromSource = location.state?.from;
    const { registerGymLocation } = useUserStore();

    const [center, setCenter] = useState(LOCATION_CONSTANTS.DEFAULT_CENTER);
    const [panTarget, setPanTarget] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>(UI_TEXT.PHRASE_SELECT_LOC);
    const [isRegistering, setIsRegistering] = useState(false);

    // Get Current Location
    const handleCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newCenter = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
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

    // Camera change handler for dragging - updates data but doesn't force map move
    const handleCameraChanged = (ev: { detail: { center: { lat: number; lng: number } } }) => {
        setCenter(ev.detail.center);
    };

    const handleRegister = async () => {
        setIsRegistering(true);
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, LOCATION_CONSTANTS.ANIMATION_DURATION));

        // Register the current map center
        await registerGymLocation({
            lat: center.lat,
            lng: center.lng,
            address: address
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

            <LocationMap
                center={center}
                panTarget={panTarget}
                address={address}
                onCameraChanged={handleCameraChanged}
                onPanComplete={() => setPanTarget(null)}
                onCurrentLocationClick={handleCurrentLocation}
            />

            {/* Action Button - Moved outside map area for guaranteed visibility */}
            <div className="absolute bottom-[50px] left-0 right-0 px-5 z-50">
                <CommonButton
                    label={isRegistering ? UI_TEXT.REGISTERING_BTN : UI_TEXT.REGISTER_BTN}
                    onClick={handleRegister}
                    disabled={isRegistering}
                    bgColor={isRegistering ? "bg-gray-300 cursor-not-allowed" : "bg-[#FAB12F] hover:bg-[#E09E2B]"}
                    textColor="text-white"
                    className="font-bold text-xl py-4 rounded-2xl shadow-lg transition-colors active:scale-95 w-full"
                />
            </div>

            {/* Registration Loading Overlay */}
            {isRegistering && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
                    <div className="w-64 h-64 mb-4">
                        <Lottie animationData={runnerAnimation} loop={true} />
                    </div>
                    <h2 className="text-2xl font-bold text-main mb-2">{UI_TEXT.LOADING_TITLE}</h2>
                    <p className="text-xl font-bold text-main">{UI_TEXT.LOADING_DESC}</p>
                </div>
            )}
        </div>
    );
};

export default LocationRegister;
