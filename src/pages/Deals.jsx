import SEO from "@/components/SEO";
import CatalogValuation from "@/components/vault/CatalogValuation";
import DealsOutreach from "@/components/deals/DealsOutreach";

export default function Deals() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Deals — SoundReady" description="Advances on your catalog and Sam's deal outreach to labels, distributors and sync houses." />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Digital Manager</p>
          <h1 className="font-heading text-3xl font-bold">Deals</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Advances, label outreach and everything Sam is working on your behalf.</p>
        </div>

        <CatalogValuation />

        <DealsOutreach />
      </div>
    </div>
  );
}