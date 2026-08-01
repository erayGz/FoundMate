import { ArrowLeft, ArrowRight, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { IncomingApplicationCard } from "../components/app/IncomingApplicationCard";
import { mockIncomingApplications } from "../data/mockApplicants";
import type { IncomingApplication } from "../types/projectDraft";
import { usePageTitle } from "../utils/usePageTitle";

export default function IncomingApplicationsPage() {
  usePageTitle("Gelen başvurular");
  const [applications, setApplications] = useState<IncomingApplication[]>(mockIncomingApplications);

  const updateStatus = (id: string, status: "accepted" | "rejected") => {
    setApplications((current) =>
      current.map((app) => (app.id === id ? { ...app, status } : app)),
    );
  };

  const pendingCount = applications.filter((app) => app.status === "pending").length;

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8 sm:px-8 lg:py-10">
      <Link to="/my-project" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]">
        <ArrowLeft className="size-4" />Projeme dön
      </Link>

      <header className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Yerel başvuru kayıtları</p>
        <h1 className="mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-semibold tracking-[-0.045em] text-[#17233e]">
          Gelen başvurular
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">
          Bu başvurular örnek veridir. Gerçek bir bildirim gönderilmez.
        </p>
      </header>

      {pendingCount > 0 && (
        <div className="mt-6 rounded-2xl bg-[#fef6e6] px-4 py-3 text-sm font-semibold text-[#9a6d1a]">
          {pendingCount} bekleyen başvuru
        </div>
      )}

      {applications.length > 0 ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {applications.map((application) => (
            <IncomingApplicationCard
              key={application.id}
              application={application}
              onAccept={() => updateStatus(application.id, "accepted")}
              onReject={() => updateStatus(application.id, "rejected")}
            />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]">
            <UsersRound className="size-5" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#344057]">Henüz başvuru yok.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#758094]">
            Projeni yayınladıktan sonra başvurular burada görünecek.
          </p>
          <Link to="/my-project" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">
            Projeme dön <ArrowRight className="size-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
