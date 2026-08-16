import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createProject, getProject, updateProject } from "../api/projects";
import { getApiErrorMessage } from "../api/client";
import { usePageTitle } from "../utils/usePageTitle";

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

const fieldClass = "mt-2 block w-full max-w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15";
const labelClass = "text-base font-semibold text-[#26334f]";
const errorClass = "min-w-0 text-xs font-semibold text-[#b7354b] [overflow-wrap:anywhere]";

type FieldErrors = { title?: string; description?: string };

export default function CreateProjectPage() {
  usePageTitle("Proje oluştur");
  const navigate = useNavigate();
  const { projectId } = useParams();
  const editing = projectId !== undefined;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    getProject(projectId)
      .then((project) => {
        if (cancelled) return;
        setTitle(project.title);
        setCategory(project.category ?? "");
        setDescription(project.description);
      })
      .catch((err: unknown) => setFormError(getApiErrorMessage(err)))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, projectId]);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "Proje adı zorunludur.";
    else if (title.trim().length > 200) next.title = "Proje adı en fazla 200 karakter olabilir.";

    const descriptionLength = description.trim().length;
    if (descriptionLength < 50) next.description = "Açıklama en az 50 karakter olmalıdır.";
    else if (descriptionLength > 2000) next.description = "Açıklama en fazla 2000 karakter olabilir.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (submitting) return;
    if (!validate()) return;

    const payload = { title: title.trim(), description: description.trim(), category: category.trim() || null };
    setSubmitting(true);
    try {
      if (editing) {
        await updateProject(projectId, payload);
        navigate(`/projects/${projectId}`, { replace: true });
      } else {
        const created = await createProject(payload);
        navigate(`/projects/${created.id}`, { replace: true });
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err));
      setSubmitting(false);
    }
  };

  const submitLabel = loading ? "Yükleniyor…" : submitting ? editing ? "Güncelleniyor…" : "Oluşturuluyor…" : editing ? "Projeyi güncelle" : "Projeyi oluştur";

  return <div className="mx-auto w-full max-w-[820px] px-5 py-8 sm:px-8 lg:py-12">
    <Link to={editing ? `/projects/${projectId}` : "/my-project"} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657084] hover:text-[#5148c7]"><ArrowLeft className="size-4" />{editing ? "Projeye dön" : "Projelerime dön"}</Link>
    <header className="mt-5 min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">{editing ? "Projeyi düzenle" : "Yeni proje"}</p>
      <h1 className="mt-2 font-display text-[clamp(2.35rem,6vw,3.8rem)] font-semibold tracking-[-0.045em] text-[#17233e]">{editing ? "Projeni güncelle." : "İlk projeni oluştur."}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687184]">Projenin adını, kategorisini ve kısa açıklamasını tanımla. Açıklama en az 50 karakter olmalıdır.</p>
    </header>

    {loading ? <section className="mt-8 rounded-3xl border border-dashed border-[#d7d5e6] bg-[#fbfaf7] px-5 py-16 text-center"><h2 className="text-lg font-semibold text-[#344057]">Proje yükleniyor…</h2></section>
      : <form onSubmit={handleSubmit} noValidate className="mt-7 min-w-0 rounded-3xl border border-[#e0e0e6] bg-white p-5 shadow-[0_14px_40px_rgba(37,44,72,0.04)] sm:p-8">
        {formError && <div role="alert" className="mb-6 rounded-2xl border border-[#efc9cf] bg-[#fff5f6] p-4 text-sm font-medium text-[#8b2939]">{formError}</div>}

        <div className="space-y-8">
          <div>
            <label htmlFor="projectTitle" className={labelClass}>Proje adı</label>
            <input id="projectTitle" value={title} onChange={(event) => { setTitle(event.target.value); if (errors.title) setErrors((current) => ({ ...current, title: undefined })); }} maxLength={200} placeholder="Örneğin: Foundmate" className={`${fieldClass} min-h-11`} />
            {errors.title && <p className={`mt-2 ${errorClass}`}>{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="projectCategory" className={labelClass}>Kategori <span className="text-sm font-normal text-[#7a8393]">(isteğe bağlı)</span></label>
            <select id="projectCategory" value={category} onChange={(event) => setCategory(event.target.value)} className={`${fieldClass} min-h-11`}>
              <option value="">Kategori seç</option>
              {categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="projectDescription" className={labelClass}>Kısa açıklama</label>
            <p className="mt-1 text-xs leading-5 text-[#7a8393]">Projenin ne yaptığını 50–2000 karakter arasında anlat.</p>
            <textarea id="projectDescription" value={description} onChange={(event) => { setDescription(event.target.value); if (errors.description) setErrors((current) => ({ ...current, description: undefined })); }} maxLength={2000} rows={7} placeholder="Problemi, çözdüğün şeyi ve şu anki ilerlemeyi kısaca anlat." className={`${fieldClass} resize-none overflow-y-auto py-3 leading-6`} />
            {errors.description ? <p className={`mt-2 ${errorClass}`}>{errors.description}</p> : <p className="mt-2 text-right text-xs text-[#8a91a0]">{description.trim().length} / 2000</p>}
          </div>
        </div>

        <div className="mt-7 flex min-w-0 flex-col gap-4 border-t border-[#e6e6eb] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" disabled={submitting || loading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.16)] transition hover:bg-[#463ac8] disabled:cursor-not-allowed disabled:bg-[#8d88d8] sm:w-auto"><Save className="size-4" />{submitLabel}</button>
          <Link to={editing ? `/projects/${projectId}` : "/my-project"} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-5 text-sm font-semibold text-[#5148c7] hover:bg-[#f7f6ff] sm:w-auto">Vazgeç</Link>
        </div>
      </form>}
  </div>;
}