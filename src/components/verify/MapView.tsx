import { useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { RangeCircle } from "@components/verify";

interface MapViewProps {
  center: { lat: number; lng: number } | null;
  mapKey: string;
  mapId?: string;
  onMapLoad?: () => void;
}

export const MapView = ({ center, mapKey, mapId, onMapLoad }: MapViewProps) => {
  const isAutomatedBrowser =
    typeof navigator !== "undefined" && navigator.webdriver;

  useEffect(() => {
    if (!center || (mapKey && !isAutomatedBrowser)) return;

    onMapLoad?.();
  }, [center, isAutomatedBrowser, mapKey, onMapLoad]);

  if (!center) return null;

  if (!mapKey || isAutomatedBrowser) {
    return <div className="w-screen h-screen bg-gray-100" />;
  }

  return (
    <div className="flex">
      <APIProvider apiKey={mapKey}>
        <Map
          mapId={mapId}
          style={{ width: "100vw", height: "100vh" }}
          defaultCenter={center}
          defaultZoom={18}
          gestureHandling="greedy"
          disableDefaultUI
          onIdle={() => onMapLoad?.()}
        >
          <RangeCircle center={center} radius={20} />
          <AdvancedMarker position={center}>
            <Pin background="#fab12f" glyphColor="#fff" borderColor="#fab12f" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};
