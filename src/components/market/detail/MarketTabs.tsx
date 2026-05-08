import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { calculateEndTime } from "@utils";

interface MarketData {
  description: string;
  features: string[];
  duration: string;
  supplies: string;
  operatingDays: string[];
  operatingTimes: Record<string, string[]>;
  location: string;
  address: string;
  phone?: string;
  sns?: { insta?: string };
  rating?: string;
  reviewCount?: number;
  lat?: number;
  lng?: number;
}

export const IntroTab = ({ data }: { data: MarketData }) => {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h3 className="text-[17px] font-bold text-gray-900">클래스 소개</h3>
        <p className="text-[14px] text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm whitespace-pre-line">
          {data.description}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[17px] font-bold text-gray-900">프로그램 특징</h3>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3.5">
          {data.features.length > 0 ? (
            data.features.map((feature: string, index: number) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-main font-bold text-[15px] leading-snug">
                  {index + 1}.
                </span>
                <p className="text-[15px] text-gray-700 leading-snug">
                  {feature}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[14px] text-gray-400">
              등록된 프로그램 특징이 없습니다.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[17px] font-bold text-gray-900">수업 정보</h3>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-gray-400">
              1회 진행 시간
            </span>
            <p className="text-gray-800 font-medium text-[15px]">
              {data.duration}
            </p>
          </div>
          <div className="h-[1px] bg-gray-100 w-full"></div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-gray-400">
              개인 준비물
            </span>
            <p className="text-gray-800 font-medium text-[15px] leading-snug">
              {data.supplies || "별도 준비물 정보가 없습니다."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[17px] font-bold text-gray-900">운영 일정</h3>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex gap-1.5 flex-wrap">
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
              const isOperating = data.operatingDays.includes(day);
              return (
                <span
                  key={day}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-[13px] font-bold tabular-nums ${isOperating ? "bg-gray-800 text-white shadow-sm" : "bg-gray-100 text-gray-400 opacity-50"}`}
                >
                  {day}
                </span>
              );
            })}
          </div>
          <div className="h-[1px] bg-gray-100 w-full"></div>

          {data.operatingDays.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {data.operatingDays.map((day: string) => (
                <div
                  key={day}
                  className="flex justify-between flex-wrap gap-2 text-[14px]"
                >
                  <span className="font-bold text-gray-700 w-6 flex-shrink-0 mt-0.5">
                    {day}
                  </span>
                  <div className="flex flex-1 flex-wrap justify-end gap-1.5 pl-2">
                    {data.operatingTimes[day]?.length > 0 ? (
                      data.operatingTimes[day].map((time: string) => (
                        <span
                          key={time}
                          className="text-gray-600 font-medium tabular-nums tracking-wide bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 text-center"
                        >
                          {time}{" "}
                          <span className="text-gray-400 text-[12px]">
                            ~ {calculateEndTime(time, data.duration)}
                          </span>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 font-medium tracking-wide text-[13px]">
                        예약마감
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-gray-400">
              등록된 운영 시간이 없습니다.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export const LocationTab = ({ data }: { data: MarketData }) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[17px] font-bold text-gray-900">주소 및 연락처</h3>
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col gap-2 relative">
          <div className="w-full h-[220px] bg-gray-100 rounded-[20px] overflow-hidden border border-gray-100 relative shadow-inner">
            {data.lat && data.lng ? (
              <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API}>
                <Map
                  mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
                  defaultCenter={{ lat: data.lat, lng: data.lng }}
                  defaultZoom={16}
                  gestureHandling="greedy"
                  disableDefaultUI
                >
                  <AdvancedMarker position={{ lat: data.lat, lng: data.lng }}>
                    <Pin
                      background="#fab12f"
                      glyphColor="#fff"
                      borderColor="#fab12f"
                    />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-white font-bold text-lg mb-2">
                  ?
                </div>
                <span className="text-gray-500 text-xs font-bold font-sans tracking-tight">
                  위치 정보 없음
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5 mt-1">
            <span className="text-[15px] font-bold text-gray-900 leading-snug break-keep flex items-start gap-1">
              {data.address}
            </span>
            <span className="text-[13px] text-gray-500 font-medium">
              ({data.location})
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-gray-100 w-full"></div>

        <div className="flex flex-col gap-2.5">
          {data.phone && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-gray-400 w-16">
                전화번호
              </span>
              <span className="text-[14.5px] font-bold text-gray-800 tracking-tight">
                {data.phone}
              </span>
            </div>
          )}
          {data.sns?.insta && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-gray-400 w-16">
                인스타그램
              </span>
              <span className="text-[14.5px] font-medium text-main">
                {data.sns.insta}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReviewTab = ({ data }: { data: MarketData }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-yellow-400 text-xl font-bold">
          ★ {data.rating ?? "0.0"}
        </span>
        <span className="text-gray-500 font-medium">
          ({data.reviewCount ?? 0}개)
        </span>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-sm text-gray-400">
        리뷰 API가 아직 연결되지 않아 표시할 후기가 없습니다.
      </div>
    </div>
  );
};
