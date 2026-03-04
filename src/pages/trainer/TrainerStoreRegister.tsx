import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DaumPostcode from 'react-daum-postcode';
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton } from "@components/common";

const TrainerStoreRegister = () => {
    const navigate = useNavigate();

    // 폼 상태
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [sns, setSns] = useState({ home: "", insta: "", x: "" });

    // 네이버 지도 스크립트 상태
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const mapRef = useRef<naver.maps.Map | null>(null);
    const mapElement = useRef<HTMLDivElement>(null);

    // 네이버 지도 API 스크립트 비동기 로드
    useEffect(() => {
        const scriptId = 'naver-map-api';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            // Mock clientId for Naver (ncpClientId)
            script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID&submodules=geocoder`;
            script.id = scriptId;
            script.async = true;
            script.onload = () => setIsMapLoaded(true);
            document.head.appendChild(script);
        } else {
            setIsMapLoaded(true);
        }
    }, []);

    // 맵 초기화
    useEffect(() => {
        if (isMapLoaded && mapElement.current && !mapRef.current) {
            // 기본 위도, 경도 (서울시청 기준)
            const mapOptions = {
                center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
                zoom: 15,
            };
            mapRef.current = new window.naver.maps.Map(mapElement.current, mapOptions);
        }
    }, [isMapLoaded]);

    // 주소 검색 시 좌표 변경
    useEffect(() => {
        if (isMapLoaded && address && mapRef.current) {
            try {
                window.naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
                    if (status !== window.naver.maps.Service.Status.OK) return;

                    if (response.v2.meta.totalCount > 0) {
                        const item = response.v2.addresses[0];
                        const point = new window.naver.maps.Point(Number(item.x), Number(item.y));
                        mapRef.current!.setCenter(point);

                        new window.naver.maps.Marker({
                            position: point,
                            map: mapRef.current!
                        });
                    }
                });
            } catch (e) {
                console.warn("Geocoding failed, check client ID");
            }
        }
    }, [address, isMapLoaded]);

    const handleCompletePostcode = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddress(fullAddress);
        setIsPostcodeOpen(false);
    };

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (imagePreviews.length + files.length > 5) {
            alert("이미지는 최대 5장까지 등록 가능합니다.");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (indexToRemove: number) => {
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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

            <div className="flex-1 px-5 py-6 flex flex-col gap-8 overflow-y-auto pb-32 focus-within:pb-40 transition-all">
                {/* 1. 매장 사진 섹션 */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700">매장 및 시설 사진 <span className="text-gray-400 font-medium text-xs ml-1">(선택)</span></label>
                        <span className="text-xs text-gray-400 font-medium">{imagePreviews.length}/5장</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                        {imagePreviews.length < 5 && (
                            <div
                                onClick={triggerFileInput}
                                className="w-24 h-24 flex-shrink-0 bg-grey-pale rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer active:scale-[0.99] transition-all hover:bg-gray-50"
                            >
                                <img src="/icon/camera.svg" alt="camera" className="w-6 h-6 opacity-30 mb-1" />
                                <span className="text-[10px] text-gray-400 font-medium">사진 추가</span>
                            </div>
                        )}
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="w-24 h-24 flex-shrink-0 relative rounded-xl overflow-hidden border border-gray-100">
                                <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                                >
                                    ✕
                                </button>
                                {index === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-main/80 text-white text-[9px] font-bold text-center py-0.5">
                                        대표 이미지
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">권장 사이즈 1028x720 / 첫 번째 사진이 매장 대표 사진으로 설정됩니다.</p>
                </div>

                {/* 2. 매장 위치 섹션 */}
                <div className="flex flex-col gap-5">
                    {/* 주소 검색 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">매장 위치 (주소) <span className="text-main">*</span></label>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={address}
                                placeholder="주소를 검색해주세요"
                                onClick={() => setIsPostcodeOpen(true)}
                                className="flex-1 bg-grey-pale rounded-xl py-4 px-4 text-[14px] outline-none cursor-pointer text-gray-800"
                            />
                            <button
                                onClick={() => setIsPostcodeOpen(true)}
                                className="bg-main text-white px-5 rounded-xl text-[14px] font-bold shadow-sm whitespace-nowrap active:brightness-95 transition-all"
                            >
                                주소 찾기
                            </button>
                        </div>
                        {address && (
                            <input
                                type="text"
                                value={detailAddress}
                                onChange={(e) => setDetailAddress(e.target.value)}
                                placeholder="상세 주소를 입력해주세요"
                                className="w-full bg-grey-pale rounded-xl py-4 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20 mt-1"
                            />
                        )}
                    </div>

                    {/* 지도 표출 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">지도 위치</label>
                        <div className="w-full h-[220px] bg-grey-pale rounded-xl overflow-hidden relative border border-gray-100">
                            <div ref={mapElement} className="w-full h-full" />
                            {!isMapLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px] font-medium">
                                    지도를 불러오는 중입니다...
                                </div>
                            )}
                            {isMapLoaded && !window.naver?.maps && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-[14px] font-bold bg-white/90 z-10 px-5 text-center leading-relaxed backdrop-blur-sm border border-gray-100">
                                    네이버 Map 연동 필요
                                    <span className="text-[12px] font-medium text-gray-400 mt-1">NCP Client ID를 적용하면<br />지도가 활성화됩니다.</span>
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
                        <div className="text-[13px] text-gray-600 font-bold w-[76px] flex items-center gap-1.5 opacity-80">
                            <img src="/icon/user.svg" alt="home" className="w-4 h-4 grayscale" /> 홈페이지
                        </div>
                        <input
                            type="text"
                            value={sns.home}
                            onChange={(e) => setSns({ ...sns, home: e.target.value })}
                            placeholder="URL 입력"
                            className="flex-1 bg-grey-pale rounded-xl py-3.5 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[13px] text-gray-600 font-bold w-[76px] flex items-center gap-1.5 opacity-80">
                            <img src="/icon/gallery.svg" alt="insta" className="w-4 h-4 grayscale" /> 인스타
                        </div>
                        <input
                            type="text"
                            value={sns.insta}
                            onChange={(e) => setSns({ ...sns, insta: e.target.value })}
                            placeholder="@아이디 입력"
                            className="flex-1 bg-grey-pale rounded-xl py-3.5 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[13px] text-gray-600 font-bold w-[76px] flex items-center gap-1.5 opacity-80">
                            <img src="/icon/comment.svg" alt="x" className="w-4 h-4 grayscale" /> X (트위터)
                        </div>
                        <input
                            type="text"
                            value={sns.x}
                            onChange={(e) => setSns({ ...sns, x: e.target.value })}
                            placeholder="@아이디 입력"
                            className="flex-1 bg-grey-pale rounded-xl py-3.5 px-4 text-[14px] outline-none focus:ring-2 focus:ring-main/20"
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
