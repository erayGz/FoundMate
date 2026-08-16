import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createApplication, deleteApplication as deleteApplicationApi, getMyApplications, updateApplication, withdrawApplication as withdrawApplicationApi } from "../../api/applications";
import type { ApplicationFormValues, ProjectApplication } from "../../types/application";
import { fromBackendApplication } from "./applicationMapping";

interface ApplicationContextValue {
  applications: ProjectApplication[];
  loading: boolean;
  refresh: () => Promise<void>;
  getByProject: (projectId: number) => ProjectApplication | undefined;
  saveApplication: (projectId: number, values: ApplicationFormValues, submit: boolean) => Promise<ProjectApplication>;
  withdrawApplication: (applicationId: number) => Promise<void>;
  deleteApplication: (applicationId: number) => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await getMyApplications({ pageSize: 100 });
      setApplications(response.items.map(fromBackendApplication));
    } catch {
      setApplications([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyApplications({ pageSize: 100 })
      .then((response) => {
        if (!cancelled) setApplications(response.items.map(fromBackendApplication));
      })
      .catch(() => {
        if (!cancelled) setApplications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getByProject = (projectId: number) => applications.find((application) => application.projectId === projectId);

  const saveApplication = async (projectId: number, values: ApplicationFormValues, submit: boolean) => {
    const input = {
      selectedRole: values.selectedRole,
      motivation: values.motivation,
      contribution: values.contribution,
      firstSprintProposal: values.firstSprintProposal,
      weeklyAvailability: values.weeklyAvailability,
      commitmentPreference: values.commitmentPreference,
      compensationPreferences: values.compensationPreferences,
      portfolioUrl: values.portfolioUrl,
      status: submit ? "Pending" as const : "Draft" as const,
    };
    const existing = getByProject(projectId);
    const saved = existing
      ? await updateApplication(existing.id, input)
      : await createApplication(projectId, input);
    await refresh();
    return fromBackendApplication(saved);
  };

  const withdrawApplication = async (applicationId: number) => {
    await withdrawApplicationApi(applicationId);
    await refresh();
  };

  const deleteApplication = async (applicationId: number) => {
    await deleteApplicationApi(applicationId);
    await refresh();
  };

  return <ApplicationContext.Provider value={{ applications, loading, refresh, getByProject, saveApplication, withdrawApplication, deleteApplication }}>{children}</ApplicationContext.Provider>;
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) throw new Error("useApplications must be used inside ApplicationProvider");
  return context;
}