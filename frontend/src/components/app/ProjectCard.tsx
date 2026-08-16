import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { Project } from "../../api/projects";

export function ProjectCard({ project }: { project: Project }) {
  const location = useLocation();
  return <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#e1e2e8] bg-white p-5 shadow-[0_5px_16px_rgba(37,44,72,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(37,44,72,0.08)]">
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#757e90] [overflow-wrap:anywhere]">{project.category || "Kategorisiz"}</p>
      <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[#1e2a45] [overflow-wrap:anywhere]">{project.title}</h3>
    </div>
    <p className="mt-3 text-[13px] leading-5 text-[#636d80] [overflow-wrap:anywhere]">{project.description}</p>
    <div className="mt-auto pt-5">
      <Link to={`/projects/${project.id}`} state={{ from: `${location.pathname}${location.search}` }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d8d6ec] bg-[#faf9ff] px-4 text-sm font-semibold text-[#5148c7] transition hover:border-[#aaa5e3] hover:bg-[#f1efff]">Projeyi İncele <ArrowUpRight className="size-4" /></Link>
    </div>
  </article>;
}