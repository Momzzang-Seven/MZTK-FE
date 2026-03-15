import { api } from "./client";

/**
 * 트레이너 이의 신청 (제제 시)
 */
export const postTrainerAppeal = async (content: string) => {
    const { data } = await api.post("/trainer/appeal", { content });
    return data;
};

/**
 * 트레이너 상태 조회
 */
export const getTrainerStatus = async () => {
    const { data } = await api.get("/trainer/status");
    return data;
};
