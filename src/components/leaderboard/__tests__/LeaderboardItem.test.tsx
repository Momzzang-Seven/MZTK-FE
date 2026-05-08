import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaderboardItem from "../LeaderboardItem";
import type { LeaderboardUser } from "@types";

describe("LeaderboardItem", () => {
  const mockUser: LeaderboardUser = {
    userId: 1,
    rank: 1,
    nickname: "테스트유저",
    level: 10,
    lifetimeXp: 5000,
    profileImageUrl: null,
  };

  it("기본 정보가 렌더링된다", () => {
    render(<LeaderboardItem user={mockUser} />);

    expect(screen.getByText("🥇")).toBeInTheDocument();
    expect(screen.getByText("테스트유저")).toBeInTheDocument();
    expect(screen.getByText("Lv.10 · 5,000 XP")).toBeInTheDocument();
  });

  it("isMe=false일 때 기본 스타일이 적용된다", () => {
    const { container } = render(
      <LeaderboardItem user={mockUser} isMe={false} />
    );

    const wrapper = container.querySelector(".flex.items-center.gap-3");
    expect(wrapper).not.toHaveClass("bg-main");
  });

  it("isMe=true일 때 하이라이트 스타일이 적용된다", () => {
    const { container } = render(
      <LeaderboardItem user={mockUser} isMe={true} />
    );

    const wrapper = container.querySelector(".bg-main");
    expect(wrapper).toBeInTheDocument();
  });

  it("프로필 원이 렌더링된다", () => {
    const { container } = render(<LeaderboardItem user={mockUser} />);

    const profileCircle = container.querySelector(".w-10.h-10.rounded-full");
    expect(profileCircle).toBeInTheDocument();
  });

  it("랭킹 번호가 표시된다", () => {
    render(<LeaderboardItem user={mockUser} />);

    // rank=1은 메달 이모지로 표시됨
    expect(screen.getByText("🥇")).toBeInTheDocument();
  });

  it("레벨 및 XP 정보가 표시된다", () => {
    render(<LeaderboardItem user={mockUser} />);

    expect(screen.getByText(/Lv.10/)).toBeInTheDocument();
    expect(screen.getByText(/5,000 XP/)).toBeInTheDocument();
  });

  it("isMe에 따라 텍스트 색상이 변경된다", () => {
    const { container: container1 } = render(
      <LeaderboardItem user={mockUser} isMe={false} />
    );
    const { container: container2 } = render(
      <LeaderboardItem user={mockUser} isMe={true} />
    );

    // nickname span은 font-bold + truncate로 특정
    const nickname1 = container1.querySelector(".font-bold.truncate");
    const nickname2 = container2.querySelector(".font-bold.truncate");

    expect(nickname1).toHaveClass("text-gray-800");
    expect(nickname2).toHaveClass("text-white");
  });

  it("isMe에 따라 프로필 원 색상이 변경된다", () => {
    const { container: container1 } = render(
      <LeaderboardItem user={mockUser} isMe={false} />
    );
    const { container: container2 } = render(
      <LeaderboardItem user={mockUser} isMe={true} />
    );

    const circle1 = container1.querySelector(".w-10.h-10.rounded-full");
    const circle2 = container2.querySelector(".w-10.h-10.rounded-full");

    expect(circle1).not.toHaveClass("bg-white");
    expect(circle2).toHaveClass("bg-main/20");
  });
});
