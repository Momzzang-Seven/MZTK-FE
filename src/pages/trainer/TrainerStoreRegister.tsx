import { useEffect, useState } from "react";
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

type Coordinates = {
    latitude: number;
    longitude: number;
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

const StoreMapController = ({ coordinates }: { coordinates: Coordinates | null }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        map.panTo(toMapPosition(coordinates ?? DEFAULT_COORDINATES));

        if (!coordinates) {
            map.setZoom(DEFAULT_ZOOM);
        }
    }, [coordinates, map]);

    return null;
};

const StoreGeocoder = ({
    address,
    setCoordinates,
    setIsResolvingCoordinates,
}: {
    address: string;
    setCoordinates: React.Dispatch<React.SetStateAction<Coordinates | null>>;
    setIsResolvingCoordinates: React.Dispatch<React.SetStateAction<boolean>>;
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

        geocoder.geocode({ address }, (results, status) => {
            if (!isMounted) return;

            const location = results?.[0]?.geometry?.location;

            if (status !== window.google.maps.GeocoderStatus.OK || !location) {
                setCoordinates(null);
                setIsResolvingCoordinates(false);
                return;
            }

            setCoordinates({
                latitude: location.lat(),
                longitude: location.lng(),
            });
            setIsResolvingCoordinates(false);
        });

        return () => {
            isMounted = false;
        };
    }, [address, isApiLoaded, setCoordinates, setIsResolvingCoordinates]);

    return null;
};

const TrainerStoreRegister = () => {
    const navigate = useNavigate();
    const mapKey = import.meta.env.VITE_GOOGLE_MAP_API || "";
    const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || "";

    // 폼 상태
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [sns, setSns] = useState({ home: "", insta: "", x: "" });
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [isResolvingCoordinates, setIsResolvingCoordinates] = useState(false);

    const handleCompletePostcode = (data: { address: string; addressType: string; bname: string; buildingName: string; }) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddress(fullAddress);
        setCoordinates(null);
        setIsPostcodeOpen(false);
    };

    const handleRegister = () => {
        if (!address) {
            alert("매장 위치(주소)를 입력해주세요.");
            return;
        }
        if (!phone) {
            alert("매장 전화번호를 입력해주세요.");
            return;
        }
        localStorage.setItem("trainerStoreRegistered", "true");
        alert("매장 및 클래스 장소가 성공적으로 등록되었습니다!");
        navigate("/trainer");
    };

    return (
        <div className="flex flex-col h-full bg-white min-h-screen relative">
            <TrainerHeader title="매장 및 클래스 장소 등록/수정" showBack />

            <div className="flex-1 px-5 py-6 flex flex-col gap-10 overflow-y-auto pb-32 focus-within:pb-40 transition-all">
                {/* 1. 매장 위치 섹션 */}

                {/* 2. 매장 위치 섹션 */}
                <div className="flex flex-col gap-6">
                    {/* 주소 검색 */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700">매장 위치 (주소) <span className="text-main">*</span></label>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={address}
                                placeholder="주소를 검색해주세요"
                                onClick={() => setIsPostcodeOpen(true)}
                                className="flex-1 bg-gray-50 rounded-xl py-4 px-4 text-[14px] outline-none cursor-pointer text-gray-800 border border-gray-100"
                            />
                            <button
                                onClick={() => setIsPostcodeOpen(true)}
                                className="bg-main text-white px-5 rounded-xl text-[14px] font-bold shadow-sm whitespace-nowrap active:brightness-95 transition-all"
                            >
                                주소 찾기
                            </button>
                        </div>
                        <input
                            type="text"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            placeholder="상세 주소를 입력해주세요 (동, 호수 등)"
                            className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20 border border-gray-100"
                        />
                        {isResolvingCoordinates && (
                            <p className="text-[12px] text-gray-400">주소 좌표를 확인하는 중입니다...</p>
                        )}
                    </div>

                    {/* 지도 표출 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">지도 위치</label>
                        <div className="w-full h-[220px] bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
                            {mapKey ? (
                                <APIProvider apiKey={mapKey}>
                                    <StoreGeocoder
                                        address={address}
                                        setCoordinates={setCoordinates}
                                        setIsResolvingCoordinates={setIsResolvingCoordinates}
                                    />
                                    <Map
                                        defaultCenter={toMapPosition(DEFAULT_COORDINATES)}
                                        defaultZoom={DEFAULT_ZOOM}
                                        gestureHandling="greedy"
                                        disableDefaultUI
                                        mapId={mapId}
                                        style={{ width: "100%", height: "100%" }}
                                    >
                                        <StoreMapController coordinates={coordinates} />
                                        {coordinates && (
                                            <AdvancedMarker position={toMapPosition(coordinates)}>
                                                <Pin background="#fab12f" glyphColor="#fff" borderColor="#fab12f" />
                                            </AdvancedMarker>
                                        )}
                                    </Map>
                                    {address && !isResolvingCoordinates && !coordinates && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-[13px] font-medium text-gray-500 text-center px-6">
                                            주소 좌표를 찾을 수 없습니다. 다른 주소로 다시 시도해주세요.
                                        </div>
                                    )}
                                </APIProvider>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-[14px] font-bold bg-white/90 z-10 px-5 text-center leading-relaxed backdrop-blur-sm border border-gray-100">
                                    Google Map API Key 필요
                                    <span className="text-[12px] font-medium text-gray-400 mt-1">
                                        .env에 VITE_GOOGLE_MAP_API를 넣으면
                                        <br />
                                        지도가 활성화됩니다.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. 매장 연락처 섹션 */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">매장 전화번호 <span className="text-main">*</span></label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="예) 02-1234-5678"
                        className="w-full bg-grey-pale rounded-xl py-4 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                    />
                </div>

                {/* 3. 소셜 미디어 링크 섹션 (선택) */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-gray-700 mb-1">SNS 계정 연동 <span className="text-gray-400 font-medium text-xs ml-1">(선택)</span></label>

                    <div className="flex items-center gap-3">
                        <div className="text-[13px] text-gray-600 font-bold w-[100px] flex items-center opacity-80">
                            홈페이지
                        </div>
                        <input
                            type="text"
                            value={sns.home}
                            onChange={(e) => setSns({ ...sns, home: e.target.value })}
                            placeholder="URL 입력"
                            className="flex-1 bg-gray-50 rounded-xl py-3.5 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20 border border-gray-100"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[13px] text-gray-600 font-bold w-[100px] flex items-center opacity-80">
                            인스타
                        </div>
                        <input
                            type="text"
                            value={sns.insta}
                            onChange={(e) => setSns({ ...sns, insta: e.target.value })}
                            placeholder="@아이디 입력"
                            className="flex-1 bg-gray-50 rounded-xl py-3.5 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20 border border-gray-100"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[13px] text-gray-600 font-bold w-[100px] flex items-center opacity-80">
                            X (트위터)
                        </div>
                        <input
                            type="text"
                            value={sns.x}
                            onChange={(e) => setSns({ ...sns, x: e.target.value })}
                            placeholder="@아이디 입력"
                            className="flex-1 bg-gray-50 rounded-xl py-3.5 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20 border border-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <CommonButton
                    label="매장 정보 등록/수정하기"
                    onClick={handleRegister}
                    disabled={!address || !phone}
                    className="w-full h-[60px] rounded-2xl shadow-sm active:opacity-90 transition-all font-bold text-[16px]"
                />
            </div>

            {/* Daum Postcode Modal */}
            {isPostcodeOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-5 px-4 w-full h-full max-w-[420px] mx-auto">
                    <div className="bg-white w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-[16px]">주소 검색</h3>
                            <button onClick={() => setIsPostcodeOpen(false)} className="text-gray-400 font-bold p-1 text-[20px] leading-none mb-1">✕</button>
                        </div>
                        <div className="flex-1 w-full relative overflow-y-auto">
                            <DaumPostcode
                                onComplete={handleCompletePostcode}
                                style={{ width: '100%', height: '450px' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerStoreRegister;
