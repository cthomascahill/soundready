import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

// Switches the app between dark (default) and light mode, persisted per browser
export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 text-left">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}