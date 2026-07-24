import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfile } from "./ProfileContext";

export function RequireProfile() {
  const { profile } = useProfile();
  const location = useLocation();

  const returnTo = `${location.pathname}${location.search}`;
  return profile ? <Outlet /> : <Navigate to={`/onboarding?returnTo=${encodeURIComponent(returnTo)}`} replace />;
}
