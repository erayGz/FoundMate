import { ArrowRight, CheckCircle2, Compass, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectCard } from "../components/app/ProjectCard";
import { ApplicationsSummary } from "../components/applications/ApplicationsSummary";
import { getSkillRecommendations } from "../data/projectLogic";
import { projects } from "../data/projects";
import { useProfile } from "../features/onboarding/ProfileContext";
import { usePageTitle } from "../utils/usePageTitle";

const goalLabels = { "project-owner": "Proje sahibi", contributor: "Katkı sunan", both: "Proje sahibi ve katkı sunan" };

function IntentAction({ goal }: { goal: keyof typeof goalLabels }) {
  const projectButton = (label: string, equal = false) => <Link to="/projects/new" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${equal ? "border border-white/20 bg-white/10 text-white hover:bg-white/15" : "bg-white text-[#373071] hover:bg-[#f2f0ff]"}`}><Plus className="size-4" />{label}</Link>;
  const discoverButton = (equal = false) => <Link to="/discover" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${equal ? "border border-white/20 bg-white/10 text-white hover:bg-white/15" : "border border-white/20 text-white hover:bg-white/10"}`}>Projeleri keşfet <ArrowRight className="size-4" /></Link>;

  return <article className="relative overflow-hidden rounded-3xl bg-[#1d2944] p-6 text-white sm:p-8">
    <Sparkles className="size-5 text-[#b7b2ff]" />
    {goal === "project-owner" && <>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">İlk projenin temel bilgilerini ekle.</h2>
      <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#cbd1de]">Ne üzerinde çalıştığını, ne kadar ilerlediğini ve hangi rollere ihtiyaç duyduğunu görünür kıl.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">{projectButton("Proje oluşturmaya başla")}{discoverButton()}</div>
    </>}
    {goal === "contributor" && <>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">Becerilerine uygun projeleri keşfet.</h2>
      <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#cbd1de]">Profilindeki becerilerle eşleşen ve somut ilerleme gösteren ekiplerle tanış.</p>
      <div className="mt-6 flex">{discoverButton()}</div>
    </>}
    {goal === "both" && <>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">Proje oluşturabilir veya katkı sağlayacağın bir ekip bulabilirsin.</h2>
      <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#cbd1de]">Bugün hangi yönde ilerlemek istediğini seç; profilin her iki seçeneğe de açık kalır.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{projectButton("Proje oluştur", true)}{discoverButton(true)}</div>
    </>}
    <span className="pointer-events-none absolute -bottom-16 -right-12 size-52 rounded-full border-[24px] border-[#4b478c]" />
  </article>;
}

export default function AppHomePage() {
  usePageTitle("Ana sayfa");
  const { profile } = useProfile();
  if (!profile) return null;

  const firstName = profile.name.split(" ")[0];
  const visibleProjects = getSkillRecommendations(projects, profile.skills).slice(0, 3);

  return <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:py-10">
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Foundmate ana sayfa</p>
      <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold tracking-[-0.045em] text-[#17233e]">Merhaba {firstName}, birlikte üretmeye hazır mısın?</h1>
      <p className="mt-3 max-w-[650px] text-sm leading-6 text-[#687184]">Profilindeki becerilere göre somut ilerleme gösteren projelerle başlayabilirsin.</p>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-[1.35fr_.65fr]">
      <IntentAction goal={profile.goal} />
      <article className="rounded-3xl border border-[#e1e2e8] bg-white p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777f91]">Profil özeti</p>
        <dl className="mt-5 space-y-4 text-sm">
          <div><dt className="text-xs text-[#8a91a0]">Niyet</dt><dd className="mt-1 font-semibold text-[#344057]">{goalLabels[profile.goal]}</dd></div>
          <div><dt className="text-xs text-[#8a91a0]">Konum</dt><dd className="mt-1 font-semibold text-[#344057]">{profile.location || "Belirtilmedi"}</dd></div>
          <div><dt className="text-xs text-[#8a91a0]">Uygunluk</dt><dd className="mt-1 font-semibold text-[#344057]">Haftada {profile.availability}</dd></div>
        </dl>
        <Link to="/onboarding?mode=edit" className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#5448d8]">Profili düzenle <ArrowRight className="size-4" /></Link>
      </article>
    </section>

    <ApplicationsSummary goal={profile.goal} />

    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Sana uygun olabilir</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Başlangıç projeleri</h2>
        </div>
        <Link to="/discover" className="hidden items-center gap-1 text-sm font-semibold text-[#5448d8] sm:inline-flex">Tümünü gör <ArrowRight className="size-4" /></Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleProjects.map((project) => <ProjectCard key={project.name} project={project} />)}</div>
    </section>

    <section className="mt-10 grid gap-3 sm:grid-cols-3">
      {[
        { icon: CheckCircle2, title: "Profil tamamlandı", text: "Temel bilgilerin bu cihazda kayıtlı." },
        { icon: Compass, title: "Projeleri incele", text: "Rol ve ilerleme kanıtlarına göz at." },
        { icon: Sparkles, title: "Uyumu değerlendir", text: "Kısa bir deneme sprinti planla." },
      ].map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-[#e2e2e8] bg-[#fdfcf8] p-5">
        <Icon className="size-5 text-[#6259cf]" />
        <h3 className="mt-3 text-sm font-semibold text-[#26334f]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#747e91]">{text}</p>
      </article>)}
    </section>
  </div>;
}
