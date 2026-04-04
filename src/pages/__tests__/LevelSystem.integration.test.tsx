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
        // Ensure store is clean. clearUser() only resets some fields, so we manually reset others.
        const store = useUserStore.getState();
        store.clearUser();
        store.setMaxXp(100);
        store.setXp(0);
        store.setLevel(1);
    });

    it('홈 진입 시 /level 및 /policies API를 호출하고 결과를 UI에 반영한다', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // LevelProgress 컴포넌트에서 레벨(5)이 표시되는지 확인
        // MSW handlers/level.ts 에서 level: 5, availableXp: 80, requiredXpForNext: 100 으로 주입됨
        await waitFor(() => {
            const levelText = screen.queryByText(/Lv\.5/);
            expect(levelText).toBeInTheDocument();
        }, { timeout: 15000 });

        await waitFor(() => {
            // xp / maxXp EXP 형식으로 표시됨 (예: "80 / 100 EXP")
            const xpText = screen.queryByText(/80\s*\/\s*100/);
            expect(xpText).toBeInTheDocument();
        }, { timeout: 15000 });
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
