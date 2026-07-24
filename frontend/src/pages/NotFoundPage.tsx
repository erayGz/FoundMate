import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../components/ui/BrandLogo";
import { usePageTitle } from "../utils/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Sayfa bulunamadı");
  return <main className="flex min-h-screen flex-col bg-[#fdfcf8] px-5 py-6 text-[#17233e]"><BrandLogo /><div className="m-auto max-w-xl text-center"><p className="font-mono text-xs font-semibold tracking-[0.16em] text-[#6259cf]">404</p><h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-semibold tracking-[-0.05em]">Bu sayfa henüz burada değil.</h1><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#687184]">Adres değişmiş veya yanlış yazılmış olabilir. Foundmate ana sayfasından devam edebilirsin.</p><Link to="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white"><ArrowLeft className="size-4" />Ana sayfaya dön</Link></div></main>;
}
