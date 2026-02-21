import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PostManagement from '../PostManagement';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EXERCISE_TEXT } from '@constant/exercise';

// 모킹
const mockFetchPosts = vi.fn();
const mockSearchPosts = vi.fn();
const mockBanPost = vi.fn().mockResolvedValue(undefined);

vi.mock('@store/adminStore', () => ({
    useAdminStore: () => ({
        filteredPosts: [
            {
                id: 1,
                title: 'Test Post 1',
                content: 'Content 1',
                author: 'user1',
                profileColor: '#000',
                date: '2024-01-01',
                category: '자유게시판',
                isBanned: false,
                likeCount: 0,
                comments: []
            },
        ],
        fetchPosts: mockFetchPosts,
        searchPosts: mockSearchPosts,
        banPost: mockBanPost,
        unbanPost: vi.fn(),
        deleteComment: vi.fn(),
        restoreComment: vi.fn(),
        hasMore: false,
        isFetchingPosts: false,
        postStatusFilter: 'ALL',
        setPostStatusFilter: vi.fn(),
    }),
}));

vi.mock('@hooks/useInfiniteScroll', () => ({
    useInfiniteScroll: vi.fn(() => ({ current: null })),
}));

describe('Admin PostManagement Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('마운트 시 게시글 목록을 가져온다', async () => {
        render(
            <BrowserRouter>
                <PostManagement />
            </BrowserRouter>
        );

        expect(mockFetchPosts).toHaveBeenCalled();
    });

    it('게시글 목록이 렌더링된다', () => {
        render(
            <BrowserRouter>
                <PostManagement />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('user1')).toBeInTheDocument();
    });

    it('삭제 버튼 클릭 시 모달이 표시되고 확인 시 banPost가 호출된다', async () => {
        render(
            <BrowserRouter>
                <PostManagement />
            </BrowserRouter>
        );

        // '게시글 삭제' 버튼 클릭
        const deleteButton = screen.getByText(/게시글 삭제/i);
        fireEvent.click(deleteButton);

        // 삭제 사유 선택 (모달 내의 두 번째 select)
        const selects = screen.getAllByRole('combobox');
        const reasonSelect = selects[selects.length - 1];
        fireEvent.change(reasonSelect, { target: { value: '부적절한 내용' } });

        // 모달 내의 '삭제' 버튼 찾기 (그냥 '삭제' 텍스트를 가진 버튼 중 나중 것)
        const deleteButtons = screen.getAllByRole('button', { name: /^삭제$/ });
        const targetBtn = deleteButtons[deleteButtons.length - 1];

        await act(async () => {
            fireEvent.click(targetBtn);
        });

        expect(mockBanPost).toHaveBeenCalledWith(1);
    });
});
