import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LocationRegister from "../LocationRegister";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UI_TEXT } from "@constant/index";

const mockNavigate = vi.fn();
const mockRegisterGymLocation = vi.fn().mockResolvedValue(undefined);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: "verify" } }),
  };
});

vi.mock("@store/userStore", () => ({
  useUserStore: () => ({
    registerGymLocation: mockRegisterGymLocation,
  }),
}));

const mockGetCurrentPosition = vi.fn();
(global.navigator as unknown as { geolocation: unknown }).geolocation = {
  getCurrentPosition: mockGetCurrentPosition,
};

describe("LocationRegister Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requests the current location on mount", () => {
    render(
      <BrowserRouter>
        <LocationRegister />
      </BrowserRouter>
    );

    expect(mockGetCurrentPosition).toHaveBeenCalled();
  });

  it("registers after a real location has been selected", async () => {
    mockGetCurrentPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: 37.5, longitude: 127.0 } });
    });

    render(
      <BrowserRouter>
        <LocationRegister />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole("button", {
      name: UI_TEXT.REGISTER_BTN,
    });
    fireEvent.click(registerButton);

    expect(screen.getByText(UI_TEXT.LOADING_TITLE)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockRegisterGymLocation).toHaveBeenCalledWith({
      lat: 37.5,
      lng: 127.0,
      address: UI_TEXT.PHRASE_REGISTER_LOC,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/verify");
  });

  it("blocks the default placeholder after geolocation denial", () => {
    mockGetCurrentPosition.mockImplementationOnce((_success, error) => {
      error?.(new Error("denied"));
    });

    render(
      <BrowserRouter>
        <LocationRegister />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole("button", {
      name: UI_TEXT.REGISTER_BTN,
    });

    expect(registerButton).toBeDisabled();
    fireEvent.click(registerButton);
    expect(mockRegisterGymLocation).not.toHaveBeenCalled();
  });
});
