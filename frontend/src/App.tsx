import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { ApplicationProvider } from "./features/applications/ApplicationContext";
import { ProfileProvider } from "./features/onboarding/ProfileContext";
import { RequireProfile } from "./features/onboarding/RequireProfile";
import AppHomePage from "./pages/AppHomePage";
import ApplicationsPage from "./pages/ApplicationsPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import DiscoverPage from "./pages/DiscoverPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProjectApplicationPage from "./pages/ProjectApplicationPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

export default function App() {
  return <BrowserRouter>
    <ProfileProvider>
      <ApplicationProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppShell />}>
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projects/:projectId/apply" element={<ProjectApplicationPage />} />
            <Route element={<RequireProfile />}>
              <Route path="/app" element={<AppHomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ApplicationProvider>
    </ProfileProvider>
  </BrowserRouter>;
}
