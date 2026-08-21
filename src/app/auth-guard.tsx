import type { ReactElement, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";
import { Spinner } from "../shared/components/Spinner";

/** Redirects to /login, preserving the intended destination, when there is no session (DEVELOPMENT_STAGES.md Stage 2: "Protected routes reject unauthenticated requests"). */
export function ProtectedRoute({ children }: { children: ReactNode }): ReactElement {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <Spinner label="Checking your session" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
