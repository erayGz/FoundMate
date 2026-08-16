import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { BrandLogo } from "../components/ui/BrandLogo";
import { useAuth } from "../features/auth/AuthContext";
import { usePageTitle } from "../utils/usePageTitle";

export default function RegisterPage() {
  const { register, isAuthenticated, isRestoring } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const safeReturn = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/app";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  usePageTitle("Kayıt ol");

  if (isRestoring) {
    return <div className="min-h-screen bg-[#f7f6f2] text-[#17233e]"><div className="flex min-h-screen items-center justify-center text-sm font-medium text-[#687184]">Oturum kontrol ediliyor…</div></div>;
  }

  if (isAuthenticated) {
    return <Navigate to={safeReturn} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
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
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#675fd0]">Kayıt ol</p>
      <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-[-0.04em]">Foundmate’e katıl.</h1>
      <p className="mt-3 text-center text-sm leading-6 text-[#687184]">Hesabınla proje oluşturabilir, keşfedebilir ve başvurabilirsin.</p>

      <form onSubmit={handleSubmit} className="mt-9 w-full rounded-3xl border border-[#e0e0e6] bg-white p-6 shadow-[0_18px_50px_rgba(37,44,72,0.06)] sm:p-8">
        <div className="grid gap-5">
          <label className="text-sm font-semibold text-[#344057]">Adın soyadın
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" maxLength={100} placeholder="Örn. Deniz Yılmaz" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#17233e] outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" />
          </label>
          <label className="text-sm font-semibold text-[#344057]">E-posta
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" maxLength={256} placeholder="orn. deniz@ornek.com" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#17233e] outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" />
          </label>
          <label className="text-sm font-semibold text-[#344057]">Şifre
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" minLength={8} placeholder="En az 8 karakter" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#17233e] outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" />
            <span className="mt-1.5 block text-[11px] leading-4 text-[#7a8394]">En az 8 karakter; büyük, küçük harf, rakam ve özel karakter içermelidir.</span>
          </label>
          <label className="text-sm font-semibold text-[#344057]">Şifre tekrar
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" minLength={8} placeholder="••••••••" className="mt-2 block min-h-11 w-full rounded-xl border border-[#dfe1e7] bg-[#fcfcfb] px-3.5 text-sm font-normal text-[#17233e] outline-none transition focus:border-[#7068d8] focus:ring-2 focus:ring-[#7068d8]/15" />
          </label>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-[#f3d3d3] bg-[#fdf2f2] px-3.5 py-2.5 text-sm font-medium text-[#b3312b]">{error}</p>}

        <button type="submit" disabled={submitting} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5448d8] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(84,72,216,0.18)] transition hover:bg-[#463ac8] disabled:cursor-not-allowed disabled:opacity-45">{submitting ? "Kayıt oluşturuluyor…" : "Kayıt ol"}<ArrowRight className="size-4" /></button>
      </form>

      <p className="mt-6 text-sm text-[#687184]">Zaten hesabın var mı? <Link to="/login" className="font-semibold text-[#5148c7] hover:text-[#3f37a8]">Giriş yap</Link></p>
    </section>
  </main>;
}