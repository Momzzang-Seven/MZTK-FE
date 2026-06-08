import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LevelReward } from "../LevelReward";
import { useUserStore } from "@store/userStore";

describe("LevelReward", () => {
  beforeEach(() => {
    useUserStore.getState().reset();
  });

  it("shows the next level reward returned from the level state", () => {
    useUserStore.setState({
      level: 5,
      rewardMztkForNext: 40,
    });

    render(<LevelReward />);

    expect(screen.getByText("+40 MZTK")).toBeInTheDocument();
  });
});
