import { X } from "lucide-react";
import { useState } from "react";
import type { RequiredRole } from "../../types/projectDraft";
import { roleSkillOptions, roleTitleOptions } from "../../utils/projectHelpers";

const experienceLevelOptions = ["Junior", "Mid", "Senior", "Lead"];

interface RoleFormProps {
  initialRole?: RequiredRole;
  onSave: (title: string, responsibility: string, experienceLevel: string, skills: string[]) => void;
  onCancel: () => void;
}

export function RoleForm({ initialRole, onSave, onCancel }: RoleFormProps) {
  const [title, setTitle] = useState(initialRole?.title ?? "");
  const [responsibility, setResponsibility] = useState(initialRole?.responsibility ?? "");
  const [experienceLevel, setExperienceLevel] = useState(initialRole?.experienceLevel ?? "");
  const [skills, setSkills] = useState<string[]>(initialRole?.skills ?? []);
  const [customSkill, setCustomSkill] = useState("");

  const isEditing = Boolean(initialRole);
  const titleValid = title.trim().length > 0;
  const responsibilityValid = responsibility.trim().length > 0;
  const skillsValid = skills.length >= 2;
  const isValid = titleValid && responsibilityValid && skillsValid;

  const toggleSkill = (skill: string) => {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill],
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((current) => [...current, trimmed]);
      setCustomSkill("");
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave(title.trim(), responsibility.trim(), experienceLevel, skills);
  };

  return (
    <div className="min-w-0 rounded-2xl border border-[#d9d5f4] bg-[#f8f7ff] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#344057]">
          {isEditing ? "Rolü düzenle" : "Yeni rol ekle"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-8 items-center justify-center rounded-lg text-[#8a91a0] hover:bg-[#eeecff] hover:text-[#5148c7]"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block text-xs font-semibold text-[#344057]">
          Rol başlığı
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"
          >
            <option value="">Rol seç</option>
            {roleTitleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-[#344057]">
          Deneyim seviyesi
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="mt-1.5 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"
          >
            <option value="">Seç</option>
            {experienceLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-[#344057]">
          Kısa sorumluluk açıklaması
          <textarea
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
            rows={2}
            placeholder="Bu roldeki kişinin temel sorumlulukları neler?"
            className="mt-1.5 block w-full resize-none rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 py-2.5 text-sm font-normal leading-6 outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"
          />
        </label>

        <fieldset className="min-w-0">
          <legend className="text-xs font-semibold text-[#344057]">
            İstenen beceriler (en az 2)
          </legend>
          <p className="mt-1 text-[10px] leading-4 text-[#8a91a0]">
            Birden fazla seçebilirsin.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roleSkillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                aria-pressed={skills.includes(skill)}
                className={`max-w-full rounded-lg border px-2.5 py-1 text-[11px] font-medium transition [overflow-wrap:anywhere] ${
                  skills.includes(skill)
                    ? "border-[#6259cf] bg-[#eeecff] text-[#4f46bd]"
                    : "border-[#e1e2e8] bg-white text-[#4e576b] hover:border-[#bbb7e9]"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {!skillsValid && skills.length > 0 && skills.length < 2 && (
            <p className="mt-1.5 text-[11px] font-medium text-[#a52f43]">
              En az 2 yetenek seçmelisin.
            </p>
          )}
        </fieldset>

        <div className="flex items-center gap-2">
          <input
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="Özel beceri ekle..."
            className="min-h-9 w-full rounded-lg border border-[#dfe1e7] bg-white px-3 text-xs outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            disabled={!customSkill.trim()}
            className="inline-flex min-h-9 items-center rounded-lg bg-[#eeecff] px-3 text-xs font-semibold text-[#5148c7] disabled:opacity-40"
          >
            Ekle
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-lg border border-[#cfcaf5] bg-[#f0eeff] px-2 py-0.5 text-[11px] font-medium text-[#4f46bd]"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="inline-flex size-3.5 items-center justify-center rounded-full hover:bg-[#d8d3f5]"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#5448d8] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isEditing ? "Kaydet" : "Rol ekle"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d8d6e8] bg-white px-4 text-sm font-semibold text-[#5148c7]"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
