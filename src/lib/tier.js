// Shared subscription-tier helpers used across the app.
// Admins always have full access.

// The account's real tier, ignoring the view-as preview
export function rawTier(user) {
  if (!user) return "free";
  if (user.role === "admin") return "ai_manager";
  return user.subscription_tier || "free";
}

export function getTier(user) {
  const real = rawTier(user);
  // View-as preview: AI Manager accounts already have full access, so letting
  // them view the app as Free or Artist Pro is safe. Set from the sidebar switcher.
  if (real === "ai_manager") {
    const preview = sessionStorage.getItem("sr_preview_tier");
    if (preview === "free" || preview === "pro") return preview;
  }
  return real;
}

export const hasAIManager = (user) => getTier(user) === "ai_manager";

export const isProOrAbove = (user) => ["pro", "ai_manager"].includes(getTier(user));

export function trialDaysLeft(user) {
  if (!user?.trial_ends_at) return 0;
  return Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000));
}