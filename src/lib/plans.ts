export const PLANS = {
  FREE: { name: 'Free', price: 0, audits: 3, teamMembers: 1, branding: false },
  PRO: { name: 'Pro', price: 499, audits: 50, teamMembers: 1, branding: true },
  AGENCY: { name: 'Agency', price: 999, audits: Number.POSITIVE_INFINITY, teamMembers: 5, branding: true }
} as const;

export type PlanKey = keyof typeof PLANS;
