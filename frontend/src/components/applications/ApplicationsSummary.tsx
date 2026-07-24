import { ArrowRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { findProjectById } from "../../data/projects";
import { useApplications } from "../../features/applications/ApplicationContext";
import type { CollaborationGoal } from "../../types/profile";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

export function ApplicationsSummary({ goal }: { goal: CollaborationGoal }) {
  const { applications } = useApplications();
  const draftCount = applications.filter((application) => application.status === "draft").length;
  const submittedCount = applications.filter((application) => application.status === "submitted").length;
  const latest = [...applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const latestProject = latest ? findProjectById(latest.projectId) : undefined;

  if (goal === "project-owner" && !applications.length) return <Link to="/applications" className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-[#e1e2e8] bg-white p-4 text-sm font-semibold text-[#5148c7]"><span className="inline-flex items-center gap-2"><ClipboardList className="size-4" />Başvurularım</span><span className="text-xs font-normal text-[#8a91a0]">Henüz kayıt yok <ArrowRight className="ml-1 inline size-3.5" /></span></Link>;

  return <section className="mt-8 rounded-3xl border border-[#e1e2e8] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#675fd0]">Yerel takip</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">Başvurularım</h2></div><Link to="/applications" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[#5148c7]">Tümünü gör <ArrowRight className="size-4" /></Link></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><article className="rounded-2xl bg-[#f5f3ff] p-4"><p className="text-xs text-[#7770a7]">Taslak</p><p className="mt-1 text-2xl font-semibold text-[#443bb8]">{draftCount}</p></article><article className="rounded-2xl bg-[#eef8f1] p-4"><p className="text-xs text-[#5a856b]">Gönderildi</p><p className="mt-1 text-2xl font-semibold text-[#32704c]">{submittedCount}</p></article><article className="rounded-2xl bg-[#f8f8fa] p-4 sm:col-span-1"><p className="text-xs text-[#8a91a0]">Son güncellenen</p>{latest ? <div className="mt-2"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-[#344057]">{latestProject?.name ?? "Proje"}</p><ApplicationStatusBadge status={latest.status} /></div><Link to={`/projects/${latest.projectId}/apply`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#5148c7]">Başvuruyu aç <ArrowRight className="size-3" /></Link></div> : <p className="mt-2 text-sm text-[#8a91a0]">Henüz başvuru yok.</p>}</article></div></section>;
}
