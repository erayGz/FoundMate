import { ArrowLeft, Check, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ProjectDraft, ProjectDraftFormValues, ProjectDraftStage } from "../types/projectDraft";
import { useProfile } from "../features/onboarding/ProfileContext";
import { clearProjectDraft, emptyProjectDraftValues, loadProjectDraft, saveProjectDraft } from "../utils/projectDraftStorage";
import { usePageTitle } from "../utils/usePageTitle";

type SaveState = "idle" | "saving" | "saved" | "error";
type DraftErrors = Partial<Record<keyof ProjectDraftFormValues, string>>;

const stageOptions: { value: ProjectDraftStage; label: string; description: string }[] = [
  { value: "idea", label: "Fikir aşaması", description: "Problem ve yön henüz netleşiyor." },
  { value: "research", label: "Araştırma", description: "Kullanıcı, pazar veya teknik keşif yapılıyor." },
  { value: "prototype", label: "Prototip", description: "İlk denenebilir sürüm hazırlanıyor." },
  { value: "early-users", label: "İlk kullanıcılar", description: "Erken geri bildirim toplanıyor." },
  { value: "first-version", label: "İlk sürüm", description: "Kullanıma açık ilk ürün şekilleniyor." },
];

const categoryOptions = [
  ["Education", "Eğitim"],
  ["Health", "Sağlık"],
  ["Sports Technology", "Spor teknolojisi"],
  ["Fintech", "Fintech"],
  ["Sustainability", "Sürdürülebilirlik"],
  ["Developer Tools", "Geliştirici araçları"],
  ["Productivity", "Üretkenlik"],
  ["E-commerce", "E-ticaret"],
  ["Gaming", "Oyun"],
  ["Social Impact", "Sosyal etki"],
  ["B2B SaaS", "B2B SaaS"],
  ["Consumer Apps", "Tüketici uygulamaları"],
  ["Other", "Diğer"],
] as const;

const sectionCardClass = "min-w-0 rounded-2xl border border-[#e1e2e8] p-5";
const labelClass = "text-base font-semibold text-[#26334f]";
const helpClass = "mt-1 text-xs leading-5 text-[#7a8393]";
const fieldClass = "mt-2 block w-full max-w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition [overflow-wrap:anywhere] focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15";
const textareaClass = `${fieldClass} h-[116px] resize-none overflow-y-auto break-words py-3 leading-6`;
const problemTextareaClass = `${fieldClass} h-56 resize-none overflow-y-auto break-words py-3 leading-6`;
const errorClass = "min-w-0 text-xs font-semibold text-[#b7354b] [overflow-wrap:anywhere]";
const counterClass = "shrink-0 text-xs text-[#8a91a0]";
const savedAtFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function FieldFooter({
  count,
  countId,
  error,
  errorId,
  max,
}: {
  count: number;
  countId: string;
  error?: string;
  errorId: string;
  max: number;
}) {
  return (
    <div className="mt-2 flex min-w-0 justify-between gap-3">
      {error ? <p id={errorId} className={errorClass}>{error}</p> : <span aria-hidden="true" />}
      <span id={countId} className={counterClass}>{count} / {max}</span>
    </div>
  );
}

function valuesFromDraft(draft: ProjectDraft | null): ProjectDraftFormValues {
  return draft ? {
    name: draft.name,
    shortDescription: draft.shortDescription,
    problemDescription: draft.problemDescription,
    targetUsers: draft.targetUsers,
    currentSolution: draft.currentSolution,
    insufficientSolutions: draft.insufficientSolutions,
    successMetric: draft.successMetric,
    plannedFirstSprint: draft.plannedFirstSprint,
    category: draft.category,
    stage: draft.stage,
  } : emptyProjectDraftValues;
}

function validateTextLength(
  value: string,
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string,
) {
  const length = value.trim().length;
  if (length < min) return minMessage;
  if (length > max) return maxMessage;
  return undefined;
}

function validateProjectDraft(
  values: ProjectDraftFormValues,
): DraftErrors {
  const errors: DraftErrors = {};

  errors.name = validateTextLength(
    values.name,
    3,
    60,
    "Proje adı en az 3 karakter olmalı.",
    "Proje adı en fazla 60 karakter olabilir.",
  );

  errors.shortDescription = validateTextLength(
    values.shortDescription,
    30,
    180,
    "Kısa açıklama en az 30 karakter olmalı.",
    "Kısa açıklama en fazla 180 karakter olabilir.",
  );

  errors.problemDescription = validateTextLength(
    values.problemDescription,
    80,
    1000,
    "Problem açıklaması en az 80 karakter olmalı.",
    "Problem açıklaması en fazla 1000 karakter olabilir.",
  );

  errors.targetUsers = validateTextLength(
    values.targetUsers,
    20,
    300,
    "Hedef kullanıcı tanımı en az 20 karakter olmalı.",
    "Hedef kullanıcı tanımı en fazla 300 karakter olabilir.",
  );

  errors.currentSolution = validateTextLength(
    values.currentSolution,
    30,
    400,
    "Mevcut çözüm açıklaması en az 30 karakter olmalı.",
    "Mevcut çözüm açıklaması en fazla 400 karakter olabilir.",
  );

  errors.insufficientSolutions = validateTextLength(
    values.insufficientSolutions,
    40,
    600,
    "Yetersizlik açıklaması en az 40 karakter olmalı.",
    "Yetersizlik açıklaması en fazla 600 karakter olabilir.",
  );

  errors.successMetric = validateTextLength(
    values.successMetric,
    15,
    200,
    "Başarı metriği en az 15 karakter olmalı.",
    "Başarı metriği en fazla 200 karakter olabilir.",
  );

  errors.plannedFirstSprint = validateTextLength(
    values.plannedFirstSprint,
    30,
    400,
    "İlk sprint planı en az 30 karakter olmalı.",
    "İlk sprint planı en fazla 400 karakter olabilir.",
  );

  if (!values.category.trim()) {
    errors.category = "Bir kategori seçmelisin.";
  }

  if (
    !stageOptions.some(
      (option) => option.value === values.stage,
    )
  ) {
    errors.stage = "Bir aşama seçmelisin.";
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as DraftErrors;
}

export default function CreateProjectPage() {
  usePageTitle("Proje taslağı oluştur");
  const { profile } = useProfile();
  const [storedDraft, setStoredDraft] = useState<ProjectDraft | null>(() => loadProjectDraft());
  const [values, setValues] = useState<ProjectDraftFormValues>(() => valuesFromDraft(loadProjectDraft()));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string>(() => loadProjectDraft()?.updatedAt ?? "");
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const resetSaveStateRef = useRef<number | null>(null);
  const isSaving = saveState === "saving";

  useEffect(() => () => {
    if (resetSaveStateRef.current) window.clearTimeout(resetSaveStateRef.current);
  }, []);

  if (!profile) return <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]"><Save className="size-6" /></span>
    <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.045em] text-[#17233e]">Proje taslağı için profilini tamamla.</h1>
    <p className="mt-3 text-sm leading-6 text-[#687184]">Proje oluşturma akışı, proje inşa etmek veya yönetmek isteyen tamamlanmış yerel profiller için hazırlanıyor.</p>
    <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      <Link to={`/onboarding?returnTo=${encodeURIComponent("/projects/new")}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Profilini tamamla</Link>
      <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7]">Landing sayfasına dön</Link>
    </div>
  </section>;

  const update = <K extends keyof ProjectDraftFormValues>(field: K, value: ProjectDraftFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    if (saveState === "error") setSaveState("idle");
  };

  const save = () => {
    if (isSaving) return;
    if (resetSaveStateRef.current) window.clearTimeout(resetSaveStateRef.current);
    const nextErrors = validateProjectDraft(values);
    setErrors(nextErrors);
    setSaveState("idle");
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSaveState("saving");
    window.requestAnimationFrame(() => {
      try {
        const savedDraft = saveProjectDraft(values, storedDraft);
        setStoredDraft(savedDraft);
        setValues(valuesFromDraft(savedDraft));
        setLastSavedAt(savedDraft.updatedAt);
        setSaveState("saved");
        resetSaveStateRef.current = window.setTimeout(() => {
          setSaveState((current) => current === "saved" ? "idle" : current);
        }, 2600);
      } catch {
        setSaveState("error");
      }
    });
  };

  const clear = () => {
    if (!window.confirm("Bu proje taslağını temizlemek istediğinden emin misin?")) return;
    clearProjectDraft();
    setStoredDraft(null);
    setValues(emptyProjectDraftValues);
    setErrors({});
    setLastSavedAt("");
    setSaveState("idle");
  };

  const saveButtonText = saveState === "saving" ? "Kaydediliyor…" : saveState === "saved" ? "Taslak kaydedildi ✓" : "Taslağı kaydet";

  return <div className="mx-auto w-full max-w-[950px] px-5 py-8 sm:px-8 lg:py-12">
    <Link to="/app" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />Ana sayfaya dön</Link>
    <header className="mt-5 min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Yerel proje taslağı</p>
      <h1 className="mt-2 font-display text-[clamp(2.35rem,6vw,3.8rem)] font-semibold tracking-[-0.045em] text-[#17233e]">İlk projenin temelini oluştur.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">Ne üzerinde çalıştığını birkaç temel bilgiyle tanımla. Bu aşamada proje yalnızca bu tarayıcıda taslak olarak saklanır.</p>
      {profile.goal === "contributor" && <p className="mt-4 rounded-2xl border border-[#ddd9f4] bg-[#f5f3ff] px-4 py-3 text-sm leading-6 text-[#514b7e]">Bu alan proje inşa etmek veya yönetmek isteyen üyeler için hazırlanıyor. Profil niyetin katkı sunmak olsa da bu taslağı deneyebilir ve sonra profilini güncelleyebilirsin.</p>}
    </header>

    <form noValidate onSubmit={(event) => event.preventDefault()} className="mt-7 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 shadow-[0_14px_40px_rgba(37,44,72,0.04)] sm:p-8">
      {Object.keys(errors).length > 0 && <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-2xl border border-[#efc9cf] bg-[#fff5f6] p-4 outline-none focus:ring-2 focus:ring-[#d4183d]/25">
        <h2 className="text-sm font-semibold text-[#8b2939]">Taslağı kaydetmek için eksik alanları düzelt.</h2>
        <ul className="mt-2 list-inside list-disc text-xs leading-5 text-[#9a4a57]">{Object.values(errors).filter(Boolean).map((error) => <li key={error}>{error}</li>)}</ul>
      </div>}

      <div className="space-y-10">
        <div className="border-b border-[#e6e6eb] pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Adım 1 / 2</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#26334f]">Temel bilgiler</h2>
          <p className="mt-2 text-sm leading-6 text-[#687184]">Projenin adını, özetini, problemini, kategorisini ve aşamasını tanımla.</p>
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="projectName" className={labelClass}>Proje adı</label>
          <input id="projectName" value={values.name} onChange={(event) => update("name", event.target.value)} maxLength={60} placeholder="Örneğin: Foundmate" aria-invalid={Boolean(errors.name)} aria-describedby={`projectName-count${errors.name ? " projectName-error" : ""}`} className={`${fieldClass} min-h-11`} />
          <FieldFooter count={values.name.length} countId="projectName-count" error={errors.name} errorId="projectName-error" max={60} />
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="shortDescription" className={labelClass}>Projeni tek cümlede anlat</label>
          <p id="shortDescription-help" className={helpClass}>İnsanların projenin ne yaptığını birkaç saniyede anlayabileceği açık bir cümle yaz.</p>
          <textarea
            id="shortDescription"
            value={values.shortDescription}
            onChange={(event) => update("shortDescription", event.target.value)}
            maxLength={180}
            placeholder="Örneğin: Fikri veya yeteneği olan insanların doğru ekip arkadaşlarını bulduğu platform."
            aria-invalid={Boolean(errors.shortDescription)}
            aria-describedby={`shortDescription-help shortDescription-count${errors.shortDescription ? " shortDescription-error" : ""}`}
            className={textareaClass}
          />
          <FieldFooter count={values.shortDescription.length} countId="shortDescription-count" error={errors.shortDescription} errorId="shortDescription-error" max={180} />
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="problemDescription" className={labelClass}>Hangi problemi çözüyorsun?</label>
          <p id="problemDescription-help" className={helpClass}>Problemi kimin yaşadığını, bugün nasıl çözdüğünü ve mevcut yöntemlerin neden yetersiz kaldığını açıkla.</p>
          <textarea
            id="problemDescription"
            value={values.problemDescription}
            onChange={(event) => update("problemDescription", event.target.value)}
            maxLength={1000}
            placeholder={"Üniversite öğrencileri proje fikirlerini hayata geçirmek için doğru ekip arkadaşlarını bulamıyor.\nDiscord ve LinkedIn bu süreç için yeterince odaklı değil."}
            aria-invalid={Boolean(errors.problemDescription)}
            aria-describedby={`problemDescription-help problemDescription-count${errors.problemDescription ? " problemDescription-error" : ""}`}
            className={problemTextareaClass}
          />
          <FieldFooter count={values.problemDescription.length} countId="problemDescription-count" error={errors.problemDescription} errorId="problemDescription-error" max={1000} />
        </div>

        <div className={`grid gap-5 sm:grid-cols-2 ${sectionCardClass}`}>
          <div className="min-w-0">
            <label htmlFor="category" className={labelClass}>Kategori</label>
            <select id="category" value={values.category} onChange={(event) => update("category", event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "category-error" : undefined} className={`${fieldClass} min-h-11`}>
              <option value="">Kategori seç</option>
              {categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {errors.category && <p id="category-error" className={`mt-2 ${errorClass}`}>{errors.category}</p>}
          </div>
          <div className="min-w-0 rounded-xl bg-[#f8f8fa] p-4">
            <p className="text-xs text-[#8a91a0]">Bu ilk sürümde</p>
            <p className="mt-1 text-sm leading-6 text-[#4f596c]">Kategori yalnızca taslağı düzenli tutar. Taslak Discover sayfasına eklenmez ve yayınlanmaz.</p>
          </div>
        </div>

        <fieldset aria-describedby={errors.stage ? "stage-error" : undefined} className={sectionCardClass}>
          <legend className={`px-1 ${labelClass}`}>Şu anda hangi aşamadasın?</legend>
          <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
            {stageOptions.map((option) => <label key={option.value} className={`flex min-h-[86px] min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${values.stage === option.value ? "border-[#6d65d4] bg-[#f3f1ff] ring-2 ring-[#6d65d4]/10" : "border-[#e1e2e8] hover:border-[#c8c4ec]"}`}>
              <input type="radio" name="stage" value={option.value} checked={values.stage === option.value} onChange={() => update("stage", option.value)} className="mt-1 size-4 shrink-0 accent-[#5448d8]" />
              <span className="min-w-0">
                <strong className="flex items-center gap-1.5 text-sm text-[#344057] [overflow-wrap:anywhere]">{option.label}{values.stage === option.value && <Check className="size-3.5 text-[#5750be]" aria-hidden="true" />}</strong>
                <span className="mt-1 block text-xs leading-5 text-[#747e91] [overflow-wrap:anywhere]">{option.description}</span>
              </span>
            </label>)}
          </div>
          {errors.stage && <p id="stage-error" className={`mt-2 ${errorClass}`}>{errors.stage}</p>}
        </fieldset>

        <div className="border-t border-[#e6e6eb] pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Adım 2 / 2</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#26334f]">Problem derinliği ve ilk sprint</h2>
          <p className="mt-2 text-sm leading-6 text-[#687184]">Kimi hedeflediğini, bugünkü çözümleri, başarı ölçütünü ve ilk sprintte ne yapacağını netleştir.</p>
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="targetUsers" className={labelClass}>Hedef kullanıcılar kim?</label>
          <p id="targetUsers-help" className={helpClass}>Problemi en çok yaşayan kişi veya segmenti somutlaştır. Yaş, bağlam veya rol belirt.</p>
          <textarea
            id="targetUsers"
            value={values.targetUsers}
            onChange={(event) => update("targetUsers", event.target.value)}
            maxLength={300}
            placeholder="Örneğin: Üniversite son sınıf öğrencileri ve yeni mezunlar; yan proje veya startup fikri olan, ekip kurmak isteyen kişiler."
            aria-invalid={Boolean(errors.targetUsers)}
            aria-describedby={`targetUsers-help targetUsers-count${errors.targetUsers ? " targetUsers-error" : ""}`}
            className={textareaClass}
          />
          <FieldFooter count={values.targetUsers.length} countId="targetUsers-count" error={errors.targetUsers} errorId="targetUsers-error" max={300} />
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="currentSolution" className={labelClass}>Bugün bu problem nasıl çözülüyor?</label>
          <p id="currentSolution-help" className={helpClass}>İnsanların şu an kullandığı araçları, alışkanlıkları veya geçici yöntemleri yaz.</p>
          <textarea
            id="currentSolution"
            value={values.currentSolution}
            onChange={(event) => update("currentSolution", event.target.value)}
            maxLength={400}
            placeholder="Örneğin: Discord sunucuları, LinkedIn mesajları, kampüs etkinlikleri ve kişisel çevre üzerinden ekip arıyorlar."
            aria-invalid={Boolean(errors.currentSolution)}
            aria-describedby={`currentSolution-help currentSolution-count${errors.currentSolution ? " currentSolution-error" : ""}`}
            className={textareaClass}
          />
          <FieldFooter count={values.currentSolution.length} countId="currentSolution-count" error={errors.currentSolution} errorId="currentSolution-error" max={400} />
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="insufficientSolutions" className={labelClass}>Mevcut çözümler neden yetersiz?</label>
          <p id="insufficientSolutions-help" className={helpClass}>Dağınıklık, güven eksikliği, yanlış eşleşme veya yüksek sürtünme gibi somut eksiklikleri açıkla.</p>
          <textarea
            id="insufficientSolutions"
            value={values.insufficientSolutions}
            onChange={(event) => update("insufficientSolutions", event.target.value)}
            maxLength={600}
            placeholder={"Örneğin: Kanallar dağınık, niyet ve beceri seviyesi görünmüyor, güven oluşmadan iletişim kuruluyor.\nBu da ciddi ekip arayanları yavaşlatıyor veya vazgeçiriyor."}
            aria-invalid={Boolean(errors.insufficientSolutions)}
            aria-describedby={`insufficientSolutions-help insufficientSolutions-count${errors.insufficientSolutions ? " insufficientSolutions-error" : ""}`}
            className={problemTextareaClass}
          />
          <FieldFooter count={values.insufficientSolutions.length} countId="insufficientSolutions-count" error={errors.insufficientSolutions} errorId="insufficientSolutions-error" max={600} />
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="successMetric" className={labelClass}>Başarıyı nasıl ölçeceksin?</label>
          <p id="successMetric-help" className={helpClass}>İlk aşamada başarılı sayılman için tek, ölçülebilir bir sonuç belirt.</p>
          <textarea
            id="successMetric"
            value={values.successMetric}
            onChange={(event) => update("successMetric", event.target.value)}
            maxLength={200}
            placeholder="Örneğin: İlk 30 günde 10 proje sahibinin en az bir ciddi ekip görüşmesi başlatması."
            aria-invalid={Boolean(errors.successMetric)}
            aria-describedby={`successMetric-help successMetric-count${errors.successMetric ? " successMetric-error" : ""}`}
            className={textareaClass}
          />
          <FieldFooter count={values.successMetric.length} countId="successMetric-count" error={errors.successMetric} errorId="successMetric-error" max={200} />
        </div>

        <div className={sectionCardClass}>
          <label htmlFor="plannedFirstSprint" className={labelClass}>Planlanan ilk sprintte ne yapacaksın?</label>
          <p id="plannedFirstSprint-help" className={helpClass}>7-14 gün içinde tamamlanabilecek küçük, somut ve ölçülebilir bir çıktı yaz.</p>
          <textarea
            id="plannedFirstSprint"
            value={values.plannedFirstSprint}
            onChange={(event) => update("plannedFirstSprint", event.target.value)}
            maxLength={400}
            placeholder="Örneğin: 5 proje sahibiyle görüşüp profil + proje özeti formunu test etmek ve en az 2 kişiden detaylı geri bildirim almak."
            aria-invalid={Boolean(errors.plannedFirstSprint)}
            aria-describedby={`plannedFirstSprint-help plannedFirstSprint-count${errors.plannedFirstSprint ? " plannedFirstSprint-error" : ""}`}
            className={textareaClass}
          />
          <FieldFooter count={values.plannedFirstSprint.length} countId="plannedFirstSprint-count" error={errors.plannedFirstSprint} errorId="plannedFirstSprint-error" max={400} />
        </div>
      </div>

      <div className="mt-7 flex min-w-0 flex-col gap-4 border-t border-[#e6e6eb] pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
          <button type="button" onClick={save} disabled={isSaving} aria-describedby="project-draft-feedback" className="inline-flex min-h-11 w-full min-w-[12.5rem] items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.16)] outline-none motion-safe:transition hover:bg-[#463ac8] focus-visible:ring-2 focus-visible:ring-[#7068d8]/35 focus-visible:ring-offset-2 active:shadow-none disabled:cursor-wait disabled:bg-[#8d88d8] motion-safe:active:translate-y-px motion-safe:active:scale-[0.99] sm:w-auto"><Save className="size-4 shrink-0" />{saveButtonText}</button>
          <button type="button" onClick={clear} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#6d638b] outline-none motion-safe:transition hover:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-[#7068d8]/30 focus-visible:ring-offset-2 active:shadow-none motion-safe:active:translate-y-px motion-safe:active:scale-[0.99] sm:w-auto"><Trash2 className="size-4 shrink-0" />Taslağı temizle</button>
        </div>
        <Link to="/app" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7] outline-none hover:bg-[#f7f6ff] focus-visible:ring-2 focus-visible:ring-[#7068d8]/30 focus-visible:ring-offset-2 sm:w-auto">Ana sayfaya dön</Link>
      </div>
      <div id="project-draft-feedback" aria-live="polite" className="mt-3 min-h-[2.25rem] text-xs leading-5">
        {saveState === "saving" && <p className="font-semibold text-[#6c6890]">Kaydediliyor…</p>}
        {saveState === "saved" && <p className="font-semibold text-[#315f45]">Taslak kaydedildi.{lastSavedAt && <span className="block font-normal text-[#5f7469]">Son kayıt: {savedAtFormatter.format(new Date(lastSavedAt))}</span>}</p>}
        {saveState === "error" && <p className="font-semibold text-[#9a3346]">Taslak kaydedilemedi. Tekrar dene.</p>}
      </div>
    </form>
  </div>;
}
