import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Layout } from "../Layout";

vi.mock("../Footer", () => ({
  Footer: () => <nav data-testid="footer">Footer</nav>,
}));

vi.mock("../Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("@components/auth/AuthStatusModal", () => ({
  AuthStatusModal: () => null,
}));

vi.mock("@hooks", () => ({
  useButtonClickGuard: () => undefined,
}));

const renderLayout = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Layout>
        <main>Page</main>
      </Layout>
    </MemoryRouter>
  );

describe("Layout", () => {
  it("shows the footer on the member reservation list", () => {
    renderLayout("/market/reservations");

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("keeps the footer hidden on focused market flows", () => {
    renderLayout("/market/purchase/1");

    expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
  });
});
