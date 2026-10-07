// Shared subscription-tier helpers used across the app.
// Admins always have full access.

export function getTier(user) {
  if (!user) return "free";
  // Admin-only preview: ?previewTier=pro (or free) shows exactly what that plan sees.
  // Safe because admins already have full access; this only changes the view.
  const preview = new URLSearchParams(window.location.search).get("previewTier");
  if (user.role === "admin" && ["free", "pro"].includes(preview)) return preview;
  if (user.role === "admin") return "ai_manager";
  return user.subscription_tier || "free";
}

export const hasAIManager = (user) => getTier(user) === "ai_manager";

export const isProOrAbove = (user) => ["pro", "ai_manager"].includes(getTier(user));

export function trialDaysLeft(user) {
  if (!user?.trial_ends_at) return 0;
  return Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000));
}