import type { MockProject, WorkingPreference } from "./projects";

export interface ProjectFilters {
  query: string;
  skill: string;
  category: string;
  workingPreference: "all" | Exclude<WorkingPreference, "flexible">;
}

export function getSkillRecommendations(projectList: MockProject[], selectedSkills: string[]) {
  const matches = projectList.filter((project) => project.roles.some((role) => selectedSkills.includes(role)));
  return matches.length ? matches : projectList;
}

export function filterProjects(projectList: MockProject[], filters: ProjectFilters) {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("tr-TR");
  return projectList.filter((project) => {
    const searchableText = [project.name, project.category, project.desc, project.stage, project.proof, project.founder, ...project.roles].join(" ").toLocaleLowerCase("tr-TR");
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesSkill = filters.skill === "Tümü" || project.roles.includes(filters.skill);
    const matchesCategory = filters.category === "Tümü" || project.category === filters.category;
    const matchesPreference = filters.workingPreference === "all" || project.workingPreference === filters.workingPreference;
    return matchesQuery && matchesSkill && matchesCategory && matchesPreference;
  });
}
