import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/i18n/LanguageContext";

/**
 * Shared header for the public pages (Home, How It Works, Pricing).
 * Logged-out visitors get Log In + Sign Up; logged-in visitors get a
 * Dashboard button instead.
 */
export default function PublicNav({ showHome = true }) {
  const { isAuthenticated } = useAuth();
  const { t } = useLang();
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `text-sm transition-colors hidden sm:block ${
      pathname === path ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
    }`;

  const earlyBirdText = (
    <>
      Early Bird Special · Digital Manager for life, just $37{" "}
      <span className="line-through text-red-400">$89/month</span>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-4 relative">
          <Link to="/" className="shrink-0 z-10"><SoundReadyLogo size={28} /></Link>

          {/* Centered banner on wide screens; its own row below the nav on tablet and mobile */}
          <div className="absolute inset-x-0 hidden lg:flex justify-center pointer-events-none">
            <Link
              to="/pricing"
              className="max-w-md text-center text-sm font-bold tracking-wide text-primary hover:opacity-80 transition-opacity pointer-events-auto"
            >
              {earlyBirdText}
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            {pathname === "/pricing" ? (
              <Link to="/" className={linkClass("/")}>{t("Home")}</Link>
            ) : (
              <>
                {showHome && <Link to="/" className={linkClass("/")}>{t("Home")}</Link>}
                <Link to="/pricing" className={linkClass("/pricing")}>{t("Pricing")}</Link>
              </>
            )}
            {isAuthenticated ? (
              <Button asChild size="sm" className="font-semibold">
                <Link to="/dashboard">{t("Dashboard")}</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="font-semibold">
                  <Link to="/login">{t("Log In")}</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="font-semibold">
                  <Link to="/register">{t("Sign Up")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Early bird banner sits on its own centered row on tablet and mobile,
            so it never merges into the nav buttons */}
        <div className="lg:hidden pb-2 flex justify-center">
          <Link
            to="/pricing"
            className="text-center text-xs font-bold tracking-wide text-primary hover:opacity-80 transition-opacity"
          >
            {earlyBirdText}
          </Link>
        </div>
      </div>
    </header>
  );
}