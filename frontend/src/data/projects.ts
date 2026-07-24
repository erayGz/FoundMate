export type WorkingPreference = "remote" | "hybrid" | "local" | "flexible";
export type CompensationModel = "volunteer" | "paid" | "equity" | "open-to-discussion";

export interface ProjectProgress {
  completed: string[];
  currentFocus: string;
  nextMilestone: string;
}

export interface MockProject {
  id: string;
  name: string;
  category: string;
  stage: string;
  desc: string;
  roles: string[];
  person: string;
  founder: string;
  color: string;
  proof: string;
  progress: ProjectProgress;
  time: string;
  minWeeklyHours: number;
  maxWeeklyHours: number;
  location: string;
  workingPreference: WorkingPreference;
  trialSprintAvailable: boolean;
  trialSprintTask: string;
  compensationModel: CompensationModel;
}

export const projects: MockProject[] = [
  {
    id: "kapsul", name: "Kapsül", category: "Wellbeing", stage: "Prototip hazır",
    desc: "İnsanların günlük iyi oluş rutinlerini sürdürülebilir hale getiren küçük alışkanlık alanı.",
    roles: ["Mobile", "Growth"], person: "SD", founder: "Selin D.", color: "bg-[#ffe9dd] text-[#bd6034]",
    proof: "12 kullanıcı görüşmesi tamamlandı",
    progress: { completed: ["Günlük rutin oluşturma akışı tasarlandı", "12 kullanıcı görüşmesi tamamlandı"], currentFocus: "Mobil alışkanlık takibi prototipinin test edilmesi", nextMilestone: "30 kişilik kapalı beta" },
    time: "8–12 sa/hafta", minWeeklyHours: 8, maxWeeklyHours: 12, location: "Uzaktan", workingPreference: "remote",
    trialSprintAvailable: true, trialSprintTask: "Hatırlatıcı akışını prototiple ve 5 kullanıcıyla kullanılabilirlik testi yap.", compensationModel: "volunteer",
  },
  {
    id: "mimari", name: "Mimarî", category: "Proptech", stage: "İlk kullanıcılar",
    desc: "Ev yenileme sürecini adım adım planlayan, yerel uzmanları bir araya getiren ürün.",
    roles: ["Frontend", "UI/UX"], person: "İK", founder: "İpek K.", color: "bg-[#e4e4ff] text-[#5348c1]",
    proof: "45 aktif erken kullanıcı",
    progress: { completed: ["Yenileme planı oluşturma akışı yayında", "45 erken kullanıcı ürünü denedi"], currentFocus: "Uzman eşleştirme ekranının sadeleştirilmesi", nextMilestone: "İstanbul pilotunda 100 aktif kullanıcı" },
    time: "10 sa/hafta", minWeeklyHours: 10, maxWeeklyHours: 10, location: "İstanbul + uzaktan", workingPreference: "hybrid",
    trialSprintAvailable: true, trialSprintTask: "Uzman profil akışını tamamla ve 5 ev sahibiyle geri bildirim oturumu yap.", compensationModel: "open-to-discussion",
  },
  {
    id: "rota", name: "Rota", category: "Sürdürülebilirlik", stage: "Araştırma",
    desc: "Şehir içi teslimat ekipleri için daha az emisyonlu rota kararları sunan araç.",
    roles: ["Data", "B2B Sales"], person: "CE", founder: "Can E.", color: "bg-[#e1f1e5] text-[#36704c]",
    proof: "3 lojistik firmasıyla görüşme",
    progress: { completed: ["Teslimat karar noktaları haritalandı", "3 lojistik firmasıyla ihtiyaç görüşmesi yapıldı"], currentFocus: "Rota verisi için ölçüm modelinin doğrulanması", nextMilestone: "Bir filo ile iki haftalık veri pilotu" },
    time: "6–8 sa/hafta", minWeeklyHours: 6, maxWeeklyHours: 8, location: "Uzaktan", workingPreference: "remote",
    trialSprintAvailable: true, trialSprintTask: "Örnek teslimat verisini analiz et ve emisyon karşılaştırma raporu hazırla.", compensationModel: "volunteer",
  },
  {
    id: "devkose", name: "DevKöşe", category: "Öğrenci projesi", stage: "İlk sürüm",
    desc: "Bilgisayar mühendisliği öğrencilerinin ekip bulup açık kaynak projelerde birlikte üretmesini sağlayan alan.",
    roles: ["Backend", "DevRel"], person: "BK", founder: "Berk K.", color: "bg-[#e2eefc] text-[#32658f]",
    proof: "GitHub’da çalışan ilk sürüm",
    progress: { completed: ["Proje listeleme API'si tamamlandı", "GitHub üzerinde çalışan ilk sürüm yayınlandı"], currentFocus: "Katılımcı onboarding ve katkı rehberinin hazırlanması", nextMilestone: "Üç üniversiteden ilk 50 katılımcı" },
    time: "5–7 sa/hafta", minWeeklyHours: 5, maxWeeklyHours: 7, location: "Üniversiteler + uzaktan", workingPreference: "flexible",
    trialSprintAvailable: true, trialSprintTask: "Katkı rehberini iyileştir ve iki örnek açık kaynak görevi yayınla.", compensationModel: "volunteer",
  },
  {
    id: "formlab", name: "FormLab", category: "Spor Teknolojileri", stage: "Prototip",
    desc: "Amatör sporcuların antrenman videolarını düzenli geri bildirime dönüştüren mobil çalışma alanı.",
    roles: ["Mobile", "AI / ML", "Growth"], person: "EA", founder: "Eren A.", color: "bg-[#f5e4ff] text-[#7a3ea0]",
    proof: "18 sporcu ile ilk test planlandı",
    progress: { completed: ["Video yükleme akışı prototiplendi", "18 sporcu ile ilk test grubu oluşturuldu"], currentFocus: "Antrenman geri bildirim döngüsünün test edilmesi", nextMilestone: "İlk kapalı mobil beta" },
    time: "7–10 sa/hafta", minWeeklyHours: 7, maxWeeklyHours: 10, location: "İstanbul + uzaktan", workingPreference: "hybrid",
    trialSprintAvailable: true, trialSprintTask: "Video geri bildirim akışını tamamla ve 5 sporcudan kullanılabilirlik geri bildirimi topla.", compensationModel: "open-to-discussion",
  },
  {
    id: "tracekit", name: "Tracekit", category: "Developer Tools", stage: "İlk sürüm",
    desc: "Küçük yazılım ekiplerinin hata raporlarını, logları ve çözüm adımlarını tek yerde düzenlediği geliştirici aracı.",
    roles: ["Backend", "DevOps", "DevRel"], person: "DT", founder: "Duru T.", color: "bg-[#dff1ef] text-[#2f716b]",
    proof: "GitHub üzerinde çalışan CLI prototipi",
    progress: { completed: ["CLI ile hata kaydı oluşturma tamamlandı", "GitHub üzerinde çalışan prototip yayınlandı"], currentFocus: "Log bağlamı ve ekip içi paylaşım akışının geliştirilmesi", nextMilestone: "5 yazılım ekibiyle kapalı alfa" },
    time: "5–8 sa/hafta", minWeeklyHours: 5, maxWeeklyHours: 8, location: "Uzaktan", workingPreference: "remote",
    trialSprintAvailable: true, trialSprintTask: "Log bağlamı komutunu geliştir ve iki örnek projede kurulum deneyimini test et.", compensationModel: "open-to-discussion",
  },
];

export const workingPreferenceLabels: Record<WorkingPreference, string> = {
  remote: "Uzaktan", hybrid: "Hibrit", local: "Yerel / yüz yüze", flexible: "Esnek",
};

export const compensationLabels: Record<CompensationModel, string> = {
  volunteer: "Gönüllü / portfolyo", paid: "Ücretli", equity: "Hisse", "open-to-discussion": "Konuşmaya açık",
};

export function findProjectById(projectId: string | undefined) {
  return projects.find((project) => project.id === projectId);
}

export const availableSkills = ["Frontend", "Backend", "Mobile", "UI/UX", "Product", "Growth", "Data", "AI / ML", "DevOps", "B2B Sales", "DevRel"];
export const projectCategories = Array.from(new Set(projects.map((project) => project.category))).sort((a, b) => a.localeCompare(b, "tr"));
