import { useEffect } from "react";
import {
    APIProvider,
    Map,
    useMap
} from "@vis.gl/react-google-maps";
import { LocationMapOverlay } from "./LocationMapOverlay";
import { LOCATION_CONSTANTS } from "@constant/index";

// Map Controller Component
const MapController = ({ panTo, onPanComplete }: { panTo: { lat: number; lng: number } | null, onPanComplete: () => void }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !panTo) return;

        map.panTo(panTo);
        onPanComplete();
    }, [map, panTo, onPanComplete]);

    return null;
};

interface LocationMapProps {
    center: { lat: number; lng: number };
    panTarget: { lat: number; lng: number } | null;
    address: string;
    onCameraChanged: (ev: { detail: { center: { lat: number; lng: number } } }) => void;
    onPanComplete: () => void;
    onCurrentLocationClick: () => void;
}

export const LocationMap = ({
    center,
    panTarget,
    onCameraChanged,
    onPanComplete,
    onCurrentLocationClick
}: LocationMapProps) => {
    const MAP_KEY = import.meta.env.VITE_GOOGLE_MAP_API || "";
    const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || "";

    return (
        <div className="flex-1 w-full h-full relative bg-gray-100">
            <APIProvider apiKey={MAP_KEY}>
                <MapController panTo={panTarget} onPanComplete={onPanComplete} />

                <Map
                    defaultCenter={center}
                    defaultZoom={LOCATION_CONSTANTS.DEFAULT_ZOOM}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId={MAP_ID}
                    style={{ width: '100%', height: '100%' }}
                    onCameraChanged={onCameraChanged}
                >
                </Map>

                <LocationMapOverlay
                    onCurrentLocationClick={onCurrentLocationClick}
                />
            </APIProvider>
        </div>
    );
};
