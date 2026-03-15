import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCard from '../SummaryCard';

describe('SummaryCard', () => {
  it('기본 정보가 렌더링된다', () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        icon="/icon/users.svg"
      />
    );
    
    expect(screen.getByText('총 사용자')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('문자열 value도 렌더링된다', () => {
    render(
      <SummaryCard
        title="상태"
        value="활성"
        icon="/icon/status.svg"
      />
    );
    
    expect(screen.getByText('활성')).toBeInTheDocument();
  });

  it('subValue가 있을 때 표시된다', () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        subValue="전일 대비 +10"
        icon="/icon/users.svg"
      />
    );
    
    expect(screen.getByText('전일 대비 +10')).toBeInTheDocument();
  });

  it('subValue가 없을 때 렌더링되지 않는다', () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        icon="/icon/users.svg"
      />
    );
    
    const subValueElement = screen.queryByText(/전일 대비/);
    expect(subValueElement).not.toBeInTheDocument();
  });

  it('BAN 포함 시 빨간색 텍스트가 적용된다', () => {
    render(
      <SummaryCard
        title="정지된 사용자"
        value={5}
        subValue="BAN 사용자"
        icon="/icon/ban.svg"
      />
    );
    
    const subValue = screen.getByText('BAN 사용자');
    expect(subValue).toHaveClass('text-red-500');
  });

  it('일반 subValue는 회색 텍스트가 적용된다', () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        subValue="전일 대비 +10"
        icon="/icon/users.svg"
      />
    );
    
    const subValue = screen.getByText('전일 대비 +10');
    expect(subValue).toHaveClass('text-gray-500');
    expect(subValue).not.toHaveClass('text-red-500');
  });

  it('iconBg prop이 적용된다', () => {
    const { container } = render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        icon="/icon/users.svg"
        iconBg="bg-blue-100"
      />
    );
    
    const iconWrapper = container.querySelector('.bg-blue-100');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('아이콘 이미지가 렌더링된다', () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        icon="/icon/users.svg"
      />
    );
    
    const icon = screen.getByAltText('iconImg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/icon/users.svg');
  });

  it('카드 스타일이 올바르게 적용된다', () => {
    const { container } = render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        icon="/icon/users.svg"
      />
    );
    
    const card = container.querySelector('.bg-white.p-6.rounded-2xl.shadow-sm');
    expect(card).toBeInTheDocument();
  });
});
