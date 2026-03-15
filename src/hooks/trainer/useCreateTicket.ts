import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EXERCISE_CATEGORIES } from "@constant";

export const useCreateTicket = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        category: EXERCISE_CATEGORIES[1],
        price: "",
        capacity: "", // 정원
        description: "",
        tags: ["", "", ""], // 해시태그 3개
        features: ["", "", ""], // 프로그램 특징 (딱 3칸)
        duration: "", // 수업 시간
        supplies: "", // 준비물
        operatingDays: [] as string[], // 운영 요일
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

    const handleSubmit = () => {
        if (formData.operatingDays.length === 0) {
            alert("최소 하나 이상의 운영 요일을 선택해 주세요.");
            return;
        }

        alert("클래스가 성공적으로 등록되었습니다!");
        navigate("/trainer");
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
        handleSubmit,
        isSubmitDisabled
    };
};
