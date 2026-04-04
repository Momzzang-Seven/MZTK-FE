import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@pages/Home';
import { useUserStore } from '@store/userStore';

// levelService를 직접 모킹하여 네트워크/MSW 레이어의 불확실성을 제거합니다.
vi.mock('@services/level', () => ({
    levelService: {
        getMyLevel: vi.fn(),
        getLevelPolicies: vi.fn(),
        getMyXpLedger: vi.fn().mockResolvedValue({ content: [], totalElements: 0 }),
        getMyLevelUpHistories: vi.fn().mockResolvedValue({ content: [], totalElements: 0 }),
    },
}));

import { levelService } from '@services/level';

describe('[통합] Level System - 초기 로딩 및 정책 연동', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 스토어 완전 초기화
        useUserStore.getState().reset();

        // 서비스 응답 모킹 (정상 케이스)
        vi.mocked(levelService.getMyLevel).mockResolvedValue({
            level: 5,
            availableXp: 80,
            requiredXpForNext: 100,
        });
        vi.mocked(levelService.getLevelPolicies).mockResolvedValue({
            policies: [{ level: 1, requiredXp: 100 }],
        });
    });

    it('홈 진입 시 levelService를 호출하고 결과를 UI에 반영한다', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // 1. 레벨 텍스트 확인 (Lv.5)
        // findByText는 최대 1000ms 동안 대기하며, 요소가 나타날 때까지 스마트하게 기다립니다.
        const levelText = await screen.findByText(/Lv\.5/i);
        expect(levelText).toBeInTheDocument();

        // 2. XP 텍스트 확인 (80 / 100 EXP)
        const xpText = await screen.findByText(/80\s*\/\s*100/i);
        expect(xpText).toBeInTheDocument();
    });

    it('레벨 정보 로딩 시 백그라운드 호출이 정상적으로 수행된다', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // findByText를 통해 비동기 업데이트가 완료될 때까지 기다린 후 호출 여부 확인
        await screen.findByText(/Lv\.5/i);
        
        expect(levelService.getMyLevel).toHaveBeenCalled();
        expect(levelService.getMyXpLedger).toHaveBeenCalled();
    });
});
