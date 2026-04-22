export const FREE_PLAN_USES = 3;
export const BASIC_PLAN_MONTHLY_USES = 50;
export const UNLIMITED_PLAN_USES = 999999;

export function isMeteredPlan(plan: string): plan is 'free' | 'basic' {
  return plan === 'free' || plan === 'basic';
}
