import { ArrowLeft, ArrowRight, Check, CheckCircle2, Code2, Lightbulb, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { BrandLogo } from "../components/ui/BrandLogo";
import { availableSkills } from "../data/projects";
import { useProfile } from "../features/onboarding/ProfileContext";
import type { CollaborationGoal, ProfileDraft } from "../types/profile";
import { clearProfileDraft, loadProfileDraft, persistProfileDraft } from "../utils/profileStorage";
import { usePageTitle } from "../utils/usePageTitle";

const emptyDraft: ProfileDraft = { name: "", headline: "", bio: "", location: "", goal: "both", skills: [], availability: "" };
const goals: { value: CollaborationGoal; title: string; text: string; icon: typeof Lightbulb }[] = [
  { value: "project-owner", title: "Bir projem var", text: "Projemi görünür kılmak ve doğru katkıları bulmak istiyorum.", icon: Lightbulb },
  { value: "contributor", title: "Katkı sunmak istiyorum", text: "Becerilerime ve ilgime uyan anlamlı bir proje arıyorum.", icon: Code2 },
  { value: "both", title: "İkisine de açığım", text: "Hem projemi paylaşabilir hem de başka ekiplere katkı sunabilirim.", icon: Users },
];

function profileToDraft(profile: NonNullable<ReturnType<typeof useProfile>["profile"]>): ProfileDraft {
  return { name: profile.name, headline: profile.headline, bio: profile.bio, location: profile.location, goal: profile.goal, skills: profile.skills, availability: profile.availability };
}

export default function OnboardingPage() {
  const { profile, saveProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const isCompletedView = Boolean(profile && !isEditMode);
  usePageTitle(isCompletedView ? "Profil tamamlandı" : isEditMode ? "Profili düzenle" : "Profilini oluştur");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(() => profile ? profileToDraft(profile) : loadProfileDraft() ?? emptyDraft);

  useEffect(() => {
    if (!profile && !isEditMode) persistProfileDraft(draft);
  }, [draft, isEditMode, profile]);

  const canContinue = step === 0 || (step === 1 ? Boolean(draft.name.trim() && draft.headline.trim()) : Boolean(draft.skills.length && draft.availability));
  const update = (field: keyof ProfileDraft, value: string | string[]) => setDraft((current) => ({ ...current, [field]: value }));
  const toggleSkill = (skill: string) => update("skills", draft.skills.includes(skill) ? draft.skills.filter((item) => item !== skill) : [...draft.skills, skill]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < 2) { if (canContinue) setStep((current) => current + 1); return; }
    if (!canContinue || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveProfile({ ...draft, name: draft.name.trim(), headline: draft.headline.trim(), bio: draft.bio.trim(), location: draft.location.trim(), completedAt: isEditMode && profile ? profile.completedAt : new Date().toISOString() });
      clearProfileDraft();
      const stateFrom = (location.state as { from?: string } | null)?.from;
      const queryReturn = searchParams.get("returnTo");
      const safeReturn = queryReturn?.startsWith("/") && !queryReturn.startsWith("//") ? queryReturn : stateFrom;
      navigate(safeReturn && safeReturn !== "/onboarding" ? safeReturn : "/app", { replace: true });
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
      setSaving(false);
    }
  };

  if (isCompletedView) {
    return <main className="min-h-screen bg-[#f7f6f2] text-[#17233e]">
      <header className="border-b border-[#e5e4df] bg-[#fdfcf8]"><div className="mx-auto flex h-[72px] max-w-[1040px] items-center justify-between px-5"><BrandLogo /><Link to="/" className="text-sm font-semibold text-[#657084] hover:text-[#5448d8]">Ana sayfaya dön</Link></div></header>
      <section className="mx-auto flex max-w-[620px] flex-col items-center px-5 py-20 text-center sm:py-28">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#e9f5ed] text-[#32704c]"><CheckCircle2 className="size-7" /></span>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Profil tamamlandı</p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,6vw,3.5rem)] font-semibold tracking-[-0.045em]">Foundmate profilin hazır.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#687184]">Adın ve kısa başlığın hesabınla senkronize edildi; diğer bilgilerin bu tarayıcıda güvenle saklanıyor. Devam edebilir veya bilgilerini düzenleme modunda açabilirsin.</p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row"><Link to="/app" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Ana sayfaya dön</Link><Link to="/onboarding?mode=edit" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7d5e8] bg-white px-5 text-sm font-semibold text-[#5148c7]">Profili düzenle</Link></div>
      </section>
    </main>;
  }

  return <main className="min-h-screen bg-[#f7f6f2] text-[#17233e]">
    <header className="border-b border-[#e5e4df] bg-[#fdfcf8]"><div className="mx-auto flex h-[72px] max-w-[1040px] items-center justify-between px-5"><BrandLogo /><Link to={isEditMode ? "/app" : "/"} className="text-sm font-semibold text-[#657084] hover:text-[#5448d8]">{isEditMode ? "Düzenlemeyi iptal et" : "Ana sayfaya dön"}</Link></div></header>
    <div className="mx-auto grid max-w-[1040px] gap-10 px-5 py-10 lg:grid-cols-[280px_1fr] lg:py-16">
      <aside><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">{isEditMode ? "Profili düzenle" : "Profil kurulumu"}</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">{isEditMode ? "Profil bilgilerini güncelle." : "Doğru eşleşmeler için önce seni tanıyalım."}</h1><p className="mt-4 text-sm leading-6 text-[#687184]">Adın ve kısa başlığın hesabınla birlikte sunucuda saklanır; diğer bilgilerin yalnızca bu tarayıcıda tutulur.</p>
        <ol className="mt-8 space-y-3">{["Niyetin", "Kısa profilin", "Becerilerin ve zamanın"].map((label, index) => <li key={label} className={`flex items-center gap-3 text-sm font-semibold ${index <= step ? "text-[#443bb8]" : "text-[#9298a4]"}`}><span className={`inline-flex size-7 items-center justify-center rounded-full text-[11px] ${index < step ? "bg-[#5448d8] text-white" : index === step ? "border-2 border-[#5448d8] bg-white" : "border border-[#d7d8df] bg-transparent"}`}>{index < step ? <Check className="size-3.5" /> : index + 1}</span>{label}</li>)}</ol>
      </aside>

      <form onSubmit={submit} className="rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_18px_50px_rgba(37,44,72,0.06)] sm:p-9">
        {step === 0 && <section><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7169d2]">Adım 1 / 3</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Foundmate’te ne yapmak istiyorsun?</h2><div className="mt-7 grid gap-3">{goals.map(({ value, title, text, icon: Icon }) => <button key={value} type="button" onClick={() => update("goal", value)} className={`flex min-h-[92px] items-start gap-4 rounded-2xl border p-4 text-left transition ${draft.goal === value ? "border-[#7770dc] bg-[#f3f1ff] ring-2 ring-[#7770dc]/15" : "border-[#e1e2e8] hover:border-[#c7c4ec]"}`}><span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${draft.goal === value ? "bg-[#5448d8] text-white" : "bg-[#f3f2f0] text-[#5f6879]"}`}><Icon className="size-5" /></span><span><strong className="block text-sm text-[#26334f]">{title}</strong><span className="mt-1 block text-xs leading-5 text-[#687184]">{text}</span></span></button>)}</div></section>}
        {step === 1 && <section><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7169d2]">Adım 2 / 3</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Kendini kısaca tanıt.</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-[#344057]">Adın soyadın<input value={draft.name} onChange={(event) => update("name", event.target.value)} required autoComplete="name" placeholder="Örn. Deniz Yılmaz" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" /></label><label className="text-sm font-semibold text-[#344057]">Konumun<input value={draft.location} onChange={(event) => update("location", event.target.value)} placeholder="Örn. İstanbul · Uzaktan" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" /></label><label className="text-sm font-semibold text-[#344057] sm:col-span-2">Kısa başlık<input value={draft.headline} onChange={(event) => update("headline", event.target.value)} required placeholder="Örn. Ürün odaklı frontend geliştirici" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" /></label><label className="text-sm font-semibold text-[#344057] sm:col-span-2">Hakkında<textarea value={draft.bio} onChange={(event) => update("bio", event.target.value)} rows={4} placeholder="Neler üretmek istediğini ve nasıl çalışmayı sevdiğini anlat." className="mt-2 block w-full resize-none rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 py-3 text-sm font-normal leading-6 outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" /></label></div></section>}
        {step === 2 && <section><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7169d2]">Adım 3 / 3</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Nerede katkı sunabilirsin?</h2><p className="mt-2 text-sm text-[#687184]">En az bir beceri ve haftalık uygunluk seç.</p><div className="mt-7 flex flex-wrap gap-2">{availableSkills.map((skill) => <button key={skill} type="button" onClick={() => toggleSkill(skill)} aria-pressed={draft.skills.includes(skill)} className={`min-h-10 rounded-xl border px-3.5 text-sm font-semibold transition ${draft.skills.includes(skill) ? "border-[#6259cf] bg-[#eeecff] text-[#4f46bd]" : "border-[#dfe1e7] bg-white text-[#596477] hover:border-[#bbb7e9]"}`}>{draft.skills.includes(skill) && <Check className="mr-1.5 inline size-3.5" />}{skill}</button>)}</div><label className="mt-7 block text-sm font-semibold text-[#344057]">Haftalık ayırabileceğin zaman<select value={draft.availability} onChange={(event) => update("availability", event.target.value)} required className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"><option value="">Seç</option><option>3–5 saat</option><option>6–8 saat</option><option>9–12 saat</option><option>12+ saat</option></select></label></section>}

        <div className="mt-9 flex items-center justify-between border-t border-[#ececf0] pt-6">{step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#596477] hover:bg-[#f6f5f2]"><ArrowLeft className="size-4" />Geri</button> : <span />}<button type="submit" disabled={!canContinue || saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.18)] transition hover:bg-[#463ac8] disabled:cursor-not-allowed disabled:opacity-45">{step === 2 ? isEditMode ? saving ? "Kaydediliyor…" : "Profili kaydet" : saving ? "Kaydediliyor…" : "Profili tamamla" : "Devam et"}<ArrowRight className="size-4" /></button></div>
        {saveError && <div role="alert" className="mt-5 rounded-2xl border border-[#efc9cf] bg-[#fff5f6] p-4 text-sm font-semibold text-[#a52f43]">{saveError}</div>}
      </form>
    </div>
  </main>;
}
