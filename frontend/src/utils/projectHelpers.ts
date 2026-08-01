import type { MockProject } from "../data/projects";
import type { FoundmateProfile } from "../types/profile";
import type { ProjectDraft, ProjectDraftStage, RequiredRole } from "../types/projectDraft";

export const stageLabels: Record<ProjectDraftStage, string> = {
  "idea": "Fikir aşaması",
  "research": "Araştırma",
  "prototype": "Prototip",
  "early-users": "İlk kullanıcılar",
  "first-version": "İlk sürüm",
};

export const roleTitleOptions = [
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Mobile Developer",
  "AI / ML Engineer",
  "Marketing",
  "Product Designer",
  "DevOps Engineer",
  "Data Scientist",
  "Growth Lead",
  "DevRel",
  "B2B Sales",
];

export const roleSkillOptions = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Figma",
  "Tailwind",
  "Docker",
  "Swift",
  "Kotlin",
  "Flutter",
  "TensorFlow",
  "SEO",
  "Product Strategy",
  "Kullanıcı Araştırması",
  "Prototipleme",
  "A/B Testing",
  "API Design",
  "AWS",
];

export function draftToMockProject(
  draft: ProjectDraft,
  roles: RequiredRole[],
  profile: FoundmateProfile | null,
): MockProject {
  const initials = profile
    ? profile.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toLocaleUpperCase("tr-TR")
    : "FM";
  const colors = [
    "bg-[#e6e2ff] text-[#4d43c2]",
    "bg-[#ffe9dd] text-[#bd6034]",
    "bg-[#e4e4ff] text-[#5348c1]",
    "bg-[#e1f1e5] text-[#36704c]",
    "bg-[#e2eefc] text-[#32658f]",
  ];

  return {
    id: "my-published-project",
    name: draft.name,
    category: draft.category,
    stage: stageLabels[draft.stage],
    desc: draft.shortDescription,
    roles: roles.map((r) => r.title),
    person: initials,
    founder: profile?.name ?? "Ben",
    color: colors[Math.floor(Math.random() * colors.length)],
    proof: draft.successMetric,
    progress: {
      completed: [],
      currentFocus: draft.plannedFirstSprint,
      nextMilestone: draft.successMetric,
    },
    time: "Esnek",
    minWeeklyHours: 0,
    maxWeeklyHours: 40,
    location: "Yerel",
    workingPreference: "remote",
    trialSprintAvailable: true,
    trialSprintTask: draft.plannedFirstSprint,
    compensationModel: "open-to-discussion",
  };
}
