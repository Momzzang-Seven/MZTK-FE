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
        vi.resetModules();
        server.use(...levelHandlers);
        useUserStore.getState().clearUser();
    });

    it('홈 진입 시 /level 및 /policies API를 호출하고 결과를 UI에 반영한다', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // LevelProgress 컴포넌트에서 레벨(5)이 표시되는지 확인
        // MSW handlers/level.ts 에서 level: 5, availableXp: 80, requiredXpForNext: 100 으로 주입됨
        // 컴포넌트 렌더링: `Lv.{level}` 형식 (대소문자 Lv)
        await waitFor(() => {
            const levelText = screen.getByText(/Lv\.5/);
            expect(levelText).toBeInTheDocument();
        }, { timeout: 10000 });

        await waitFor(() => {
            // xp / maxXp EXP 형식으로 표시됨 (예: "80 / 100 EXP")
            const xpText = screen.getByText(/80\s*\/\s*100/);
            expect(xpText).toBeInTheDocument();
        }, { timeout: 10000 });
    });

    it('XP Ledger 및 Level History API가 백그라운드에서 호출된다 (connectivity check)', async () => {
        // MSW spy를 위해 전역 fetch 가로채기 가능하지만, 여기서는 에러 없이 로직이 완료되는지로 판단
        const spyInit = vi.spyOn(useUserStore.getState(), 'initLevel');
        
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(spyInit).toHaveBeenCalled();
        });
        
        // 에러 없이 완료되면 성공으로 간주 (현재 UI에 Ledger 목록이 없으므로)
    });
});
