import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../ProtectedRoute";

const authState = vi.hoisted(() => ({
  user: null as null | { role: string },
  isAuthenticated: false,
  accessToken: null as string | null,
}));

vi.mock("@store", () => ({
  useUserStore: vi.fn((selector: (state: typeof authState) => unknown) =>
    selector(authState)
  ),
}));

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={["/trainer"]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/my" element={<div>my page</div>} />
        <Route
          element={
            <ProtectedRoute allowedRoles={["TRAINER"]} redirectTo="/my" />
          }
        >
          <Route path="/trainer" element={<div>trainer page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState.user = null;
    authState.isAuthenticated = false;
    authState.accessToken = null;
  });

  it("does not trust a persisted token when the app is not authenticated", () => {
    authState.accessToken = "leftover-token";

    renderProtectedRoute();

    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("redirects non-trainer users away from trainer routes", () => {
    authState.user = { role: "USER" };
    authState.isAuthenticated = true;
    authState.accessToken = "valid-token";

    renderProtectedRoute();

    expect(screen.getByText("my page")).toBeInTheDocument();
  });

  it("allows trainer users through trainer routes", () => {
    authState.user = { role: "TRAINER" };
    authState.isAuthenticated = true;
    authState.accessToken = "valid-token";

    renderProtectedRoute();

    expect(screen.getByText("trainer page")).toBeInTheDocument();
  });
});
