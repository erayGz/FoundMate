import type { ApplicationFormValues } from "../../types/application";
import { commitmentOptions, compensationOptions, weeklyAvailabilityOptions } from "./applicationOptions";

export type ApplicationErrors = Partial<Record<keyof ApplicationFormValues, string>>;

const commitmentValues = new Set(commitmentOptions.map((option) => option.value));
const compensationValues = new Set(compensationOptions.map((option) => option.value));

function trimmedLength(value: string) {
  return value.trim().length;
}

export function isValidPortfolioUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateDraftApplication(values: ApplicationFormValues): ApplicationErrors {
  const errors: ApplicationErrors = {};
  if (!weeklyAvailabilityOptions.includes(values.weeklyAvailability)) errors.weeklyAvailability = "Desteklenen bir haftalik uygunluk secmelisin.";
  if (!commitmentValues.has(values.commitmentPreference)) errors.commitmentPreference = "Desteklenen bir baglilik tercihi secmelisin.";
  if (values.compensationPreferences.some((item) => !compensationValues.has(item))) errors.compensationPreferences = "Desteklenen katki modeli tercihlerini secmelisin.";
  if (!isValidPortfolioUrl(values.portfolioUrl)) errors.portfolioUrl = "Gecerli bir HTTP veya HTTPS baglantisi girmelisin.";
  return errors;
}

export function validateSubmissionApplication(values: ApplicationFormValues): ApplicationErrors {
  const errors: ApplicationErrors = {};
  if (!values.selectedRole) errors.selectedRole = "Bir rol secmelisin.";
  if (trimmedLength(values.motivation) < 60) errors.motivation = "Motivasyon en az 60 karakter olmali.";
  if (trimmedLength(values.motivation) > 600) errors.motivation = "Motivasyon en fazla 600 karakter olabilir.";
  if (trimmedLength(values.contribution) < 80) errors.contribution = "Katki aciklamasi en az 80 karakter olmali.";
  if (trimmedLength(values.contribution) > 800) errors.contribution = "Katki aciklamasi en fazla 800 karakter olabilir.";
  if (trimmedLength(values.firstSprintProposal) < 30) errors.firstSprintProposal = "Sprint onerisi en az 30 karakter olmali.";
  if (trimmedLength(values.firstSprintProposal) > 400) errors.firstSprintProposal = "Sprint onerisi en fazla 400 karakter olabilir.";
  if (!values.weeklyAvailability) errors.weeklyAvailability = "Haftalik uygunlugunu secmelisin.";
  if (!values.commitmentPreference) errors.commitmentPreference = "Baglilik tercihini secmelisin.";
  if (!values.compensationPreferences.length) errors.compensationPreferences = "En az bir katki modeli secmelisin.";
  if (!isValidPortfolioUrl(values.portfolioUrl)) errors.portfolioUrl = "Gecerli bir HTTP veya HTTPS baglantisi girmelisin.";
  return errors;
}

export const validateApplication = validateSubmissionApplication;

export function trimApplicationValues(values: ApplicationFormValues): ApplicationFormValues {
  return { ...values, motivation: values.motivation.trim(), contribution: values.contribution.trim(), firstSprintProposal: values.firstSprintProposal.trim(), portfolioUrl: values.portfolioUrl.trim() };
}

export function prepareDraftApplicationValues(values: ApplicationFormValues): ApplicationFormValues {
  return { ...values, portfolioUrl: values.portfolioUrl.trim() };
}
