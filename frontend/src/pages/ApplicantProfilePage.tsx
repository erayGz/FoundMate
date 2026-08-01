import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { mockApplicants } from "../data/mockApplicants";
import { usePageTitle } from "../utils/usePageTitle";

export default function ApplicantProfilePage() {
  const { applicantId } = useParams();
  const applicant = mockApplicants.find((a) => a.id === applicantId);
  usePageTitle(applicant?.name ?? "Başvuran bulunamadı");

  if (!applicant) {
    return (
      <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
        <Link to="/my-project/applications" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]">
          <ArrowLeft className="size-4" />Başvurulara dön
        </Link>
        <section className="mt-10 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
          <h2 className="text-xl font-semibold text-[#344057]">Başvuran bulunamadı.</h2>
          <p className="mt-2 text-sm text-[#758094]">Bu başvuru kaldırılmış olabilir.</p>
          <Link to="/my-project/applications" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Başvurulara dön</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
      <Link to="/my-project/applications" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]">
        <ArrowLeft className="size-4" />Başvurulara dön
      </Link>

      <header className="mt-5 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_14px_40px_rgba(37,44,72,0.05)] sm:p-9">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className={`inline-flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-bold ${applicant.color}`}>
            {applicant.initials}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.045em] text-[#17233e]">
              {applicant.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {applicant.skills.map((skill) => (
                <span
                  key={skill}
                  className="max-w-full rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2.5 py-1 text-[11px] font-medium text-[#4e576b] [overflow-wrap:anywhere]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Hakkında</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Biyografi</h2>
            <p className="mt-4 text-sm leading-6 text-[#657084] whitespace-pre-wrap [overflow-wrap:anywhere]">{applicant.bio}</p>
          </section>

          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Deneyim</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Profesyonel geçmiş</h2>
            <p className="mt-4 text-sm leading-6 text-[#657084] whitespace-pre-wrap [overflow-wrap:anywhere]">{applicant.experience}</p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-3xl border border-[#e0e0e6] bg-white p-6">
            <h2 className="text-base font-semibold text-[#26334f]">Başvuran bilgileri</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-[#8a91a0]">Uygunluk</dt>
                <dd className="mt-1 font-semibold text-[#344057]">{applicant.availability}</dd>
              </div>
              {applicant.portfolioUrl && (
                <div>
                  <dt className="text-xs text-[#8a91a0]">Portfolyo</dt>
                  <dd className="mt-1">
                    <a
                      href={applicant.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#5148c7] hover:underline"
                    >
                      <span className="truncate max-w-[180px]">{applicant.portfolioUrl}</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <Link
            to="/my-project/applications"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7]"
          >
            <ArrowLeft className="size-4" />Başvurulara dön
          </Link>
        </aside>
      </div>
    </div>
  );
}
