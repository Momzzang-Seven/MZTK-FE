import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users, Ban } from "lucide-react";
import SummaryCard from "../SummaryCard";

describe("SummaryCard", () => {
  it("기본 정보가 렌더링된다", () => {
    render(<SummaryCard title="총 사용자" value={1234} icon={Users} />);

    expect(screen.getByText("총 사용자")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("문자열 value도 렌더링된다", () => {
    render(<SummaryCard title="상태" value="활성" icon={Users} />);

    expect(screen.getByText("활성")).toBeInTheDocument();
  });

  it("subValue가 있을 때 표시된다", () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        subValue="전일 대비 +10"
        icon={Users}
      />
    );

    expect(screen.getByText("전일 대비 +10")).toBeInTheDocument();
  });

  it("subValue가 없을 때 렌더링되지 않는다", () => {
    render(<SummaryCard title="총 사용자" value={1234} icon={Users} />);

    const subValueElement = screen.queryByText(/전일 대비/);
    expect(subValueElement).not.toBeInTheDocument();
  });

  it("BAN 포함 시 빨간색 텍스트가 적용된다", () => {
    render(
      <SummaryCard
        title="정지된 사용자"
        value={5}
        subValue="BAN 사용자"
        icon={Ban}
      />
    );

    const subValue = screen.getByText("BAN 사용자");
    expect(subValue).toHaveClass("text-red-500");
  });

  it("일반 subValue는 회색 텍스트가 적용된다", () => {
    render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        subValue="전일 대비 +10"
        icon={Users}
      />
    );

    const subValue = screen.getByText("전일 대비 +10");
    expect(subValue).toHaveClass("text-gray-400");
    expect(subValue).not.toHaveClass("text-red-500");
  });

  it("variant prop이 적용된다", () => {
    const { container } = render(
      <SummaryCard
        title="총 사용자"
        value={1234}
        icon={Users}
        variant="amber"
      />
    );

    // amber variant는 bg-main/10 클래스를 가진 아이콘 래퍼를 가짐
    const iconWrapper = container.querySelector(".bg-main\\/10");
    expect(iconWrapper).toBeInTheDocument();
  });

  it("아이콘 컴포넌트가 렌더링된다", () => {
    const { container } = render(
      <SummaryCard title="총 사용자" value={1234} icon={Users} />
    );

    // Lucide 아이콘은 SVG로 렌더링됨
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("카드 기본 스타일이 적용된다", () => {
    const { container } = render(
      <SummaryCard title="총 사용자" value={1234} icon={Users} />
    );

    const card = container.querySelector(".bg-white");
    expect(card).toBeInTheDocument();
  });
});
