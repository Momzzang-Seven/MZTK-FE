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
import { CommonButton, CommonModal } from "@components/common";
import { getTrainerStore, upsertTrainerStore } from "@services";
import { isValidKoreanPhoneNumber, normalizeOptionalHttpUrl } from "@utils";

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

// Helper: Auto-format phone number with hyphens
const formatPhoneNumber = (value: string) => {
  const nums = value.replace(/[^0-9]/g, "");
  if (nums.startsWith("02")) {
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
    if (nums.length <= 9) {
      return `${nums.slice(0, 2)}-${nums.slice(2, 5)}-${nums.slice(5, 9)}`;
    }
    return `${nums.slice(0, 2)}-${nums.slice(2, 6)}-${nums.slice(6, 10)}`;
  }
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
};

const StoreMapController = ({ coordinates }: { coordinates: Coordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.setCenter(toMapPosition(coordinates));
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
    if (!isApiLoaded || !window.google?.maps?.Geocoder) return;

    let isMounted = true;
    const geocoder = new window.google.maps.Geocoder();
    setIsResolvingCoordinates(true);
    const cleanAddress = address.split("(")[0].trim();

    geocoder.geocode(
      { address: cleanAddress, region: "KR" },
      (results, status) => {
        if (!isMounted) return;
        const location = results?.[0]?.geometry?.location;
        if (status !== window.google.maps.GeocoderStatus.OK || !location) {
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
      }
    );
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
  const [errorModal, setErrorModal] = useState<{
    title: string;
    desc: string;
  } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          if (isMounted) setHasExistingStore(false);
        }
      } finally {
        if (isMounted) setIsLoadingStore(false);
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
    if (extraAddress) setDetailAddress(`(${extraAddress}) `);
    setCoordinates(null);
    setIsPostcodeOpen(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsResolvingCoordinates(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setMapCenter(next);
        setCoordinates(next);
        setIsResolvingCoordinates(false);
      },
      () => setIsResolvingCoordinates(false)
    );
  };

  const handleRegister = async () => {
    if (!storeName.trim() || !address.trim() || !coordinates || !phone.trim())
      return;

    if (!isValidKoreanPhoneNumber(phone)) {
      setErrorModal({
        title: "Invalid phone number",
        desc: "Please enter a complete Korean phone number.",
      });
      return;
    }

    let homepageUrl: string | null;
    let instagramUrl: string | null;
    let xProfileUrl: string | null;
    try {
      homepageUrl = normalizeOptionalHttpUrl(sns.home);
      instagramUrl = normalizeOptionalHttpUrl(sns.insta);
      xProfileUrl = normalizeOptionalHttpUrl(sns.x);
    } catch (error) {
      setErrorModal({
        title: "Invalid URL",
        desc:
          error instanceof Error
            ? error.message
            : "Only safe http and https URLs are allowed.",
      });
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
        homepageUrl,
        instagramUrl,
        xProfileUrl,
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.code === "VALIDATION_001"
      ) {
        const validationErrors = error.response.data.data;
        const errorMsg = Object.values(validationErrors).join("<br/>");
        setErrorModal({ title: "입력 정보 오류", desc: errorMsg });
      } else {
        setErrorModal({
          title: "저장 실패",
          desc: "매장 정보를 저장하는 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    storeName.trim() &&
    address.trim() &&
    detailAddress.trim() &&
    phone.trim() &&
    isValidKoreanPhoneNumber(phone) &&
    coordinates;
  const isPhoneInvalid = phone.trim() && !isValidKoreanPhoneNumber(phone);

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#F9FAFB]">
      <TrainerHeader
        title={hasExistingStore ? "매장 정보 관리" : "신규 매장 등록"}
        desc={
          hasExistingStore
            ? "매장 정보를 최신 상태로 유지해 주세요."
            : "수강생들이 찾아올 매장 정보를 등록해 주세요."
        }
        showBack
      />

      <div className="flex-1 overflow-y-auto pb-32">
        {isLoadingStore ? (
          <div className="flex h-full items-center justify-center py-20 text-gray-400 font-bold tracking-tight">
            정보를 불러오고 있습니다...
          </div>
        ) : (
          <div className="px-5 py-6 flex flex-col gap-8">
            <section className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-4 bg-main rounded-full" />
                <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                  기본 정보
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  매장명 *
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="매장명을 입력하세요"
                  className="w-full h-[56px] rounded-2xl bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none focus:border-main focus:ring-4 focus:ring-main/5 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  매장 전화번호 *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  className="w-full h-[56px] rounded-2xl bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none focus:border-main focus:ring-4 focus:ring-main/5 transition-all shadow-sm"
                />
                {isPhoneInvalid ? (
                  <p className="text-[11px] text-red-400 font-bold ml-1 leading-tight">
                    Please enter a complete Korean phone number.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-4 bg-main rounded-full" />
                <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                  위치 정보
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  매장 주소 *
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={address}
                    placeholder="주소 검색"
                    onClick={() => setIsPostcodeOpen(true)}
                    className="flex-1 h-[56px] rounded-2xl bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none cursor-pointer"
                  />
                  <button
                    onClick={() => setIsPostcodeOpen(true)}
                    className="px-5 h-[56px] bg-gray-900 text-white rounded-2xl text-[14px] font-black btn-press border-none"
                  >
                    검색
                  </button>
                </div>
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="상세 주소를 입력하세요"
                  className="w-full h-[56px] rounded-2xl bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none focus:border-main focus:ring-4 focus:ring-main/5 transition-all shadow-sm"
                />
                {isResolvingCoordinates ? (
                  <p className="text-[12px] text-main font-bold animate-pulse ml-1">
                    좌표 확인 중...
                  </p>
                ) : address && !coordinates ? (
                  <p className="text-[11px] text-red-400 font-bold ml-1 leading-tight">
                    좌표를 자동으로 찾지 못했습니다. <br />
                    지도를 직접 움직여 위치를 설정해 주세요.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative h-[240px] w-full overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-md">
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
                        onCameraChanged={(e) =>
                          setMapCenter({
                            latitude: e.detail.center.lat,
                            longitude: e.detail.center.lng,
                          })
                        }
                      >
                        <StoreMapController
                          coordinates={coordinates ?? mapCenter}
                        />
                        <AdvancedMarker position={toMapPosition(mapCenter)}>
                          <Pin
                            background={coordinates ? "#fab12f" : "#9CA3AF"}
                            glyphColor="#fff"
                            borderColor={coordinates ? "#fab12f" : "#9CA3AF"}
                          />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300 text-xs font-bold">
                      API Key Error
                    </div>
                  )}
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleCurrentLocation}
                    className="flex-1 h-[50px] bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-black btn-press"
                  >
                    현재 위치로
                  </button>
                  <button
                    onClick={() => setCoordinates(mapCenter)}
                    className="flex-1 h-[50px] bg-amber-50 text-main border border-main/10 rounded-xl text-[13px] font-black btn-press"
                  >
                    지도 중심으로 설정
                  </button>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-4 bg-main rounded-full" />
                <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                  SNS 및 웹사이트
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={sns.home}
                  onChange={(e) =>
                    setSns((prev) => ({ ...prev, home: e.target.value }))
                  }
                  placeholder="홈페이지 URL (예: www.mztk.com)"
                  className="w-full h-[52px] rounded-xl bg-white border border-gray-100 px-5 text-[14px] font-bold outline-none shadow-sm"
                />
                <input
                  type="text"
                  value={sns.insta}
                  onChange={(e) =>
                    setSns((prev) => ({ ...prev, insta: e.target.value }))
                  }
                  placeholder="인스타그램 URL"
                  className="w-full h-[52px] rounded-xl bg-white border border-gray-100 px-5 text-[14px] font-bold outline-none shadow-sm"
                />
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <CommonButton
          label={
            isSaving
              ? "저장 중..."
              : hasExistingStore
                ? "정보 수정 완료"
                : "매장 등록 완료"
          }
          onClick={handleRegister}
          disabled={isLoadingStore || isSaving || !isFormValid}
          className="shadow-xl"
        />
      </div>

      {errorModal && (
        <CommonModal
          variant="error"
          title={errorModal.title}
          desc={errorModal.desc}
          confirmLabel="확인"
          onConfirmClick={() => setErrorModal(null)}
        />
      )}

      {isSuccessModalOpen && (
        <CommonModal
          title={hasExistingStore ? "수정 완료" : "등록 완료"}
          desc={
            hasExistingStore
              ? "매장 정보가 성공적으로 수정되었습니다."
              : "매장 정보가 성공적으로 등록되었습니다."
          }
          confirmLabel="대시보드로 이동"
          onConfirmClick={() => {
            setIsSuccessModalOpen(false);
            navigate("/trainer");
          }}
        />
      )}

      {isPostcodeOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-[400px] bg-white rounded-[28px] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h3 className="text-[16px] font-black text-gray-900">
                주소 찾기
              </h3>
              <button
                onClick={() => setIsPostcodeOpen(false)}
                className="text-[24px] text-gray-400"
              >
                &times;
              </button>
            </div>
            <DaumPostcode
              onComplete={handleCompletePostcode}
              style={{ height: "450px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerStoreRegister;
