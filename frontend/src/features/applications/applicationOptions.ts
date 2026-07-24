import type { CommitmentPreference, CompensationPreference, WeeklyAvailability } from "../../types/application";

export const weeklyAvailabilityOptions: WeeklyAvailability[] = ["3–5 saat", "6–8 saat", "9–12 saat", "12+ saat"];

export const weeklyAvailabilityMaxHours: Record<WeeklyAvailability, number> = {
  "3–5 saat": 5, "6–8 saat": 8, "9–12 saat": 12, "12+ saat": 99,
};

export const commitmentOptions: { value: CommitmentPreference; label: string }[] = [
  { value: "exploring", label: "Şimdilik keşfediyorum" },
  { value: "trial-sprint", label: "Kısa bir deneme sprintine açığım" },
  { value: "long-term", label: "Uzun vadeli bir projeye katılabilirim" },
  { value: "cofounder-open", label: "Kurucu ortaklık ihtimaline açığım" },
];

export const compensationOptions: { value: CompensationPreference; label: string }[] = [
  { value: "volunteer", label: "Gönüllü / portfolyo" },
  { value: "paid", label: "Ücretli" },
  { value: "equity", label: "Hisse" },
  { value: "open-to-discussion", label: "Konuşmaya açığım" },
];

export const commitmentLabels = Object.fromEntries(commitmentOptions.map((option) => [option.value, option.label])) as Record<CommitmentPreference, string>;
export const compensationPreferenceLabels = Object.fromEntries(compensationOptions.map((option) => [option.value, option.label])) as Record<CompensationPreference, string>;

export function normalizeWeeklyAvailability(value: string): WeeklyAvailability {
  return weeklyAvailabilityOptions.includes(value as WeeklyAvailability) ? value as WeeklyAvailability : "6–8 saat";
}
