import { ArrowRight, Check, ChevronRight, Compass, Menu, MoveUpRight, Sparkles, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { projects, type MockProject } from "../data/projects";

const skills = ["Frontend", "UI/UX", "Growth"];

function Logo() {
  return (
    <a href="#top" className="group flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.035em] text-[#17233e]" aria-label="Foundmate ana sayfa">
      <span className="relative flex size-8 items-center justify-center rounded-[11px] bg-[#5448d8] shadow-[0_6px_12px_rgba(84,72,216,0.22)]">
        <span className="absolute left-[7px] size-[11px] rounded-[4px] border-[2px] border-white" />
        <span className="absolute right-[7px] size-[11px] rounded-[4px] border-[2px] border-[#c8c4ff]" />
      </span>
      Foundmate
    </a>
  );
}

function PrimaryButton({ children, className = "", to }: { children: ReactNode; className?: string; to?: string }) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.18)] transition hover:-translate-y-0.5 hover:bg-[#463ac8] ${className}`;
  return to ? <Link to={to} className={classes}>{children}</Link> : <button type="button" className={classes}>{children}</button>;
}

function SecondaryButton({ children, className = "", to }: { children: ReactNode; className?: string; to?: string }) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe1e9] bg-white px-5 text-sm font-semibold text-[#26334f] transition hover:border-[#b9b5f0] hover:bg-[#f7f6ff] ${className}`;
  return to ? <Link to={to} className={classes}>{children}</Link> : <button type="button" className={classes}>{children}</button>;
}

function SkillTag({ children }: { children: ReactNode }) {
  return <span className="rounded-lg border border-[#e1e2e8] bg-[#f7f7f9] px-2.5 py-1 text-[11px] font-medium text-[#4e576b]">{children}</span>;
}

function Avatar({ initials, color = "bg-[#e6e2ff] text-[#4d43c2]", size = "md" }: { initials: string; color?: string; size?: "sm" | "md" }) {
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${size === "sm" ? "size-8 text-[10px]" : "size-10 text-xs"} ${color}`}>{initials}</span>;
}

function SectionIntro({ label, title, text }: { label: string; title: string; text?: string }) {
  return <div className="max-w-[660px]">
    <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#665ed2]">{label}</p>
    <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#17233e]">{title}</h2>
    {text && <p className="mt-4 max-w-[570px] text-[15px] leading-7 text-[#60697b]">{text}</p>}
  </div>;
}

function ProjectVisual() {
  return <div className="relative mx-auto h-[370px] w-full max-w-[540px] sm:h-[440px]">
    <div className="absolute left-[4%] top-[16%] h-[200px] w-[200px] rounded-full border border-dashed border-[#b7b2ef]" />
    <div className="absolute right-[8%] top-[7%] h-[310px] w-[310px] rounded-full border border-[#e5e3f8]" />
    <div className="absolute left-[10%] top-[4%] rounded-full bg-[#eeecff] px-3 py-1.5 font-mono text-[10px] font-medium text-[#665ed2]">uyum aranıyor</div>
    <div className="absolute left-[4%] top-[24%] z-10 w-[78%] rounded-2xl border border-[#dedee9] bg-white p-4 shadow-[0_22px_50px_rgba(33,40,72,0.10)] sm:left-[16%] sm:top-[28%] sm:w-[65%] sm:p-6">
      <div className="flex items-start justify-between">
        <div><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777f91]">Eğitim · Çalışan prototip</span><h3 className="mt-1.5 text-lg font-semibold tracking-[-0.035em] text-[#1d2944]">Studyloop</h3></div>
        <span className="rounded-full bg-[#eef9f2] px-2.5 py-1 text-[10px] font-semibold text-[#27734c]">2 açık rol</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#687184]">Öğrencilerin birlikte çalışma grupları bulduğu akıllı planlama alanı.</p>
      <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.11em] text-[#7a8190]">Aranan roller</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{skills.map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)}</div>
      <div className="mt-5 h-px bg-[#ececf1]" />
      <div className="mt-3 flex items-center justify-between"><div className="flex -space-x-2"><Avatar initials="EA" size="sm" /><Avatar initials="MN" size="sm" color="bg-[#ffe7d9] text-[#c55b2c]" /></div><span className="text-[11px] text-[#687184]">Haftada 8–10 saat</span></div>
    </div>
    <div className="absolute right-0 top-[54%] z-20 w-[164px] rounded-2xl border border-[#dedee9] bg-[#fcfcff] p-3 shadow-[0_13px_30px_rgba(33,40,72,0.10)] sm:top-[50%] sm:w-[180px] sm:p-3.5">
      <div className="flex gap-2.5"><Avatar initials="NL" size="sm" color="bg-[#dceffc] text-[#27709a]" /><div><p className="text-xs font-semibold text-[#26334f]">Nilay L.</p><p className="text-[10px] text-[#748094]">UI/UX Designer</p></div></div>
      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-medium text-[#655cd0]"><Check className="size-3" /> UI/UX eşleşmesi</div>
    </div>
    <div className="absolute bottom-0 left-0 z-20 w-[164px] rounded-2xl border border-[#dedee9] bg-[#fcfcff] p-3 shadow-[0_13px_30px_rgba(33,40,72,0.10)] sm:w-[184px] sm:p-3.5">
      <div className="flex gap-2.5"><Avatar initials="AR" size="sm" color="bg-[#e6f0db] text-[#4c7541]" /><div><p className="text-xs font-semibold text-[#26334f]">Arda R.</p><p className="text-[10px] text-[#748094]">Frontend Developer</p></div></div>
      <div className="mt-2.5 flex items-center gap-1 text-[10px] font-medium text-[#655cd0]"><Check className="size-3" /> Aranan role uygun</div>
    </div>
    <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 540 440" fill="none" aria-hidden="true"><path d="M145 360C166 334 169 308 212 294M408 263C381 248 366 222 352 199" stroke="#AAA4EB" strokeWidth="1.5" strokeDasharray="4 5"/><circle cx="213" cy="294" r="4" fill="#6C62D9"/><circle cx="353" cy="199" r="4" fill="#6C62D9"/></svg>
  </div>;
}

function ProjectCard({ project }: { project: MockProject }) {
  return <article className="group rounded-2xl border border-[#e1e2e8] bg-white p-5 shadow-[0_5px_16px_rgba(37,44,72,0.035)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(37,44,72,0.09)]">
    <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#757e90]">{project.category}</p><h3 className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-[#1e2a45]">{project.name}</h3></div><span className="rounded-full bg-[#f3f2ff] px-2.5 py-1 text-[10px] font-semibold text-[#5750be]">{project.stage}</span></div>
    <p className="mt-3 min-h-[64px] text-[13px] leading-5 text-[#636d80]">{project.desc}</p>
    <div className="mt-4 rounded-xl bg-[#f8f8fa] px-3 py-2.5 text-[11px] font-medium text-[#4f586b]"><span className="mr-1.5 text-[#685fd4]">↗</span>{project.proof}</div>
    <div className="mt-4 flex flex-wrap gap-1.5">{project.roles.map((role) => <SkillTag key={role}>{role}</SkillTag>)}</div>
    <div className="mt-5 flex items-center justify-between border-t border-[#ededf1] pt-4"><div className="flex items-center gap-2"><Avatar initials={project.person} color={project.color} size="sm"/><span className="text-[11px] text-[#5f6879]">{project.founder} · Kurucu</span></div><span className="text-[11px] text-[#747e91]">{project.time}</span></div>
    <p className="mt-3 text-[11px] text-[#747e91]">{project.location}</p>
  </article>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  useEffect(() => { document.title = "Foundmate — Doğru insanları bul, birlikte gerçeğe dönüştür"; }, []);

  return <main id="top" className="min-w-0 overflow-x-clip bg-[#fdfcf8] text-[#17233e]">
    <header className="sticky top-0 z-50 border-b border-transparent bg-[#fdfcf8]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 lg:px-0"><Logo />
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#566074] md:flex"><a className="hover:text-[#5448d8]" href="#projects">Projeleri Keşfet</a><a className="hover:text-[#5448d8]" href="#how">Nasıl Çalışır?</a><a className="hover:text-[#5448d8]" href="#community">Topluluk</a></nav>
        <div className="hidden items-center gap-4 md:flex"><Link className="text-[13px] font-semibold text-[#3a465d]" to="/app">Giriş Yap</Link><PrimaryButton to="/onboarding">Ücretsiz Başla <ArrowRight className="size-4" /></PrimaryButton></div>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="inline-flex size-11 items-center justify-center rounded-xl border border-[#e1e2e8] text-[#33405a] md:hidden" aria-controls="mobile-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <div id="mobile-navigation" className="border-t border-[#e5e5ea] bg-[#fdfcf8] px-5 py-4 md:hidden"><nav className="flex flex-col gap-4 text-sm font-medium"><a onClick={closeMenu} href="#projects">Projeleri Keşfet</a><a onClick={closeMenu} href="#how">Nasıl Çalışır?</a><a onClick={closeMenu} href="#community">Topluluk</a><Link onClick={closeMenu} to="/app">Giriş Yap</Link><PrimaryButton to="/onboarding" className="w-full">Ücretsiz Başla</PrimaryButton></nav></div>}
    </header>

    <section className="relative mx-auto grid max-w-[1180px] items-center gap-8 px-5 pb-16 pt-14 lg:grid-cols-[1.03fr_.97fr] lg:gap-12 lg:px-0 lg:pb-16 lg:pt-16">
      <div className="max-w-[620px]"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dedbf8] bg-[#f5f3ff] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.11em] text-[#6159c7]"><span className="size-1.5 rounded-full bg-[#665ed5]" />Fikirler insanlarla gerçeğe dönüşür</div>
        <h1 className="font-display text-[clamp(2.7rem,4.4vw,4rem)] font-semibold leading-[0.99] tracking-[-0.055em] text-[#17233e]">Doğru insanları bul.<br/><span className="text-[#5a51c9]">Birlikte gerçeğe</span> dönüştür.</h1>
        <p className="mt-6 max-w-[550px] text-[16px] leading-7 text-[#60697b]">Foundmate; fikri, yeteneği veya üretme isteği olan insanların birbirini bulduğu, projeler oluşturduğu ve birlikte çalışmayı deneyebildiği platformdur.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><PrimaryButton to="/onboarding" className="px-6">Proje Oluştur <ArrowRight className="size-4" /></PrimaryButton><SecondaryButton to="/discover" className="px-6">Projeleri Keşfet <Compass className="size-4" /></SecondaryButton></div>
      </div><ProjectVisual />
    </section>

    <section id="community" className="border-y border-[#e7e5e0] bg-[#f6f4ef]"><div className="mx-auto flex max-w-[1180px] flex-col items-start gap-5 px-5 py-9 md:flex-row md:items-center md:justify-between lg:px-0"><p className="max-w-[660px] text-[15px] leading-6 text-[#505a6c]">Fikir sahiplerini, geliştiricileri, tasarımcıları ve büyüme odaklı insanları aynı yerde buluşturmak için geliştiriliyor.</p><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#777e8e]"><span className="flex -space-x-2"><Avatar initials="E" size="sm"/><Avatar initials="A" size="sm" color="bg-[#f5ded6] text-[#bf6943]"/><Avatar initials="N" size="sm" color="bg-[#dcefdc] text-[#50734b]"/></span> Erken erişim yakında</div></div></section>

    <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-0 lg:py-28"><SectionIntro label="Neden Foundmate?" title="İyi fikirler ve iyi insanlar çoğu zaman birbirini kaçırıyor." text="Birlikte üretme niyeti net olmadığında, en iyi fırsatlar bile sohbet akışında kayboluyor." />
      <div className="mt-10 grid gap-4 md:grid-cols-3">{[["01", "Fikrin var ama doğru ekibe ulaşamıyorsun", "Neye ihtiyaç duyduğunu ve ne kadar ilerlediğini görünür kılmak, doğru insanlarla tanışmanın ilk adımı."], ["02", "Yeteneğin var ama katkı sağlayacağın projeyi bulamıyorsun", "Becerine, ilgi alanına ve ayırabileceğin zamana gerçekten uyan projeleri bir arada gör."], ["03", "Discord mesajları ve ilanlar kısa sürede kayboluyor", "Geçici çağrılar yerine; bağlamı, beklentiyi ve ilerlemeyi açık projelerle bağlantı kur."]].map(([number, title, text]) => <article key={number} className="rounded-2xl border border-[#e2e2e7] bg-white p-6"><span className="font-mono text-[11px] font-medium text-[#6a61ce]">{number}</span><h3 className="mt-5 text-[19px] font-semibold leading-6 tracking-[-0.035em] text-[#202c46]">{title}</h3><p className="mt-3 text-[13px] leading-6 text-[#667082]">{text}</p></article>)}</div>
    </section>

    <section id="how" className="border-y border-[#e7e5e0] bg-[#f4f3f8]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-0 lg:py-28"><div className="flex flex-col justify-between gap-8 md:flex-row"><SectionIntro label="Nasıl çalışır?" title="Önce birlikte üretin. Sonra büyük karar verin." text="Foundmate, doğrudan ortaklık yerine kısa bir deneme sprinti ile çalışma uyumunu görmeyi önerir." /><div className="max-w-[260px] rounded-2xl border border-[#d6d2f5] bg-[#eae8ff] p-4"><Sparkles className="size-5 text-[#5a50c6]"/><p className="mt-3 text-sm font-semibold text-[#343164]">Deneme sprinti</p><p className="mt-1 text-xs leading-5 text-[#5e6091]">Kısa bir hedef belirleyin, birlikte çalışın, sonra devam etmeye karar verin.</p></div></div>
      <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Profilini oluştur", "Projeni veya katkını göster", "Doğru insanlarla bağlantı kur", "Kısa bir deneme sprintinde birlikte üret"].map((step, index) => <div key={step} className={`relative rounded-2xl border p-5 ${index === 3 ? "border-[#b9b3f2] bg-[#efedff]" : "border-[#e0dfe7] bg-[#fcfcfe]"}`}><>{index === 3 && <span className="mb-3 inline-flex rounded-full border border-[#d2cef8] bg-white/70 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#5e55c8]">Foundmate farkı</span>}</><span className="inline-flex size-8 items-center justify-center rounded-full bg-[#554bd2] font-mono text-[11px] font-semibold text-white">0{index + 1}</span><h3 className="mt-7 text-[16px] font-semibold leading-5 tracking-[-0.025em] text-[#26314c]">{step}</h3>{index === 3 && <p className="mt-2 text-xs leading-5 text-[#687184]">Ortaklık bir unvan değil; önce kanıtlanan bir çalışma biçimi.</p>}</div>)}</div>
    </div></section>

    <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-0 lg:py-28"><div className="grid gap-4 md:grid-cols-2"><article className="relative overflow-hidden rounded-3xl bg-[#1d2944] p-7 text-white sm:p-9"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#aaa7ea]">Proje sahipleri için</span><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em]">Bir projen mi var?</h2><p className="mt-4 max-w-[430px] text-sm leading-6 text-[#cbd1de]">Tamamladığın işleri, aradığın rolleri, beklentilerini ve haftalık ayırabileceğin zamanı açıkça paylaş. Doğru katkıyı birlikte bul.</p><Link to="/onboarding" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">Projemi Paylaş <ArrowRight className="size-4" /></Link><span className="absolute -bottom-12 -right-12 size-44 rounded-full border-[20px] border-[#49448e]" /></article>
      <article className="relative overflow-hidden rounded-3xl border border-[#dcd9f7] bg-[#eeecff] p-7 sm:p-9"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6259c7]">Katkı sunanlar için</span><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-[#27245b]">Bir projeye katılmak mı istiyorsun?</h2><p className="mt-4 max-w-[430px] text-sm leading-6 text-[#555c80]">Becerine, ilgi alanına, çalışma tercihine ve ayırabileceğin zamana göre sana gerçekten uyan projeleri keşfet.</p><Link to="/discover" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5147c8]">Proje Bul <ArrowRight className="size-4" /></Link><span className="absolute -bottom-10 -right-9 size-40 rounded-full border-[18px] border-[#d6d2ff]" /></article></div></section>

    <section id="projects" className="border-y border-[#e7e5e0] bg-[#f9f8f5]"><div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-0 lg:py-28"><div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"><SectionIntro label="Keşfet" title="Somut adım atan projeler." text="Burada sadece fikir değil; ilerleme, ihtiyaç ve çalışma biçimi de görünür." /><Link to="/discover" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5148c7]">Tüm projeleri gör <ChevronRight className="size-4" /></Link></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{projects.slice(0, 4).map((project) => <ProjectCard key={project.name} project={project} />)}</div></div></section>

    <section className="mx-auto max-w-[980px] px-5 py-20 text-center lg:py-28"><span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#eae7ff]"><MoveUpRight className="size-5 text-[#574dcc]" /></span><h2 className="mx-auto mt-5 max-w-[750px] font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[#17233e]">Fikrin veya yeteneğin görünmeden kaybolmasın.</h2><p className="mx-auto mt-5 max-w-[610px] text-[15px] leading-7 text-[#626c7e]">Foundmate ile ne yapmak istediğini göster, doğru insanlarla tanış ve ilk adımı birlikte at.</p><PrimaryButton to="/onboarding" className="mt-8 px-6">Foundmate’a Katıl <ArrowRight className="size-4" /></PrimaryButton></section>

    <footer className="border-t border-[#e7e5e0]"><div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-0"><Logo /><div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-medium text-[#667084]"><a href="#projects">Projeler</a><a href="#community">Topluluk</a><a href="#about">Hakkımızda</a><a href="#privacy">Gizlilik</a><a href="#terms">Kullanım Koşulları</a></div><p className="text-[11px] text-[#9298a4]">© 2026 Foundmate</p></div></footer>
  </main>;
}
