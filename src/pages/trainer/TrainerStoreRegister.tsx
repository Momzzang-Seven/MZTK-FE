import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DaumPostcode from "react-daum-postcode";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  Pin,
  useApiIsLoaded,
  useMap,
} from "@vis.gl/react-google-maps";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton } from "@components/common";
import { getTrainerStore, upsertTrainerStore } from "@services";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PostcodeData = {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
};

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 37.5666805,
  longitude: 126.9784147,
};

const DEFAULT_ZOOM = 15;

const toMapPosition = (
  coordinates: Coordinates = DEFAULT_COORDINATES
): google.maps.LatLngLiteral => ({
  lat: coordinates.latitude,
  lng: coordinates.longitude,
});

const blankToNull = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

const StoreMapController = ({ coordinates }: { coordinates: Coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.panTo(toMapPosition(coordinates));
  }, [coordinates, map]);

  return null;
};

const StoreGeocoder = ({
  address,
  setMapCenter,
  setCoordinates,
  setIsResolvingCoordinates,
}: {
  address: string;
  setMapCenter: Dispatch<SetStateAction<Coordinates>>;
  setCoordinates: Dispatch<SetStateAction<Coordinates | null>>;
  setIsResolvingCoordinates: Dispatch<SetStateAction<boolean>>;
}) => {
  const isApiLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!address) {
      setCoordinates(null);
      setIsResolvingCoordinates(false);
      return;
    }

    if (!isApiLoaded || !window.google?.maps?.Geocoder) {
      return;
    }

    let isMounted = true;
    const geocoder = new window.google.maps.Geocoder();

    setIsResolvingCoordinates(true);

    geocoder.geocode({ address, region: "KR" }, (results, status) => {
      if (!isMounted) return;

      const location = results?.[0]?.geometry?.location;

      if (status !== window.google.maps.GeocoderStatus.OK || !location) {
        setCoordinates(null);
        setIsResolvingCoordinates(false);
        return;
      }

      const nextCoordinates = {
        latitude: location.lat(),
        longitude: location.lng(),
      };

      setMapCenter(nextCoordinates);
      setCoordinates(nextCoordinates);
      setIsResolvingCoordinates(false);
    });

    return () => {
      isMounted = false;
    };
  }, [
    address,
    isApiLoaded,
    setCoordinates,
    setIsResolvingCoordinates,
    setMapCenter,
  ]);

  return null;
};

const TrainerStoreRegister = () => {
  const navigate = useNavigate();
  const mapKey = import.meta.env.VITE_GOOGLE_MAP_API || "";
  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || "";

  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [sns, setSns] = useState({ home: "", insta: "", x: "" });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isResolvingCoordinates, setIsResolvingCoordinates] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingStore, setHasExistingStore] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStore = async () => {
      try {
        const store = await getTrainerStore();

        if (!isMounted) return;

        const nextCoordinates = {
          latitude: store.latitude,
          longitude: store.longitude,
        };

        setHasExistingStore(true);
        setStoreName(store.storeName);
        setAddress(store.address);
        setDetailAddress(store.detailAddress);
        setPhone(store.phoneNumber);
        setSns({
          home: store.homepageUrl ?? "",
          insta: store.instagramUrl ?? "",
          x: store.xProfileUrl ?? "",
        });
        setCoordinates(nextCoordinates);
        setMapCenter(nextCoordinates);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404 &&
          error.response?.data?.code === "MARKETPLACE_001"
        ) {
          if (!isMounted) return;
          setHasExistingStore(false);
        } else {
          console.error("Failed to load trainer store", error);
          window.alert("매장 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingStore(false);
        }
      }
    };

    void loadStore();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCompletePostcode = (data: PostcodeData) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname) extraAddress += data.bname;
      if (data.buildingName) {
        extraAddress += extraAddress
          ? `, ${data.buildingName}`
          : data.buildingName;
      }
      fullAddress += extraAddress ? ` (${extraAddress})` : "";
    }

    setAddress(fullAddress);
    setCoordinates(null);
    setIsPostcodeOpen(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.alert("현재 위치를 불러올 수 없는 환경입니다.");
      return;
    }

    setIsResolvingCoordinates(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setMapCenter(nextCoordinates);
        setCoordinates(nextCoordinates);
        setIsResolvingCoordinates(false);
      },
      (error) => {
        console.error("Failed to get current position", error);
        setIsResolvingCoordinates(false);
        window.alert(
          "현재 위치를 가져오지 못했습니다. 위치 권한을 확인해 주세요."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmMapLocation = () => {
    setCoordinates(mapCenter);
  };

  const handleRegister = async () => {
    if (!storeName.trim()) {
      window.alert("매장명을 입력해 주세요.");
      return;
    }

    if (!address.trim()) {
      window.alert("매장 주소를 입력해 주세요.");
      return;
    }

    if (!detailAddress.trim()) {
      window.alert("상세 주소를 입력해 주세요.");
      return;
    }

    if (!phone.trim()) {
      window.alert("매장 전화번호를 입력해 주세요.");
      return;
    }

    if (!coordinates) {
      window.alert("매장 위치 좌표를 먼저 설정해 주세요.");
      return;
    }

    try {
      setIsSaving(true);

      await upsertTrainerStore({
        storeName: storeName.trim(),
        address: address.trim(),
        detailAddress: detailAddress.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        phoneNumber: phone.trim(),
        homepageUrl: blankToNull(sns.home),
        instagramUrl: blankToNull(sns.insta),
        xProfileUrl: blankToNull(sns.x),
      });

      window.alert(
        hasExistingStore
          ? "매장 정보가 수정되었습니다."
          : "매장 정보가 등록되었습니다."
      );
      navigate("/trainer");
    } catch (error) {
      console.error("Failed to upsert trainer store", error);
      window.alert(
        "매장 정보 저장에 실패했습니다. 입력값을 다시 확인해 주세요."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <TrainerHeader
        title={hasExistingStore ? "매장 정보 수정" : "매장 정보 등록"}
        showBack
      />

      <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-5 py-6 pb-32 focus-within:pb-40 transition-all">
        {isLoadingStore ? (
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-gray-400">
            매장 정보를 불러오는 중입니다...
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                매장명 <span className="text-main">*</span>
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                placeholder="매장명을 입력해 주세요."
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-700">
                  매장 위치(주소) <span className="text-main">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={address}
                    placeholder="주소를 검색해 주세요."
                    onClick={() => setIsPostcodeOpen(true)}
                    className="flex-1 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-[14px] text-gray-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(true)}
                    className="whitespace-nowrap rounded-xl bg-main px-5 text-[14px] font-bold text-white shadow-sm transition-all active:brightness-95"
                  >
                    주소 찾기
                  </button>
                </div>
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(event) => setDetailAddress(event.target.value)}
                  placeholder="상세 주소를 입력해 주세요."
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                />
                {isResolvingCoordinates && (
                  <p className="text-[12px] text-gray-400">
                    주소 좌표를 확인하는 중입니다...
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  지도 위치
                </label>
                <div className="relative h-[220px] w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {mapKey ? (
                    <APIProvider apiKey={mapKey}>
                      <StoreGeocoder
                        address={address}
                        setMapCenter={setMapCenter}
                        setCoordinates={setCoordinates}
                        setIsResolvingCoordinates={setIsResolvingCoordinates}
                      />
                      <Map
                        defaultCenter={toMapPosition(DEFAULT_COORDINATES)}
                        defaultZoom={DEFAULT_ZOOM}
                        gestureHandling="greedy"
                        disableDefaultUI
                        mapId={mapId || undefined}
                        style={{ width: "100%", height: "100%" }}
                        onCameraChanged={(event) =>
                          setMapCenter({
                            latitude: event.detail.center.lat,
                            longitude: event.detail.center.lng,
                          })
                        }
                      >
                        <StoreMapController
                          coordinates={coordinates ?? mapCenter}
                        />
                        <AdvancedMarker position={toMapPosition(mapCenter)}>
                          <Pin
                            background={coordinates ? "#fab12f" : "#6b7280"}
                            glyphColor="#fff"
                            borderColor={coordinates ? "#fab12f" : "#6b7280"}
                          />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center border border-gray-100 bg-white/90 px-5 text-center text-[14px] font-bold leading-relaxed text-gray-500 backdrop-blur-sm">
                      Google Map API Key 필요
                      <span className="mt-1 text-[12px] font-medium text-gray-400">
                        `.env`의 `VITE_GOOGLE_MAP_API`를 채우면 지도가
                        표시됩니다.
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCurrentLocation}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] font-bold text-gray-700 active:opacity-90"
                    >
                      현재 위치 사용
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMapLocation}
                      className="flex-1 rounded-xl border border-main/20 bg-main/5 px-4 py-3 text-[13px] font-bold text-main active:opacity-90"
                    >
                      지도 중심으로 위치 설정
                    </button>
                  </div>
                  {address && !isResolvingCoordinates && !coordinates && (
                    <p className="text-[12px] text-gray-500">
                      주소 좌표를 바로 찾지 못했습니다. 지도를 움직인 뒤 위치
                      설정 버튼을 눌러 주세요.
                    </p>
                  )}
                  {coordinates && (
                    <p className="text-[12px] text-gray-500">
                      선택된 좌표: {coordinates.latitude.toFixed(6)},{" "}
                      {coordinates.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                매장 전화번호 <span className="text-main">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="예: 02-1234-5678"
                className="w-full rounded-xl bg-grey-pale px-4 py-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="mb-1 text-sm font-bold text-gray-700">
                SNS 계정 연동
                <span className="ml-1 text-xs font-medium text-gray-400">
                  (선택)
                </span>
              </label>

              <div className="flex items-center gap-3">
                <div className="flex w-[100px] items-center text-[13px] font-bold text-gray-600 opacity-80">
                  홈페이지
                </div>
                <input
                  type="text"
                  value={sns.home}
                  onChange={(event) =>
                    setSns((prev) => ({ ...prev, home: event.target.value }))
                  }
                  placeholder="https://example.com"
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex w-[100px] items-center text-[13px] font-bold text-gray-600 opacity-80">
                  인스타그램
                </div>
                <input
                  type="text"
                  value={sns.insta}
                  onChange={(event) =>
                    setSns((prev) => ({ ...prev, insta: event.target.value }))
                  }
                  placeholder="https://instagram.com/..."
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex w-[100px] items-center text-[13px] font-bold text-gray-600 opacity-80">
                  X
                </div>
                <input
                  type="text"
                  value={sns.x}
                  onChange={(event) =>
                    setSns((prev) => ({ ...prev, x: event.target.value }))
                  }
                  placeholder="https://x.com/..."
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white p-5 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <CommonButton
          label={
            isSaving
              ? "저장 중..."
              : hasExistingStore
                ? "매장 정보 수정하기"
                : "매장 정보 등록하기"
          }
          onClick={handleRegister}
          disabled={
            isLoadingStore ||
            isSaving ||
            !storeName.trim() ||
            !address.trim() ||
            !detailAddress.trim() ||
            !phone.trim() ||
            !coordinates
          }
          className="h-[60px] w-full rounded-2xl text-[16px] font-bold shadow-sm transition-all active:opacity-90"
        />
      </div>

      {isPostcodeOpen && (
        <div className="fixed inset-0 z-[1000] mx-auto flex h-full w-full max-w-[420px] items-center justify-center bg-black/60 p-5 px-4">
          <div className="relative flex max-h-[80vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h3 className="text-[16px] font-bold text-gray-900">주소 검색</h3>
              <button
                type="button"
                onClick={() => setIsPostcodeOpen(false)}
                className="mb-1 p-1 text-[20px] font-bold leading-none text-gray-400"
              >
                ×
              </button>
            </div>
            <div className="relative w-full flex-1 overflow-y-auto">
              <DaumPostcode
                onComplete={handleCompletePostcode}
                style={{ width: "100%", height: "450px" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerStoreRegister;
