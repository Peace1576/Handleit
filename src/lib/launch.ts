/**
 * Launch date configuration for the $97 Lifetime Deal.
 * The deal is shown for LIFETIME_DEAL_DAYS days from LAUNCH_DATE,
 * then automatically hidden from the pricing page and landing page.
 */

/** The day HandleIt went live — DO NOT change this after launch. */
export const LAUNCH_DATE = new Date('2026-04-04T00:00:00Z');

/** How many days the lifetime deal is available after launch. */
export const LIFETIME_DEAL_DAYS = 90;

/** Expiry timestamp in ms (pre-computed for performance). */
const EXPIRY_MS = LAUNCH_DATE.getTime() + LIFETIME_DEAL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Returns true while the lifetime deal window is still open.
 * Safe to call on server or client — uses Date.now() which is always available.
 */
export function isLifetimeDealActive(): boolean {
  return Date.now() < EXPIRY_MS;
}

/**
 * Returns the number of full days remaining in the lifetime deal window.
 * Returns 0 once the deal has expired.
 */
export function lifetimeDaysLeft(): number {
  return Math.max(0, Math.ceil((EXPIRY_MS - Date.now()) / (24 * 60 * 60 * 1000)));
}
