import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { ApplicationProvider } from "./features/applications/ApplicationContext";
import { AuthProvider } from "./features/auth/AuthContext";
import { RequireAuth } from "./features/auth/RequireAuth";
import { ProfileProvider } from "./features/onboarding/ProfileContext";
import { RequireProfile } from "./features/onboarding/RequireProfile";
import AppHomePage from "./pages/AppHomePage";
import ApplicationsPage from "./pages/ApplicationsPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import DiscoverPage from "./pages/DiscoverPage";
import IncomingApplicationsPage from "./pages/IncomingApplicationsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MyProjectPage from "./pages/MyProjectPage";
import NotFoundPage from "./pages/NotFoundPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProjectApplicationPage from "./pages/ProjectApplicationPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return <BrowserRouter>
    <AuthProvider>
      <ProfileProvider>
        <ApplicationProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>
            <Route element={<AppShell />}>
              <Route element={<RequireAuth />}>
                <Route path="/my-project" element={<MyProjectPage />} />
                <Route path="/projects/new" element={<CreateProjectPage />} />
                <Route path="/projects/:projectId/edit" element={<CreateProjectPage />} />
              </Route>
              <Route path="/my-project/applications" element={<IncomingApplicationsPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/projects/:projectId/apply" element={<ProjectApplicationPage />} />
              <Route element={<RequireAuth />}>
                <Route element={<RequireProfile />}>
                  <Route path="/app" element={<AppHomePage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/applications" element={<ApplicationsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ApplicationProvider>
      </ProfileProvider>
    </AuthProvider>
  </BrowserRouter>;
}
