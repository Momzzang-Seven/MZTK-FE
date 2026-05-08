import { type ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EXERCISE_CATEGORIES } from "@constant";
import {
  getMarketplaceClassDetail,
  getTrainerStore,
  registerTrainerClass,
  updateTrainerClass,
  type MarketplaceClassCategory,
  type MarketplaceDayOfWeek,
  type UpdateTrainerClassTimePayload,
} from "@services";

const IMAGE_BASE_URL =
  (import.meta.env.VITE_IMAGE_BASE_URL as string | undefined) ||
  "https://mztk-bucket.s3.ap-northeast-2.amazonaws.com/";

const DAY_TO_API_MAP: Record<string, MarketplaceDayOfWeek> = {
  월: "MONDAY",
  화: "TUESDAY",
  수: "WEDNESDAY",
  목: "THURSDAY",
  금: "FRIDAY",
  토: "SATURDAY",
  일: "SUNDAY",
};

const API_TO_DAY_MAP: Record<MarketplaceDayOfWeek, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

const CATEGORY_MAP: Record<string, MarketplaceClassCategory> = {
  "PT/헬스": "PT",
  필라테스: "PILATES",
  요가: "YOGA",
  "요가/필라테스": "PILATES",
  크로스핏: "CROSSFIT",
  복싱: "BOXING",
  댄스: "DANCE",
  재활: "REHABILITATION",
};

// API enum → form key (e.g. "PT" → "PT") — keep as key for select value
const API_TO_CATEGORY_MAP: Record<string, string> = {
  PT: "PT",
  PILATES: "PILATES",
  YOGA: "YOGA",
  CROSSFIT: "CROSSFIT",
  BOXING: "BOXING",
  DANCE: "DANCE",
  REHABILITATION: "REHABILITATION",
  OTHER: "OTHER",
};

const createEmptyOperatingTimes = () =>
  ({
    월: [],
    화: [],
    수: [],
    목: [],
    금: [],
    토: [],
    일: [],
  }) as Record<string, string[]>;

const toPositiveInt = (value: string | number) => {
  const parsed = Number.parseInt(String(value).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toApiCategory = (category: string): MarketplaceClassCategory => {
  // category is already an API key (e.g. "PT") — use CATEGORY_MAP for label fallback
  if (category in CATEGORY_MAP) return CATEGORY_MAP[category];
  const direct = category as MarketplaceClassCategory;
  return direct ?? "OTHER";
};

const toSlotKey = (day: string, time: string) => `${day}-${time}`;

export const useTicketForm = (mode: "create" | "edit" = "create") => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingSlotIds, setExistingSlotIds] = useState<
    Record<string, number>
  >({});
  const [formData, setFormData] = useState({
    title: "",
    category: EXERCISE_CATEGORIES[1].key,
    price: "",
    capacity: "",
    description: "",
    tags: ["", "", ""],
    features: ["", "", ""],
    duration: "",
    supplies: "",
    operatingDays: [] as string[],
    operatingTimes: createEmptyOperatingTimes(),
  });

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await getTrainerStore();

        if (mode === "edit") {
          const classId = Number(id);
          if (!Number.isFinite(classId)) {
            window.alert("수정할 클래스 정보를 찾지 못했습니다.");
            navigate("/trainer/list", { replace: true });
            return;
          }

          const detail = await getMarketplaceClassDetail(classId);
          if (!isMounted) return;

          const slotIdsByKey: Record<string, number> = {};
          const operatingTimes = createEmptyOperatingTimes();
          const operatingDaySet = new Set<string>();

          detail.classTimes.forEach((classTime) => {
            const time = classTime.startTime.slice(0, 5);
            classTime.daysOfWeek.forEach((apiDay) => {
              const day = API_TO_DAY_MAP[apiDay];
              if (!day) return;

              operatingDaySet.add(day);

              if (!operatingTimes[day].includes(time)) {
                operatingTimes[day] = [...operatingTimes[day], time].sort();
              }

              slotIdsByKey[toSlotKey(day, time)] = classTime.timeId;
            });
          });

          const previewKeys = [
            detail.thumbnailFinalObjectKey,
            ...detail.images
              .sort((a, b) => a.imgOrder - b.imgOrder)
              .map((image) => image.finalObjectKey),
          ].filter(Boolean) as string[];

          setExistingSlotIds(slotIdsByKey);
          setImagePreviews(
            Array.from(new Set(previewKeys)).map((key) =>
              /^https?:\/\//.test(key)
                ? key
                : `${IMAGE_BASE_URL.replace(/\/$/, "")}/${key.replace(/^\/+/, "")}`
            )
          );
          setFormData({
            title: detail.title,
            category: API_TO_CATEGORY_MAP[detail.category] ?? detail.category,
            price: String(detail.priceAmount),
            capacity: detail.classTimes[0]?.capacity
              ? String(detail.classTimes[0].capacity)
              : "",
            description: detail.description,
            tags: [...(detail.tags ?? []), "", "", ""].slice(0, 3),
            features: [...(detail.features ?? []), "", "", ""].slice(0, 3),
            duration: String(detail.durationMinutes),
            supplies: detail.personalItems ?? "",
            operatingDays: Array.from(operatingDaySet),
            operatingTimes,
          });
        }
      } catch (error) {
        console.error("Failed to initialize ticket form", error);

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 404 &&
          error.response?.data?.code === "MARKETPLACE_001"
        ) {
          window.alert(
            "매장 정보를 먼저 등록해야 클래스 등록 및 수정이 가능합니다."
          );
          navigate("/trainer/store-register", { replace: true });
          return;
        }

        window.alert("클래스 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
        navigate("/trainer/list", { replace: true });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [id, mode, navigate]);

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
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (formData.operatingDays.length === 0) {
      window.alert("최소 하나 이상의 운영 요일을 선택해 주세요.");
      return;
    }

    const hasNoTimeRegistered = formData.operatingDays.some(
      (day) => formData.operatingTimes[day].length === 0
    );
    if (hasNoTimeRegistered) {
      window.alert("선택한 운영 요일의 클래스 시작 시간을 추가해 주세요.");
      return;
    }

    const capacity = toPositiveInt(formData.capacity);
    const priceAmount = toPositiveInt(formData.price);
    const durationMinutes = toPositiveInt(formData.duration);
    const classTimes: UpdateTrainerClassTimePayload[] =
      formData.operatingDays.flatMap((day) =>
        formData.operatingTimes[day].map((time) => ({
          timeId: existingSlotIds[toSlotKey(day, time)],
          daysOfWeek: [DAY_TO_API_MAP[day]],
          startTime: `${time}:00`,
          capacity,
        }))
      );

    try {
      setIsSubmitting(true);

      if (mode === "edit") {
        const classId = Number(id);
        await updateTrainerClass(classId, {
          title: formData.title.trim(),
          category: toApiCategory(formData.category),
          description: formData.description.trim(),
          priceAmount,
          durationMinutes,
          tags: formData.tags.map((tag) => tag.trim()).filter(Boolean),
          features: formData.features
            .map((feature) => feature.trim())
            .filter(Boolean),
          personalItems: formData.supplies.trim() || null,
          classTimes,
        });
      } else {
        await registerTrainerClass({
          title: formData.title.trim(),
          category: toApiCategory(formData.category),
          description: formData.description.trim(),
          priceAmount,
          durationMinutes,
          tags: formData.tags.map((tag) => tag.trim()).filter(Boolean),
          features: formData.features
            .map((feature) => feature.trim())
            .filter(Boolean),
          personalItems: formData.supplies.trim() || null,
          classTimes,
        });
      }

      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to submit ticket form", error);
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : "클래스 저장에 실패했습니다. 입력값을 다시 확인해 주세요.";
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    isSubmitting ||
    !formData.title ||
    !formData.price ||
    !formData.capacity ||
    !formData.description ||
    !formData.duration ||
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
    isSubmitDisabled,
    isSubmitting,
    isLoading,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    navigate,
  };
};
