import { ClipboardList, Compass, FolderKanban, Home, Menu, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useProfile } from "../../features/onboarding/ProfileContext";
import { BrandLogo } from "../ui/BrandLogo";

const navigation = [
  { to: "/app", label: "Ana Sayfa", icon: Home },
  { to: "/discover", label: "Projeleri Keşfet", icon: Compass },
  { to: "/my-project", label: "Projem", icon: FolderKanban },
  { to: "/applications", label: "Başvurularım", icon: ClipboardList },
];

const upcomingNavigation = [
  { label: "Bağlantılar — Yakında", icon: UsersRound },
];

function NavigationLink({ to, label, icon: Icon, onClick }: typeof navigation[number] & { onClick?: () => void }) {
  return <NavLink to={to} end={to === "/app"} onClick={onClick} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[#8a83e8] ${isActive ? "bg-[#eeecff] text-[#4e44c5]" : "text-[#647084] hover:bg-[#f6f5f1] hover:text-[#26334f]"}`}>
    <Icon className="size-[18px]" />{label}
  </NavLink>;
}

function UpcomingLinks() {
  return <>{upcomingNavigation.map(({ label, icon: Icon }) => <span key={label} aria-disabled="true" className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-[#a1a5ae]"><Icon className="size-[18px]" />{label}</span>)}</>;
}

export function AppShell() {
  const { profile } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = profile?.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toLocaleUpperCase("tr-TR") ?? "FM";

  return <div className="min-h-screen bg-[#f7f6f2] text-[#17233e]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-[#e4e3df] bg-[#fdfcf8] p-5 lg:flex lg:flex-col">
      <BrandLogo />
      <nav className="mt-10 space-y-1.5" aria-label="Uygulama navigasyonu">{navigation.map((item) => <NavigationLink key={item.to} {...item} />)}<div className="my-3 border-t border-[#ecebe7]" /><UpcomingLinks /></nav>
      {profile ? <Link to="/onboarding?mode=edit" className="mt-auto rounded-2xl border border-[#e2e2e8] bg-white p-3.5 transition hover:border-[#c8c4ec]"><div className="flex items-center gap-3"><span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e6e2ff] text-xs font-bold text-[#4d43c2]">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#26334f]">{profile.name}</p><p className="truncate text-[11px] text-[#758094]">{profile.headline}</p></div></div></Link> : <Link to="/onboarding" className="mt-auto rounded-2xl border border-[#d8d5ed] bg-[#f5f3ff] p-4 text-sm font-semibold text-[#5148c7]">Başvuru için profilini tamamla</Link>}
    </aside>

    <header className="sticky top-0 z-40 border-b border-[#e4e3df] bg-[#fdfcf8]/95 px-5 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between"><BrandLogo /><button type="button" className="inline-flex size-11 items-center justify-center rounded-xl border border-[#e1e2e8] focus-visible:ring-2 focus-visible:ring-[#8a83e8]" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="app-mobile-navigation" aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}>{menuOpen ? <X /> : <Menu />}</button></div>
      {menuOpen && <nav id="app-mobile-navigation" className="mt-3 space-y-1 border-t border-[#ecebe7] pt-3" aria-label="Mobil uygulama navigasyonu">{navigation.map((item) => <NavigationLink key={item.to} {...item} onClick={() => setMenuOpen(false)} />)}<div className="my-3 border-t border-[#ecebe7]" /><UpcomingLinks />{profile && <Link to="/onboarding?mode=edit" onClick={() => setMenuOpen(false)} className="mt-3 flex min-h-11 items-center rounded-xl px-3.5 text-sm font-semibold text-[#5148c7]">Profili düzenle</Link>}</nav>}
    </header>

    <main className="min-w-0 overflow-x-clip lg:pl-[260px]"><Outlet /></main>
  </div>;
}
