/**
 * Monthly / yearly billing toggle shared by the pricing page and checkout.
 */
export default function BillingToggle({ value, onChange, yearlyNote }) {
  const base = "h-8 px-4 text-xs font-semibold rounded-lg transition-colors";
  const active = "bg-card text-foreground shadow-sm";
  const idle = "text-muted-foreground hover:text-foreground";
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
      <button
        type="button"
        className={`${base} ${value === "monthly" ? active : idle}`}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`${base} ${value === "yearly" ? active : idle}`}
        onClick={() => onChange("yearly")}
      >
        Yearly{yearlyNote ? ` — ${yearlyNote}` : ""}
      </button>
    </div>
  );
}