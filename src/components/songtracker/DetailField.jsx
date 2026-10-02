// Small labeled block used inside the expanded song panel
export default function DetailField({ label, children }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}