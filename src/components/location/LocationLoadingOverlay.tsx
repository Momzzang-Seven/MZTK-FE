import { useState, useEffect } from "react";
import { UI_TEXT } from "@constant/index";
import { ShieldCheck, Radar, Satellite, Database } from "lucide-react";

interface LocationLoadingOverlayProps {
  title?: string;
}

export const LocationLoadingOverlay = ({
  title,
}: LocationLoadingOverlayProps) => {
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState({ lat: 37.5665, lng: 126.978 });

  // Technical steps for professional feel
  const steps = [
    { icon: <Satellite size={14} />, text: "Satellite Synchronization..." },
    { icon: <Radar size={14} />, text: "Probing Geofence Radius..." },
    { icon: <Database size={14} />, text: "Encrypting Coordinate Data..." },
    {
      icon: <ShieldCheck size={14} />,
      text: "Validating Location Integrity...",
    },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    const coordInterval = setInterval(() => {
      setCoords({
        lat: 37.5665 + (Math.random() - 0.5) * 0.001,
        lng: 126.978 + (Math.random() - 0.5) * 0.001,
      });
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(coordInterval);
    };
  }, [steps.length]);

  return (
    <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* High-Tech Radar Scanning Area */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-main/10" />
        <div className="absolute inset-8 rounded-full border border-main/5" />
        <div className="absolute inset-16 rounded-full border border-main/5" />

        {/* Scanning Sweep */}
        <div className="absolute inset-0 rounded-full border-t-2 border-main/40 animate-spin-slow" />

        {/* Central Signal */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-main/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Radar size={32} className="text-main" />
          </div>
          <div className="font-mono text-[10px] text-main font-bold tracking-widest tabular-nums bg-main/5 px-2 py-1 rounded">
            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </div>
        </div>
      </div>

      {/* Status Progress Section */}
      <div className="w-full max-w-[240px] space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {title || UI_TEXT.LOADING_TITLE}
          </h2>
          <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-main transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step List */}
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-300 ${i === step ? "opacity-100 translate-x-1" : "opacity-20"}`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${i === step ? "bg-main text-white" : "bg-gray-100 text-gray-400"}`}
              >
                {s.icon}
              </div>
              <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider text-left">
                {s.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Technical Label */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-1 h-1 bg-main/20 rounded-full" />
          ))}
        </div>
        <span className="text-[9px] font-black text-gray-300 tracking-[0.4em] uppercase">
          Verifying Proof of Location
        </span>
      </div>
    </div>
  );
};
