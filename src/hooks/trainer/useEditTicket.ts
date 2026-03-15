import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EXERCISE_CATEGORIES } from "@constant";

export const useEditTicket = () => {
    const { id } = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
        // In a real app, you'd fetch by ID. Here we use dummy data.
        console.log(`Loading ticket with ID: ${id}`);
        setFormData({
            title: "1:1 집중 웨이트 트레이닝",
            category: "PT/헬스",
            price: "350",
            capacity: "1",
            description: "개인별 맞춤형 웨이트 트레이닝 프로그램입니다.",
            tags: ["체형 분석", "웨이트", "다이어트"],
            features: ["체형 분석 및 평가", "개인 맞춤형 식단 제공", "수업 외 카톡 밀착 코칭"],
            duration: "50분",
            supplies: "실내용 개인 선호 운동화",
            operatingDays: ["월", "수", "금"],
            operatingTimes: {
                월: ["09:00", "10:00", "18:00"],
                화: [],
                수: ["09:00", "15:00", "19:00"],
                목: [],
                금: ["10:00", "11:00"],
                토: [],
                일: [],
            },
        });
        // Dummy images
        setImagePreviews(["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400"]);
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        setFormData(prev => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return { ...prev, features: newFeatures };
        });
    };

    const handleTagChange = (index: number, value: string) => {
        setFormData(prev => {
            const newTags = [...prev.tags];
            newTags[index] = value;
            return { ...prev, tags: newTags };
        });
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => {
            const isSelected = prev.operatingDays.includes(day);
            return {
                ...prev,
                operatingDays: isSelected
                    ? prev.operatingDays.filter(d => d !== day)
                    : [...prev.operatingDays, day]
            };
        });
    };

    const handleAddTime = (day: string, time: string) => {
        if (!time) return;
        setFormData(prev => {
            const currentTimes = prev.operatingTimes[day];
            if (currentTimes.includes(time)) return prev;
            return {
                ...prev,
                operatingTimes: {
                    ...prev.operatingTimes,
                    [day]: [...currentTimes, time].sort()
                }
            };
        });
    };

    const handleRemoveTime = (day: string, timeToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            operatingTimes: {
                ...prev.operatingTimes,
                [day]: prev.operatingTimes[day].filter(time => time !== timeToRemove)
            }
        }));
    };

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

    const isSubmitDisabled =
        !formData.title ||
        !formData.price ||
        !formData.capacity ||
        !formData.description ||
        !formData.duration ||
        !formData.supplies ||
        formData.operatingDays.length === 0;

    return {
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
        isSubmitDisabled
    };
};
