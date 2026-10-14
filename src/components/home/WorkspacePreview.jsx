import { Art, DropZoneMock, FolderChipsMock, GroupMock, SongRowMock, VersionRowMock } from "@/components/home/mockPieces";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/cbca442cd_generated_76ab93fb.png";

// The hero's main visual: an accurate, static preview of the workspace —
// Vault songs and project folders, the stage-grouped Tracker, song versions —
// with SAM as a small supporting element, not the star.
export default function WorkspacePreview() {
  return (
    <div className="relative text-left mb-8">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* window bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/30">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          </div>
          <p className="ml-2 text-xs font-semibold text-muted-foreground">SoundReady — Vault</p>
        </div>

        <div className="p-4 sm:p-5 grid lg:grid-cols-2 gap-4 bg-gradient-to-br from-card via-card to-secondary/20">
          {/* Vault side: project folders and songs */}
          <div className="space-y-3">
            <FolderChipsMock />
            <SongRowMock title="Midnight Drive" status="Mastered" dot="bg-orange-400" />
            <SongRowMock title="Neon Rain" status="Mixed" dot="bg-purple-400" />
            <SongRowMock title="Golden Hour" status="Released" dot="bg-green-400" />
            <DropZoneMock />
          </div>

          {/* Tracker side: stage groups and versions */}
          <div className="space-y-3">
            <GroupMock label="In production" count={2} dot="bg-blue-400" rows={["Neon Rain", "Static Bloom"]} />
            <GroupMock label="Ready to release" count={1} dot="bg-orange-400" rows={["Midnight Drive"]} />
            <GroupMock label="Released" count={2} dot="bg-green-400" rows={["Golden Hour", "Paper Planes"]} />
            <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Art className="h-6 w-6" /> Midnight Drive — versions
              </p>
              <VersionRowMock label="Master V1" latest />
              <VersionRowMock label="Mix V2" />
            </div>
          </div>
        </div>
      </div>

      {/* SAM, the supporting element */}
      <div className="absolute -bottom-5 left-4 sm:-left-5 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-card px-3.5 py-2.5 shadow-xl max-w-[260px]">
        <img src={SAM_IMG} alt="SAM, your AI manager" className="h-8 w-8 shrink-0" />
        <p className="text-xs text-foreground/90 leading-snug">
          "Midnight Drive is mastered — want me to prep a demo link for it?"
        </p>
      </div>
    </div>
  );
}