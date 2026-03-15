import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSearchBar } from '../AdminSearchBar';

vi.mock('@constant/admin', () => ({
  ADMIN_TEXT: {
    COMMON: {
      SEARCH: '검색',
    },
  },
}));

describe('AdminSearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('검색 입력 필드가 렌더링된다', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="검색어 입력" onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('검색어 입력');
    expect(input).toBeInTheDocument();
  });

  it('placeholder가 올바르게 표시된다', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="사용자 검색" onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('사용자 검색')).toBeInTheDocument();
  });

  it('입력 시 state가 업데이트된다', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="검색" onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('검색') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '테스트' } });
    
    expect(input.value).toBe('테스트');
  });

  it('검색 버튼 클릭 시 onSearch가 호출된다', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="검색" onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('검색');
    fireEvent.change(input, { target: { value: '검색어' } });
    
    const searchButton = screen.getByRole('button', { name: /검색/ });
    fireEvent.click(searchButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('검색어');
  });

  it('Debounce 기능이 동작한다 (2초 후 자동 검색)', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="검색" onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('검색');
    fireEvent.change(input, { target: { value: '자동검색' } });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(2000);
    
    expect(mockOnSearch).toHaveBeenCalledWith('자동검색');
  });

  it('filterOptions가 있을 때 드롭다운이 표시된다', () => {
    const mockOnSearch = vi.fn();
    const mockOnFilterChange = vi.fn();
    const filterOptions = [
      { label: '전체', value: 'all' },
      { label: '활성', value: 'active' },
    ];
    
    render(
      <AdminSearchBar
        placeholder="검색"
        onSearch={mockOnSearch}
        filterOptions={filterOptions}
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('활성')).toBeInTheDocument();
  });

  it('filterOptions가 없을 때 드롭다운이 숨겨진다', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="검색" onSearch={mockOnSearch} />);
    
    const select = screen.queryByRole('combobox');
    expect(select).not.toBeInTheDocument();
  });

  it('필터 변경 시 onFilterChange가 호출된다', () => {
    const mockOnSearch = vi.fn();
    const mockOnFilterChange = vi.fn();
    const filterOptions = [
      { label: '전체', value: 'all' },
      { label: '활성', value: 'active' },
    ];
    
    render(
      <AdminSearchBar
        placeholder="검색"
        onSearch={mockOnSearch}
        filterOptions={filterOptions}
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'active' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('active');
  });

  it('검색 아이콘이 표시된다', () => {
    const mockOnSearch = vi.fn();
    const { container } = render(
      <AdminSearchBar placeholder="검색" onSearch={mockOnSearch} />
    );
    
    const searchIcon = container.querySelector('svg.h-5.w-5.text-gray-400');
    expect(searchIcon).toBeInTheDocument();
  });

  it('검색 버튼이 올바른 스타일을 가진다', () => {
    const mockOnSearch = vi.fn();
    render(<AdminSearchBar placeholder="검색" onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /검색/ });
    expect(button).toHaveClass('bg-main', 'text-white', 'font-bold');
  });
});
