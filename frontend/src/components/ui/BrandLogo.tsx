import { Link } from "react-router-dom";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return <Link to="/" className={`inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.035em] ${inverse ? "text-white" : "text-[#17233e]"}`} aria-label="Foundmate ana sayfa">
    <span className="relative flex size-8 items-center justify-center rounded-[11px] bg-[#5448d8] shadow-[0_6px_12px_rgba(84,72,216,0.22)]">
      <span className="absolute left-[7px] size-[11px] rounded-[4px] border-2 border-white" />
      <span className="absolute right-[7px] size-[11px] rounded-[4px] border-2 border-[#c8c4ff]" />
    </span>
    Foundmate
  </Link>;
}
