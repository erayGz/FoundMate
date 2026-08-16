import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { BrandLogo } from "../components/ui/BrandLogo";
import { useAuth } from "../features/auth/AuthContext";
import { usePageTitle } from "../utils/usePageTitle";

export default function LoginPage() {
  const { login, isAuthenticated, isRestoring } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const safeReturn = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  usePageTitle("Giriş yap");

  if (isRestoring) {
    return <div className="min-h-screen bg-[#f7f6f2] text-[#17233e]"><div className="flex min-h-screen items-center justify-center text-sm font-medium text-[#687184]">Oturum kontrol ediliyor…</div></div>;
  }

  if (isAuthenticated) {
    return <Navigate to={safeReturn} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(safeReturn, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="min-h-screen bg-[#f7f6f2] text-[#17233e]">
    <header className="border-b border-[#e5e4df] bg-[#fdfcf8]"><div className="mx-auto flex h-[72px] max-w-[1040px] items-center justify-between px-5"><BrandLogo /><Link to="/" className="text-sm font-semibold text-[#657084] hover:text-[#5448d8]">Ana sayfaya dön</Link></div></header>
    <section className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-16 sm:py-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Giriş yap</p>
      <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-[-0.04em]">Tekrar hoş geldin.</h1>
      <p className="mt-3 text-center text-sm leading-6 text-[#687184]">Hesabına giriş yaparak projelerine ve başvurularına devam et.</p>

      <form onSubmit={handleSubmit} className="mt-9 w-full rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_18px_50px_rgba(37,44,72,0.06)] sm:p-8">
        <div className="grid gap-5">
          <label className="text-sm font-semibold text-[#344057]">E-posta
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="orn. deniz@ornek.com" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#17233e] outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" />
          </label>
          <label className="text-sm font-semibold text-[#344057]">Şifre
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" minLength={8} placeholder="••••••••" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#17233e] outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" />
          </label>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-[#f3d3d3] bg-[#fdf2f2] px-3.5 py-2.5 text-sm font-medium text-[#b3312b]">{error}</p>}

        <button type="submit" disabled={submitting} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.18)] transition hover:bg-[#463ac8] disabled:cursor-not-allowed disabled:opacity-45">{submitting ? "Giriş yapılıyor…" : "Giriş yap"}<ArrowRight className="size-4" /></button>
      </form>

      <p className="mt-6 text-sm text-[#687184]">Hesabın yok mu? <Link to="/register" className="font-semibold text-[#5148c7] hover:text-[#3f37a8]">Ücretsiz kayıt ol</Link></p>
    </section>
  </main>;
}