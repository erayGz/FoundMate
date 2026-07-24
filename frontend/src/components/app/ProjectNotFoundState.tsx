import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export function ProjectNotFoundState() {
  return <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
    <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5750be]"><SearchX className="size-6" /></span>
    <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.045em] text-[#17233e]">Proje bulunamadı</h1>
    <p className="mt-3 text-sm leading-6 text-[#687184]">Bu proje kaldırılmış veya bağlantı yanlış yazılmış olabilir.</p>
    <Link to="/discover" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white">Projeleri keşfet</Link>
  </section>;
}
