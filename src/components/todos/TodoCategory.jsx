import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";

// Small pill showing the folder label a to-do is filed under.
export function TodoCategoryTag({ category }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80 bg-secondary rounded-full px-2 py-0.5 whitespace-nowrap">
      <Tag className="h-2.5 w-2.5" />
      {category}
    </span>
  );
}

// Free-form folder label, with suggestions from folders already in use.
export function TodoCategoryInput({ value, onChange, categories = [], className = "w-40" }) {
  return (
    <div className={className}>
      <Input
        value={value}
        list="todo-category-options"
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Money"
        className="text-sm"
        aria-label="Category"
      />
      <datalist id="todo-category-options">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}