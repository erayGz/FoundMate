import { createContext, useContext, useState, type ReactNode } from "react";
import type { ApplicationFormValues, ProjectApplication } from "../../types/application";
import { createApplicationId, loadApplications, persistApplications } from "../../utils/applicationStorage";
import { upsertProjectApplication, withdrawProjectApplication } from "./applicationLogic";
import { useProfile } from "../onboarding/ProfileContext";

interface ApplicationContextValue {
  applications: ProjectApplication[];
  getByProject: (projectId: string) => ProjectApplication | undefined;
  saveApplication: (projectId: string, values: ApplicationFormValues, submit: boolean) => ProjectApplication;
  withdrawApplication: (applicationId: string) => void;
  deleteApplication: (applicationId: string) => void;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const [storedApplications, setStoredApplications] = useState<ProjectApplication[]>(() => loadApplications());
  const applications = profile ? storedApplications.filter((application) => application.applicantProfileCreatedAt === profile.completedAt) : [];

  const commit = (next: ProjectApplication[]) => {
    persistApplications(next);
    setStoredApplications(next);
  };

  const getByProject = (projectId: string) => applications.find((application) => application.projectId === projectId);

  const saveApplication = (projectId: string, values: ApplicationFormValues, submit: boolean) => {
    if (!profile) throw new Error("A completed profile is required to save an application");
    const now = new Date().toISOString();
    const { application, applications: next } = upsertProjectApplication({ storedApplications, applicantProfileCreatedAt: profile.completedAt, projectId, values, submit, now, createId: createApplicationId });
    commit(next);
    return application;
  };

  const withdrawApplication = (applicationId: string) => {
    const now = new Date().toISOString();
    commit(withdrawProjectApplication(storedApplications, applicationId, now));
  };

  const deleteApplication = (applicationId: string) => {
    commit(storedApplications.filter((application) => application.id !== applicationId));
  };

  return <ApplicationContext.Provider value={{ applications, getByProject, saveApplication, withdrawApplication, deleteApplication }}>{children}</ApplicationContext.Provider>;
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error("useApplications must be used inside ApplicationProvider");
  return context;
}
