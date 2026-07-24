import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleCache = new Map();

function resolveModule(specifier, parentFile) {
  if (!specifier.startsWith(".")) return specifier;
  const base = path.resolve(path.dirname(parentFile), specifier);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
}

function loadTsModule(filePath) {
  const resolved = path.normalize(filePath);
  if (moduleCache.has(resolved)) return moduleCache.get(resolved).exports;

  const source = fs.readFileSync(resolved, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const module = { exports: {} };
  moduleCache.set(resolved, module);

  const localRequire = (specifier) => {
    const next = resolveModule(specifier, resolved);
    if (!next.startsWith(".") && !path.isAbsolute(next)) return awaitlessImport(next);
    return loadTsModule(next);
  };

  vm.runInNewContext(output, {
    URL,
    console,
    exports: module.exports,
    globalThis,
    module,
    require: localRequire,
    window: globalThis.window,
  }, { filename: resolved });

  return module.exports;
}

function awaitlessImport(specifier) {
  if (specifier === "node:assert/strict") return assert;
  throw new Error(`Unexpected external module in assertion loader: ${specifier}`);
}

function createMemoryLocalStorage() {
  const store = new Map();
  return {
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    removeItem: (key) => store.delete(key),
    setItem: (key, value) => store.set(key, String(value)),
  };
}

globalThis.window = { localStorage: createMemoryLocalStorage() };

const { weeklyAvailabilityOptions } = loadTsModule(path.join(root, "src/features/applications/applicationOptions.ts"));
const { upsertProjectApplication, withdrawProjectApplication } = loadTsModule(path.join(root, "src/features/applications/applicationLogic.ts"));
const { validateDraftApplication, validateSubmissionApplication } = loadTsModule(path.join(root, "src/features/applications/applicationValidation.ts"));
const { APPLICATIONS_KEY, loadApplications, persistApplications } = loadTsModule(path.join(root, "src/utils/applicationStorage.ts"));

const profileId = "profile-created-at-1";
const availability = weeklyAvailabilityOptions[1];
let idCounter = 0;
const createId = () => `application-${++idCounter}`;

const partialDraft = {
  selectedRole: "",
  motivation: "short",
  contribution: "",
  firstSprintProposal: "",
  weeklyAvailability: availability,
  commitmentPreference: "trial-sprint",
  compensationPreferences: [],
  portfolioUrl: "",
};

const validSubmission = {
  selectedRole: "Frontend",
  motivation: "Bu projeyle ilgileniyorum çünkü problem alanı net ve ilk sürüm için güçlü bir kullanıcı öğrenmesi sağlayabilir.",
  contribution: "İlk haftalarda arayüz akışını sadeleştirip kullanıcı testlerinden gelen bulgularla ölçülebilir iyileştirmeler yapabilirim.",
  firstSprintProposal: "İlk sprintte başvuru akışının tıklanabilir bir prototipini ve kısa test notlarını çıkarırım.",
  weeklyAvailability: availability,
  commitmentPreference: "trial-sprint",
  compensationPreferences: ["open-to-discussion"],
  portfolioUrl: "https://example.com/portfolio/a-very-long-path-without-spaces",
};

assert.equal(Object.keys(validateDraftApplication(partialDraft)).length, 0, "partial draft should pass draft validation");
assert.ok(Object.keys(validateSubmissionApplication(partialDraft)).length > 0, "partial draft should not pass submission validation");
assert.equal(Object.keys(validateSubmissionApplication(validSubmission)).length, 0, "complete form should pass submission validation");

const firstSave = upsertProjectApplication({
  storedApplications: [],
  applicantProfileCreatedAt: profileId,
  projectId: "project-a",
  values: partialDraft,
  submit: false,
  now: "2026-07-13T10:00:00.000Z",
  createId,
});
assert.equal(firstSave.application.status, "draft");
assert.equal(firstSave.applications.length, 1);
assert.equal(firstSave.application.motivation, partialDraft.motivation);

persistApplications(firstSave.applications);
const loadedDraft = loadApplications()[0];
assert.equal(loadedDraft.status, "draft", "partial draft should survive storage parsing");
assert.equal(loadedDraft.motivation, partialDraft.motivation, "partial draft should restore after reload");

const secondDraftValues = { ...partialDraft, motivation: "updated partial draft" };
const secondSave = upsertProjectApplication({
  storedApplications: firstSave.applications,
  applicantProfileCreatedAt: profileId,
  projectId: "project-a",
  values: secondDraftValues,
  submit: false,
  now: "2026-07-13T10:10:00.000Z",
  createId,
});
assert.equal(secondSave.applications.length, 1, "repeated draft saves should keep one record");
assert.equal(secondSave.application.id, firstSave.application.id, "repeated draft saves should keep the same ID");
assert.equal(secondSave.application.updatedAt, "2026-07-13T10:10:00.000Z");

const projectBValues = { ...partialDraft, motivation: "project b values stay separate" };
const projectBSave = upsertProjectApplication({
  storedApplications: secondSave.applications,
  applicantProfileCreatedAt: profileId,
  projectId: "project-b",
  values: projectBValues,
  submit: false,
  now: "2026-07-13T10:20:00.000Z",
  createId,
});
assert.equal(projectBSave.applications.length, 2, "different projects should keep different application records");
assert.equal(projectBSave.applications.find((item) => item.projectId === "project-a").motivation, secondDraftValues.motivation);
assert.equal(projectBSave.applications.find((item) => item.projectId === "project-b").motivation, projectBValues.motivation);

assert.throws(() => upsertProjectApplication({
  storedApplications: projectBSave.applications,
  applicantProfileCreatedAt: profileId,
  projectId: "project-a",
  values: partialDraft,
  submit: true,
  now: "2026-07-13T10:30:00.000Z",
  createId,
}), /validation/, "partial draft should not submit");

const submitted = upsertProjectApplication({
  storedApplications: projectBSave.applications,
  applicantProfileCreatedAt: profileId,
  projectId: "project-a",
  values: validSubmission,
  submit: true,
  now: "2026-07-13T10:40:00.000Z",
  createId,
});
assert.equal(submitted.application.status, "submitted");
assert.equal(submitted.application.id, firstSave.application.id);

const withdrawn = withdrawProjectApplication(submitted.applications, submitted.application.id, "2026-07-13T10:50:00.000Z");
const withdrawnRecord = withdrawn.find((item) => item.projectId === "project-a");
assert.equal(withdrawnRecord.status, "withdrawn");
assert.equal(withdrawnRecord.motivation, validSubmission.motivation, "withdrawn application should retain content");
assert.equal(withdrawn.filter((item) => item.status === "submitted").length, 0, "withdrawn application should not count as submitted");

const reopened = upsertProjectApplication({
  storedApplications: withdrawn,
  applicantProfileCreatedAt: profileId,
  projectId: "project-a",
  values: withdrawnRecord,
  submit: false,
  now: "2026-07-13T11:00:00.000Z",
  createId,
});
assert.equal(reopened.application.id, firstSave.application.id, "editing withdrawn application should not duplicate");
assert.equal(reopened.application.status, "draft");
assert.equal(reopened.applications.find((item) => item.projectId === "project-b").motivation, projectBValues.motivation, "cross-project values should remain isolated");

window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([{ ...partialDraft, id: "bad", projectId: "project-c", applicantProfileCreatedAt: profileId, status: "submitted", createdAt: "2026-07-13T10:00:00.000Z", updatedAt: "2026-07-13T10:00:00.000Z", submittedAt: "2026-07-13T10:00:00.000Z" }]));
assert.equal(loadApplications().length, 0, "invalid submitted storage records should be rejected");

console.log("Application flow assertions passed.");
