import { VAULT_STATUS_STYLES } from "@/lib/vaultStatus";

// Color-coded pill showing the stage a song is currently at — same
// ladder and palette as the Vault's stage badges
export default function StageBadge({ stage }) {
  return (
    <span
      className={`inline-block whitespace-nowrap text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
        stage ? stage.badge : VAULT_STATUS_STYLES.Idea
      }`}
    >
      {stage ? stage.status : "Idea"}
    </span>
  );
}