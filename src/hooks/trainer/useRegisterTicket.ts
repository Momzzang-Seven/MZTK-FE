import { type ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EXERCISE_CATEGORIES } from "@constant";
import {
    getTrainerStore,
    registerTrainerClass,
    type MarketplaceClassCategory,
    type MarketplaceClassTimePayload,
    type MarketplaceDayOfWeek,
} from "@services";

export type RegisterStep = "photo" | "info";

const CATEGORY_MAP: Record<string, MarketplaceClassCategory> = {
    "PT/헬스": "PT",
    "요가/필라테스": "PILATES",
    "크로스핏": "CROSSFIT",
};

const DAY_OF_WEEK_MAP: Record<string, MarketplaceDayOfWeek> = {
    월: "MONDAY",
    화: "TUESDAY",
    수: "WEDNESDAY",
    목: "THURSDAY",
    금: "FRIDAY",
    토: "SATURDAY",
    일: "SUNDAY",
};

const toPositiveInt = (value: string | number) => {
    const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toApiCategory = (category: string): MarketplaceClassCategory => {
    if (category in CATEGORY_MAP) {
        return CATEGORY_MAP[category];
    }

    switch (category) {
        case "PT":
        case "PILATES":
        case "YOGA":
        case "CROSSFIT":
        case "BOXING":
        case "DANCE":
        case "REHABILITATION":
            return category;
        default:
            return "OTHER";
    }
};

export const useRegisterTicket = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<RegisterStep>("photo");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isCheckingStore, setIsCheckingStore] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: EXERCISE_CATEGORIES[1],
        price: "",
        capacity: "",
        description: "",
        tags: ["", "", ""],
        features: ["", "", ""],
        duration: "",
        supplies: "",
        operatingDays: [] as string[],
        operatingTimes: {
            월: [],
            화: [],
            수: [],
            목: [],
            금: [],
            토: [],
            일: [],
        } as Record<string, string[]>,
    });

    useEffect(() => {
        let isMounted = true;

        const ensureTrainerStore = async () => {
            try {
                await getTrainerStore();
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404 &&
                    error.response?.data?.code === "MARKETPLACE_001"
                ) {
                    window.alert("매장 정보를 먼저 등록해야 클래스 등록이 가능합니다.");
                    navigate("/trainer/store-register", { replace: true });
                    return;
                }

                window.alert("매장 정보를 확인하지 못했습니다. 다시 시도해 주세요.");
                navigate("/trainer", { replace: true });
                return;
            } finally {
                if (isMounted) {
                    setIsCheckingStore(false);
                }
            }
        };

        void ensureTrainerStore();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        setFormData((prev) => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return { ...prev, features: newFeatures };
        });
    };

    const handleTagChange = (index: number, value: string) => {
        setFormData((prev) => {
            const newTags = [...prev.tags];
            newTags[index] = value;
            return { ...prev, tags: newTags };
        });
    };

    const handleDayToggle = (day: string) => {
        setFormData((prev) => {
            const isSelected = prev.operatingDays.includes(day);
            return {
                ...prev,
                operatingDays: isSelected
                    ? prev.operatingDays.filter((selectedDay) => selectedDay !== day)
                    : [...prev.operatingDays, day],
            };
        });
    };

    const handleAddTime = (day: string, time: string) => {
        if (!time) return;

        setFormData((prev) => {
            const currentTimes = prev.operatingTimes[day];
            if (currentTimes.includes(time)) return prev;

            return {
                ...prev,
                operatingTimes: {
                    ...prev.operatingTimes,
                    [day]: [...currentTimes, time].sort(),
                },
            };
        });
    };

    const handleRemoveTime = (day: string, timeToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            operatingTimes: {
                ...prev.operatingTimes,
                [day]: prev.operatingTimes[day].filter((time) => time !== timeToRemove),
            },
        }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (imagePreviews.length + files.length > 5) {
            alert("이미지는 최대 5장까지 등록 가능합니다.");
            return;
        }

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (indexToRemove: number) => {
        setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleNext = () => {
        if (imagePreviews.length === 0) {
            alert("최소 한 장의 사진을 선택해 주세요.");
            return;
        }
        setStep("info");
    };

    const handleBack = () => {
        if (step === "info") {
            setStep("photo");
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = async () => {
        if (formData.operatingDays.length === 0) {
            alert("최소 하나 이상의 운영 요일을 선택해 주세요.");
            return;
        }

        const hasNoTimeRegistered = formData.operatingDays.some(
            (day) => formData.operatingTimes[day].length === 0
        );
        if (hasNoTimeRegistered) {
            alert("선택한 운영 요일의 클래스 시작 시간을 추가해 주세요.");
            return;
        }

        const capacity = toPositiveInt(formData.capacity);
        const priceAmount = toPositiveInt(formData.price);
        const durationMinutes = toPositiveInt(formData.duration);

        const classTimes: MarketplaceClassTimePayload[] = formData.operatingDays.flatMap(
            (day) => {
                const mappedDay = DAY_OF_WEEK_MAP[day];
                if (!mappedDay) {
                    return [];
                }

                return formData.operatingTimes[day].map((startTime) => ({
                    daysOfWeek: [mappedDay],
                    startTime: `${startTime}:00`,
                    capacity,
                }));
            }
        );

        try {
            setIsSubmitting(true);

            await registerTrainerClass({
                title: formData.title.trim(),
                category: toApiCategory(formData.category),
                description: formData.description.trim(),
                priceAmount,
                durationMinutes,
                tags: formData.tags.map((tag) => tag.trim()).filter(Boolean),
                features: formData.features.map((feature) => feature.trim()).filter(Boolean),
                personalItems: formData.supplies.trim() || null,
                classTimes,
            });

            alert("클래스가 성공적으로 등록되었습니다!");
            navigate("/trainer/list");
        } catch (error) {
            const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
            };

            if (
                axios.isAxiosError(error) &&
                error.response?.status === 404 &&
                error.response?.data?.code === "MARKETPLACE_001"
            ) {
                window.alert("매장 정보를 먼저 등록해야 클래스 등록이 가능합니다.");
                navigate("/trainer/store-register");
                return;
            }

            alert(
                err?.response?.data?.message ||
                    err?.message ||
                    "클래스 등록에 실패했습니다. 입력값을 다시 확인해 주세요."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled =
        isCheckingStore ||
        isSubmitting ||
        !formData.title ||
        !formData.price ||
        !formData.capacity ||
        !formData.description ||
        !formData.duration ||
        !formData.supplies ||
        formData.operatingDays.length === 0;

    return {
        step,
        formData,
        imagePreviews,
        fileInputRef,
        handleChange,
        handleFeatureChange,
        handleTagChange,
        handleDayToggle,
        handleAddTime,
        handleRemoveTime,
        handleImageChange,
        removeImage,
        triggerFileInput,
        handleNext,
        handleBack,
        handleSubmit,
        isSubmitDisabled,
        isCheckingStore,
        isSubmitting,
    };
};
