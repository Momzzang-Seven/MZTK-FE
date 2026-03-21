import { useState, useCallback } from 'react';

// 제네릭 타입을 사용하여 다양한 모달 데이터 타입을 지원하도록 함
export const useModal = <T = unknown, S = unknown>() => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<{
        type: T | null;
        targetId: number | null;
        subTargetId: number | null;
        extraData?: S;
    }>({
        type: null,
        targetId: null,
        subTargetId: null,
        extraData: undefined
    });

    const openModal = useCallback((type: T, targetId: number, subTargetId?: number, extraData?: S) => {
        setModalData({
            type,
            targetId,
            subTargetId: subTargetId || null,
            extraData
        });
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setModalData({
            type: null,
            targetId: null,
            subTargetId: null,
            extraData: undefined
        });
    }, []);

    return {
        isOpen,
        modalData,
        openModal,
        closeModal
    };
};
