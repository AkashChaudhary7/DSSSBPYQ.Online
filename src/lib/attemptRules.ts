/**
 * V5 Mock Test Advertisement & Attempt Tracking Rules
 * 
 * Logic:
 * - Attempt 1: FREE (No ad)
 * - Attempt 2: FREE (No ad)
 * - Attempt 3: Rewarded Ad required
 * - Reattempt (Attempt 4+ or re-attempting finished mock): Rewarded Ad required
 * 
 * All attempt counts and unlock states are persisted in Local Storage.
 */

const STORAGE_KEYS = {
  ATTEMPT_COUNTS: 'dsssb_quiz_attempt_counts_v5',
  UNLOCKED_SESSION_IDS: 'dsssb_quiz_unlocked_session_ids_v5',
  PAST_ATTEMPTS: 'dsssb_attempts',
};

/**
 * Get current recorded attempt count for a given testId (default 0)
 */
export function getMockAttemptCount(testId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPT_COUNTS);
    const countsMap: Record<string, number> = raw ? JSON.parse(raw) : {};
    return typeof countsMap[testId] === 'number' ? countsMap[testId] : 0;
  } catch (err) {
    console.warn('[AttemptRules] Error reading attempt count:', err);
    return 0;
  }
}

/**
 * Check if the test has been completed at least once in past attempts
 */
export function isMockCompletedInPast(testId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAST_ATTEMPTS);
    const attempts: any[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(attempts) && attempts.some(a => a && a.testId === testId);
  } catch (err) {
    return false;
  }
}

/**
 * Determines whether a test attempt is FREE (Attempt 1 or Attempt 2) or requires a Rewarded Ad.
 */
export function isAttemptFree(testId: string): boolean {
  const count = getMockAttemptCount(testId);
  const completedPast = isMockCompletedInPast(testId);

  // If mock has already been completed before, any reattempt requires a Rewarded Ad
  if (completedPast) {
    return false;
  }

  // Attempt 1 (count 0) and Attempt 2 (count 1) are FREE
  return count < 2;
}

/**
 * Check if mock is currently unlocked for the upcoming attempt session
 */
export function isAttemptUnlocked(testId: string): boolean {
  if (isAttemptFree(testId)) return true;
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS);
    const unlockedMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    return !!unlockedMap[testId];
  } catch (err) {
    return false;
  }
}

/**
 * Marks a test attempt as unlocked after user successfully watches a Rewarded Ad.
 */
export function unlockAttemptForMock(testId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS);
    const unlockedMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    unlockedMap[testId] = true;
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS, JSON.stringify(unlockedMap));
  } catch (err) {
    console.warn('[AttemptRules] Error saving unlocked state:', err);
  }
}

/**
 * Consumes/Clears the unlocked token when the test actually launches
 */
export function consumeAttemptUnlock(testId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS);
    const unlockedMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    delete unlockedMap[testId];
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS, JSON.stringify(unlockedMap));
  } catch (err) {
    console.warn('[AttemptRules] Error clearing unlock token:', err);
  }
}

/**
 * Increments the attempt count for a testId when launched
 */
export function incrementMockAttemptCount(testId: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPT_COUNTS);
    const countsMap: Record<string, number> = raw ? JSON.parse(raw) : {};
    const current = typeof countsMap[testId] === 'number' ? countsMap[testId] : 0;
    const newCount = current + 1;
    countsMap[testId] = newCount;
    localStorage.setItem(STORAGE_KEYS.ATTEMPT_COUNTS, JSON.stringify(countsMap));
    return newCount;
  } catch (err) {
    console.warn('[AttemptRules] Error incrementing attempt count:', err);
    return 1;
  }
}
