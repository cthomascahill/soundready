import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n/LanguageContext";

/**
 * Shared header for the public pages (Home, How It Works, Pricing).
 * Logged-out visitors get Log In + Sign Up; logged-in visitors keep those
 * and also see a Dashboard button.
 */
export default function PublicNav({ showHome = true }) {
  const { user } = useAuth();
  const { t } = useLang();
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `text-sm transition-colors hidden sm:block ${
      pathname === path ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0"><SoundReadyLogo size={28} /></Link>
        <Link
          to="/pricing"
          className="hidden sm:block flex-1 text-center text-[11px] lg:text-xs font-bold tracking-wide text-primary hover:opacity-80 transition-opacity"
        >
          Early Bird Special · Artist Pro, just $9.99/month
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          {pathname === "/pricing" ? (
            <Link to="/" className={linkClass("/")}>{t("Home")}</Link>
          ) : (
            <>
              {showHome && <Link to="/" className={linkClass("/")}>{t("Home")}</Link>}
              <Link to="/pricing" className={linkClass("/pricing")}>{t("Pricing")}</Link>
            </>
          )}
          <Button size="sm" variant="ghost" className="font-semibold hidden sm:inline-flex" onClick={() => base44.auth.redirectToLogin()}>
            {t("Log In")}
          </Button>
          <Button size="sm" variant="outline" className="font-semibold" onClick={() => base44.auth.redirectToLogin()}>
            {t("Sign Up")}
          </Button>
          {user && (
            <Link to="/history">
              <Button size="sm" className="font-semibold">{t("Dashboard")}</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}