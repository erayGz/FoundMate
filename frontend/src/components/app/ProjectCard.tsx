import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { MockProject } from "../../data/projects";

export function ProjectCard({ project }: { project: MockProject }) {
  const location = useLocation();
  return <article className="flex h-full min-w-0 max-w-full flex-col rounded-2xl border border-[#e1e2e8] bg-white p-5 shadow-[0_5px_16px_rgba(37,44,72,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(37,44,72,0.08)]">
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#757e90] [overflow-wrap:anywhere]">{project.category}</p><h3 className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[#1e2a45] [overflow-wrap:anywhere]">{project.name}</h3></div>
      <span className="shrink-0 rounded-full bg-[#f3f2ff] px-2.5 py-1 text-[10px] font-semibold text-[#5750be]">{project.stage}</span>
    </div>
    <p className="mt-3 text-[13px] leading-5 text-[#636d80] [overflow-wrap:anywhere]">{project.desc}</p>
    <div className="mt-4 min-w-0 rounded-xl bg-[#f8f8fa] px-3 py-2.5 text-[11px] font-medium text-[#4f586b] [overflow-wrap:anywhere]"><ArrowUpRight className="mr-1 inline size-3 text-[#685fd4]" />{project.proof}</div>
    <div className="mt-4 flex min-w-0 flex-wrap gap-1.5">{project.roles.map((role) => <span key={role} className="max-w-full rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2.5 py-1 text-[11px] font-medium text-[#4e576b] [overflow-wrap:anywhere]">{role}</span>)}</div>
    <div className="mt-auto flex min-w-0 items-center gap-2 border-t border-[#ededf1] pt-4 text-[11px] text-[#687184]"><span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full font-semibold ${project.color}`}>{project.person}</span><span className="min-w-0 [overflow-wrap:anywhere]">{project.founder}</span></div>
    <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#747e91]"><span className="inline-flex min-w-0 items-center gap-1"><Clock3 className="size-3 shrink-0" /><span className="[overflow-wrap:anywhere]">{project.time}</span></span><span className="inline-flex min-w-0 items-center gap-1"><MapPin className="size-3 shrink-0" /><span className="[overflow-wrap:anywhere]">{project.location}</span></span></div>
    <Link to={`/projects/${project.id}`} state={{ from: `${location.pathname}${location.search}` }} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8d6ec] bg-[#faf9ff] px-4 text-sm font-semibold text-[#5148c7] transition hover:border-[#aaa5e3] hover:bg-[#f1efff]">Projeyi İncele <ArrowUpRight className="size-4" /></Link>
  </article>;
}
