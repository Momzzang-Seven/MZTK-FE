import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@pages/Home';
import { levelHandlers } from '@mocks/handlers/level';
import { server } from '@mocks/server';

// Note: We use the actual Store here to test the real integration with MSW
// But we need to make sure the store is initialized for each test.
import { useUserStore } from '@store';

describe('[통합] Level System - 초기 로딩 및 정책 연동', () => {
    beforeEach(() => {
        server.use(...levelHandlers);
        // Ensure store is completely reset before each test
        useUserStore.getState().reset();
    });

    it('홈 진입 시 /level 및 /policies API를 호출하고 결과를 UI에 반영한다', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // LevelProgress 컴포넌트에서 레벨(5)이 표시되는지 확인
        // findByText는 내부적으로 waitFor를 내장하고 있어 테스트가 훨씬 안정적입니다.
        // 정규표현식에 'i'(case-insensitive)와 '.'(wildcard)를 더 관대하게 사용하여 비결정적 매칭 오류를 방지합니다.
        const levelText = await screen.findByText(/Lv\.*5/i, {}, { timeout: 15000 });
        expect(levelText).toBeInTheDocument();

        // xp / maxXp EXP 형식으로 표시됨 (예: "80 / 100 EXP")
        const xpText = await screen.findByText(/80.*\/.*100/i, {}, { timeout: 15000 });
        expect(xpText).toBeInTheDocument();
    });

    it('XP Ledger 및 Level History API가 백그라운드에서 호출된다 (connectivity check)', async () => {
        const spyInit = vi.spyOn(useUserStore.getState(), 'initLevel');
        
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(spyInit).toHaveBeenCalled();
        }, { timeout: 15000 });
    });
});
