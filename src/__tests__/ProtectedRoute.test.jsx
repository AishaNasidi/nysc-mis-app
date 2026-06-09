import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

vi.mock("../context/AuthContext");
const { useAuth } = await import("../context/AuthContext");

function renderRoute(authValue, allowedRoles, children = <div>Protected Content</div>) {
  useAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        <Route
          path="/protected"
          element={<ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    renderRoute({ currentUser: null, userProfile: null }, ["admin", "officer"]);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects users with wrong role to /unauthorized", () => {
    renderRoute(
      { currentUser: { uid: "123" }, userProfile: { role: "member" } },
      ["admin", "officer"]
    );
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  it("renders children for users with correct role", () => {
    renderRoute(
      { currentUser: { uid: "123" }, userProfile: { role: "officer" } },
      ["admin", "officer"]
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children for admin accessing admin-only route", () => {
    renderRoute(
      { currentUser: { uid: "123" }, userProfile: { role: "admin" } },
      ["admin"]
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
