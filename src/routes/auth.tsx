import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login or Register — ShopVerse" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else { toast.success("Welcome back!"); navigate({ to: "/" }); }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else { toast.success("Account created!"); navigate({ to: "/" }); }
    }
    setBusy(false);
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("Google sign-in failed"); setBusy(false); return; }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden gradient-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center font-black">S</div>
          <div className="font-display text-xl font-extrabold">ShopVerse</div>
        </Link>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Festive offers inside
          </div>
          <h1 className="text-5xl font-black leading-tight">India's premium shopping destination.</h1>
          <p className="mt-4 opacity-90 max-w-md">Join 2M+ shoppers. Earn rewards on every order, save your favourites and check out in seconds.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            <Stat n="50K+" l="Products" />
            <Stat n="2M+" l="Customers" />
            <Stat n="19K+" l="Pincodes" />
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-72 h-72 rounded-full bg-secondary/30 blur-3xl" />
        <p className="text-xs opacity-70 relative z-10">© ShopVerse — Discover. Shop. Enjoy.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center font-black text-primary-foreground">S</div>
            <span className="font-display text-xl font-extrabold">ShopVerse</span>
          </Link>
          <h2 className="text-3xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Sign in to continue shopping." : "Start saving your favourites."}
          </p>

          <button onClick={google} disabled={busy} className="mt-6 w-full h-11 rounded-full border border-border bg-card font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted disabled:opacity-60">
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11A6.61 6.61 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name"
                className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none text-sm" />
            )}
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
              className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none text-sm" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" minLength={6}
              className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border focus:border-primary outline-none text-sm" />
            <button type="submit" disabled={busy} className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
              {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            {mode === "login" ? "New to ShopVerse?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary font-semibold hover:underline">
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
function Stat({ n, l }: { n: string; l: string }) {
  return <div><div className="text-2xl font-black">{n}</div><div className="text-xs opacity-80">{l}</div></div>;
}
