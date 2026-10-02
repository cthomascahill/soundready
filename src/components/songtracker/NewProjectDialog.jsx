import { useState } from "react";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dashed grid card that opens a dialog for creating a new Album or EP
export default function NewProjectDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Album");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const project = await base44.entities.ReleaseProject.create({
        name: name.trim(),
        project_type: type,
      });
      setOpen(false);
      setName("");
      onCreate(project);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-2xl border border-dashed border-border min-h-[140px] flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
          <Plus className="h-5 w-5 mb-2" />
          <span className="text-sm font-medium">New Album / EP</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Release Project</DialogTitle>
          <DialogDescription>Group songs together for an album or EP release.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name..."
            onKeyDown={(e) => e.key === "Enter" && create()}
            autoFocus
          />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Album">Album</SelectItem>
              <SelectItem value="EP">EP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={create} disabled={saving || !name.trim()}>
            {saving ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}