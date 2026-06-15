import { Input } from "@/components/ui/input";

export function FieldGroup({ label, tip, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {tip && <p className="text-xs text-primary/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">{tip}</p>}
    </div>
  );
}

export function TextField({ label, placeholder, value, onChange, tip }) {
  return (
    <FieldGroup label={label} tip={tip}>
      <Input placeholder={placeholder} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </FieldGroup>
  );
}

export function NumberField({ label, placeholder, value, onChange }) {
  return (
    <FieldGroup label={label}>
      <Input type="number" placeholder={placeholder} value={value || ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
    </FieldGroup>
  );
}

export function SelectField({ label, value, onChange, options, tip }) {
  return (
    <FieldGroup label={label} tip={tip}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
        ))}
      </select>
    </FieldGroup>
  );
}

export function YesNoField({ label, value, onChange, tip }) {
  return (
    <FieldGroup label={label} tip={tip}>
      <div className="flex gap-2">
        {["Yes", "No", "Sometimes"].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${value === opt ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </FieldGroup>
  );
}

export function MultiSelectField({ label, value = [], onChange, options }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <FieldGroup label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${value.includes(opt) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </FieldGroup>
  );
}

export function TextareaField({ label, placeholder, value, onChange, rows = 3 }) {
  return (
    <FieldGroup label={label}>
      <textarea
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />
    </FieldGroup>
  );
}