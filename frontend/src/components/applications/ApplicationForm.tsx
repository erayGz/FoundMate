import { AlertTriangle, ArrowRight, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MockProject } from "../../data/projects";
import { commitmentOptions, compensationOptions, weeklyAvailabilityMaxHours, weeklyAvailabilityOptions } from "../../features/applications/applicationOptions";
import { prepareDraftApplicationValues, trimApplicationValues, validateDraftApplication, validateSubmissionApplication, type ApplicationErrors } from "../../features/applications/applicationValidation";
import type { ApplicationFormValues, CompensationPreference, ProjectApplication } from "../../types/application";
import type { FoundmateProfile } from "../../types/profile";

interface ApplicationFormProps {
  project: MockProject;
  profile: FoundmateProfile;
  values: ApplicationFormValues;
  onChange: (values: ApplicationFormValues) => void;
  onSaveDraft: (values: ApplicationFormValues) => ProjectApplication;
  onReview: (values: ApplicationFormValues) => void;
  saveLabel?: string;
  saveMode?: "draft" | "submitted";
}

type SaveFeedbackState = "idle" | "saving" | "saved" | "error";

const fieldClass = "mt-2 block w-full max-w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition [overflow-wrap:anywhere] focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15";
const savedAtFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ApplicationForm({ project, profile, values, onChange, onSaveDraft, onReview, saveLabel = "Taslak olarak kaydet", saveMode = "draft" }: ApplicationFormProps) {
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [errorMode, setErrorMode] = useState<"draft" | "submission">("submission");
  const [saveFeedback, setSaveFeedback] = useState<{ status: SaveFeedbackState; savedAt?: string }>({ status: "idle" });
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const resetSaveFeedbackRef = useRef<number | null>(null);
  const availabilityWarning = weeklyAvailabilityMaxHours[values.weeklyAvailability] < project.minWeeklyHours;
  const isSaving = saveFeedback.status === "saving";
  const saveSuccessText = saveMode === "draft" ? "Taslak kaydedildi." : "Değişiklikler kaydedildi.";
  const saveErrorText = saveMode === "draft" ? "Taslak kaydedilemedi. Tekrar dene." : "Değişiklikler kaydedilemedi. Tekrar dene.";

  useEffect(() => () => {
    if (resetSaveFeedbackRef.current) window.clearTimeout(resetSaveFeedbackRef.current);
  }, []);

  const update = <K extends keyof ApplicationFormValues>(field: K, value: ApplicationFormValues[K]) => {
    onChange({ ...values, [field]: value });
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    if (saveFeedback.status === "error") setSaveFeedback({ status: "idle" });
  };

  const toggleCompensation = (option: CompensationPreference) => {
    update("compensationPreferences", values.compensationPreferences.includes(option)
      ? values.compensationPreferences.filter((item) => item !== option)
      : [...values.compensationPreferences, option]);
  };

  const focusErrors = () => window.requestAnimationFrame(() => errorSummaryRef.current?.focus());

  const review = () => {
    const cleaned = trimApplicationValues(values);
    const nextErrors = validateSubmissionApplication(cleaned);
    setErrorMode("submission");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusErrors();
      return;
    }
    onChange(cleaned);
    onReview(cleaned);
  };

  const save = () => {
    if (isSaving) return;
    if (resetSaveFeedbackRef.current) window.clearTimeout(resetSaveFeedbackRef.current);

    const cleaned = saveMode === "submitted" ? trimApplicationValues(values) : prepareDraftApplicationValues(values);
    const nextErrors = saveMode === "submitted" ? validateSubmissionApplication(cleaned) : validateDraftApplication(cleaned);
    setErrorMode(saveMode === "submitted" ? "submission" : "draft");
    setErrors(nextErrors);
    setSaveFeedback({ status: "idle" });
    if (Object.keys(nextErrors).length) {
      focusErrors();
      return;
    }

    setSaveFeedback({ status: "saving" });
    window.requestAnimationFrame(() => {
      try {
        onChange(cleaned);
        const savedApplication = onSaveDraft(cleaned);
        setSaveFeedback({ status: "saved", savedAt: savedApplication.updatedAt });
        resetSaveFeedbackRef.current = window.setTimeout(() => {
          setSaveFeedback((current) => current.status === "saved" ? { status: "idle", savedAt: current.savedAt } : current);
        }, 2600);
      } catch {
        setSaveFeedback({ status: "error" });
      }
    });
  };

  const saveButtonText = saveFeedback.status === "saving"
    ? "Kaydediliyor…"
    : saveFeedback.status === "saved"
      ? saveMode === "draft" ? "Taslak kaydedildi ✓" : "Değişiklikler kaydedildi ✓"
      : saveLabel;

  return <form noValidate onSubmit={(event) => event.preventDefault()} className="space-y-6">
    {Object.keys(errors).length > 0 && <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="rounded-2xl border border-[#efc9cf] bg-[#fff5f6] p-4 outline-none focus:ring-2 focus:ring-[#d4183d]/25">
      <h2 className="text-sm font-semibold text-[#8b2939]">{errorMode === "draft" ? "Taslak kaydetmek için bağlantı ve seçim alanlarını düzelt." : "Başvurunu gözden geçirmek için eksik alanları düzelt."}</h2>
      <ul className="mt-2 list-inside list-disc text-xs leading-5 text-[#9a4a57]">
        {Object.values(errors).filter(Boolean).map((error) => <li key={error}>{error}</li>)}
      </ul>
    </div>}

    <fieldset aria-describedby={errors.selectedRole ? "selectedRole-error" : undefined} className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <legend className="px-1 text-base font-semibold text-[#26334f]">Hangi role başvuruyorsun?</legend>
      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
        {project.roles.map((role) => {
          const matches = profile.skills.includes(role);
          return <label key={role} className={`flex min-h-[76px] min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${values.selectedRole === role ? "border-[#6d65d4] bg-[#f3f1ff] ring-2 ring-[#6d65d4]/10" : "border-[#e1e2e8] hover:border-[#c8c4ec]"}`}>
            <input type="radio" name="selectedRole" value={role} checked={values.selectedRole === role} onChange={() => update("selectedRole", role)} className="mt-1 size-4 shrink-0 accent-[#5448d8]" />
            <span className="min-w-0">
              <strong className="block text-sm text-[#344057] [overflow-wrap:anywhere]">{role}</strong>
              <span className={`mt-1 block text-[11px] font-semibold ${matches ? "text-[#5750be]" : "text-[#8a91a0]"}`}>{matches ? "Profilinle eşleşiyor" : "Yeni bir alan"}</span>
            </span>
          </label>;
        })}
      </div>
      {errors.selectedRole && <p id="selectedRole-error" className="mt-2 text-xs font-semibold text-[#b7354b]">{errors.selectedRole}</p>}
    </fieldset>

    <div className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <label htmlFor="motivation" className="text-base font-semibold text-[#26334f]">Bu projeyle neden ilgileniyorsun?</label>
      <p id="motivation-help" className="mt-1 text-xs leading-5 text-[#7a8393]">Problem, sektör veya ürün yaklaşımında seni çeken noktayı açıkla.</p>
      <textarea id="motivation" value={values.motivation} onChange={(event) => update("motivation", event.target.value)} maxLength={600} rows={5} aria-invalid={Boolean(errors.motivation)} aria-describedby={`motivation-help motivation-count${errors.motivation ? " motivation-error" : ""}`} className={`${fieldClass} min-h-[132px] resize-y py-3 leading-6`} />
      <div className="mt-2 flex min-w-0 justify-between gap-3">
        {errors.motivation ? <p id="motivation-error" className="min-w-0 text-xs font-semibold text-[#b7354b] [overflow-wrap:anywhere]">{errors.motivation}</p> : <span />}
        <span id="motivation-count" className="shrink-0 text-xs text-[#8a91a0]">{values.motivation.length} / 600</span>
      </div>
    </div>

    <div className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <label htmlFor="contribution" className="text-base font-semibold text-[#26334f]">Projeye nasıl katkı sağlayabilirsin?</label>
      <p id="contribution-help" className="mt-1 text-xs leading-5 text-[#7a8393]">Deneyimini, becerilerini ve ilk haftalarda üstlenebileceğin işleri somutlaştır.</p>
      <textarea id="contribution" value={values.contribution} onChange={(event) => update("contribution", event.target.value)} maxLength={800} rows={6} aria-invalid={Boolean(errors.contribution)} aria-describedby={`contribution-help contribution-count${errors.contribution ? " contribution-error" : ""}`} className={`${fieldClass} min-h-[156px] resize-y py-3 leading-6`} />
      <div className="mt-2 flex min-w-0 justify-between gap-3">
        {errors.contribution ? <p id="contribution-error" className="min-w-0 text-xs font-semibold text-[#b7354b] [overflow-wrap:anywhere]">{errors.contribution}</p> : <span />}
        <span id="contribution-count" className="shrink-0 text-xs text-[#8a91a0]">{values.contribution.length} / 800</span>
      </div>
    </div>

    <div className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <label htmlFor="firstSprintProposal" className="text-base font-semibold text-[#26334f]">İlk deneme sprintinde ne üretmeyi önerirsin?</label>
      <p id="sprint-help" className="mt-1 text-xs leading-5 text-[#7a8393]">7-14 gün içinde tamamlanabilecek küçük ve ölçülebilir bir çıktı yaz.</p>
      <textarea id="firstSprintProposal" value={values.firstSprintProposal} onChange={(event) => update("firstSprintProposal", event.target.value)} maxLength={400} rows={4} aria-invalid={Boolean(errors.firstSprintProposal)} aria-describedby={`sprint-help sprint-count${errors.firstSprintProposal ? " sprint-error" : ""}`} className={`${fieldClass} min-h-[116px] resize-y py-3 leading-6`} />
      <div className="mt-2 flex min-w-0 justify-between gap-3">
        {errors.firstSprintProposal ? <p id="sprint-error" className="min-w-0 text-xs font-semibold text-[#b7354b] [overflow-wrap:anywhere]">{errors.firstSprintProposal}</p> : <span />}
        <span id="sprint-count" className="shrink-0 text-xs text-[#8a91a0]">{values.firstSprintProposal.length} / 400</span>
      </div>
    </div>

    <div className="grid min-w-0 gap-5 rounded-2xl border border-[#e1e2e8] p-5 sm:grid-cols-2">
      <fieldset aria-describedby={`weeklyAvailability-help${errors.weeklyAvailability ? " weeklyAvailability-error" : ""}`} className="min-w-0">
        <legend className="text-base font-semibold text-[#26334f]">Haftalık uygunluğun</legend>
        <p id="weeklyAvailability-help" className="mt-1 text-xs leading-5 text-[#7a8393]">Profilinde: {profile.availability || "Belirtilmedi"}</p>
        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
          {weeklyAvailabilityOptions.map((option) => <label key={option} className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${values.weeklyAvailability === option ? "border-[#6d65d4] bg-[#f3f1ff] text-[#403b70] ring-2 ring-[#6d65d4]/10" : "border-[#e5e5ea] text-[#4f596c] hover:border-[#c8c4ec]"}`}>
            <input type="radio" name="weeklyAvailability" value={option} checked={values.weeklyAvailability === option} onChange={() => update("weeklyAvailability", option)} className="size-4 shrink-0 accent-[#5448d8]" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{option}</span>
          </label>)}
        </div>
        {errors.weeklyAvailability && <p id="weeklyAvailability-error" className="mt-2 text-xs font-semibold text-[#b7354b]">{errors.weeklyAvailability}</p>}
      </fieldset>
      <div className="min-w-0 rounded-xl bg-[#f8f8fa] p-4">
        <p className="text-xs text-[#8a91a0]">Projenin beklentisi</p>
        <p className="mt-1 text-sm font-semibold text-[#344057] [overflow-wrap:anywhere]">{project.time}</p>
        {availabilityWarning && <p role="status" className="mt-3 flex min-w-0 gap-2 text-xs leading-5 text-[#9a6228]"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span className="min-w-0 [overflow-wrap:anywhere]">Seçtiğin süre proje beklentisinin altında. Yine de başvurabilirsin; çalışma kapsamını birlikte netleştirin.</span></p>}
      </div>
    </div>

    <fieldset aria-describedby={errors.commitmentPreference ? "commitment-error" : undefined} className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <legend className="px-1 text-base font-semibold text-[#26334f]">Bağlılık tercihin</legend>
      <div className="mt-3 space-y-2">
        {commitmentOptions.map((option) => <label key={option.value} className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-[#e5e5ea] px-3.5 text-sm text-[#4f596c] hover:border-[#c8c4ec]">
          <input type="radio" name="commitmentPreference" value={option.value} checked={values.commitmentPreference === option.value} onChange={() => update("commitmentPreference", option.value)} className="size-4 shrink-0 accent-[#5448d8]" />
          <span className="min-w-0 [overflow-wrap:anywhere]">{option.label}</span>
        </label>)}
      </div>
      {errors.commitmentPreference && <p id="commitment-error" className="mt-2 text-xs font-semibold text-[#b7354b]">{errors.commitmentPreference}</p>}
    </fieldset>

    <fieldset aria-describedby={`compensation-note${errors.compensationPreferences ? " compensation-error" : ""}`} className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <legend className="px-1 text-base font-semibold text-[#26334f]">Katkı modeli tercihlerin</legend>
      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
        {compensationOptions.map((option) => <label key={option.value} className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-[#e5e5ea] px-3.5 text-sm text-[#4f596c] hover:border-[#c8c4ec]">
          <input type="checkbox" checked={values.compensationPreferences.includes(option.value)} onChange={() => toggleCompensation(option.value)} className="size-4 shrink-0 rounded accent-[#5448d8]" />
          <span className="min-w-0 [overflow-wrap:anywhere]">{option.label}</span>
        </label>)}
      </div>
      {errors.compensationPreferences && <p id="compensation-error" className="mt-2 text-xs font-semibold text-[#b7354b]">{errors.compensationPreferences}</p>}
      <p id="compensation-note" className="mt-3 text-xs leading-5 text-[#7a8393]">Bu seçim bir anlaşma oluşturmaz. Koşullar taraflar arasında ayrıca netleştirilmelidir.</p>
    </fieldset>

    <div className="min-w-0 rounded-2xl border border-[#e1e2e8] p-5">
      <label htmlFor="portfolioUrl" className="text-base font-semibold text-[#26334f]">Portfolyo veya çalışma bağlantısı</label>
      <p id="portfolio-help" className="mt-1 text-xs leading-5 text-[#7a8393]">GitHub, LinkedIn, kişisel site, Behance, Dribbble veya başka bir HTTP/HTTPS bağlantısı. İsteğe bağlıdır.</p>
      <input id="portfolioUrl" type="url" inputMode="url" value={values.portfolioUrl} onChange={(event) => update("portfolioUrl", event.target.value)} placeholder="https://" aria-invalid={Boolean(errors.portfolioUrl)} aria-describedby={`portfolio-help${errors.portfolioUrl ? " portfolio-error" : ""}`} className={`${fieldClass} min-h-11`} />
      {errors.portfolioUrl && <p id="portfolio-error" className="mt-2 text-xs font-semibold text-[#b7354b] [overflow-wrap:anywhere]">{errors.portfolioUrl}</p>}
    </div>

    <div className="flex min-w-0 flex-col gap-4 border-t border-[#e6e6eb] pt-6 sm:flex-row sm:items-start sm:justify-between">
      <button type="button" onClick={review} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.16)] outline-none motion-safe:transition hover:bg-[#463ac8] focus-visible:ring-2 focus-visible:ring-[#7068d8]/35 focus-visible:ring-offset-2 active:shadow-none motion-safe:active:translate-y-px motion-safe:active:scale-[0.99] sm:order-2 sm:w-auto">Başvuruyu gözden geçir <ArrowRight className="size-4 shrink-0" /></button>
      <div className="min-w-0 sm:order-1">
        <button type="button" onClick={save} disabled={isSaving} aria-describedby="draft-save-feedback" className="inline-flex min-h-11 w-full min-w-[13.75rem] items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7] shadow-[0_5px_14px_rgba(84,72,216,0.06)] outline-none motion-safe:transition hover:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-[#7068d8]/30 focus-visible:ring-offset-2 active:shadow-none disabled:cursor-wait disabled:border-[#e0deea] disabled:bg-[#f6f5fa] disabled:text-[#8d88b9] motion-safe:active:translate-y-px motion-safe:active:scale-[0.99] sm:w-auto"><Save className="size-4 shrink-0" />{saveButtonText}</button>
        <div id="draft-save-feedback" aria-live="polite" className="mt-2 min-h-[2.25rem] text-xs leading-5">
          {saveFeedback.status === "saved" && <p className="font-semibold text-[#315f45]">{saveSuccessText}{saveFeedback.savedAt && <span className="block font-normal text-[#5f7469]">Son kayıt: {savedAtFormatter.format(new Date(saveFeedback.savedAt))}</span>}</p>}
          {saveFeedback.status === "error" && <p className="font-semibold text-[#9a3346]">{saveErrorText}</p>}
          {saveFeedback.status === "saving" && <p className="font-semibold text-[#6c6890]">Kaydediliyor…</p>}
        </div>
      </div>
    </div>
  </form>;
}
