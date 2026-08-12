/**
 * V5 Mock Test Advertisement & Access Tracking Rules
 * 
 * Rules:
 * - First 2 DISTINCT mock tests accessed for the first time are FREE.
 * - From the 3rd DISTINCT mock test onward, a Rewarded Ad is required to unlock.
 * - Reattempts (any test already accessed or completed before) ALWAYS require a Rewarded Ad.
 * - All access history is persisted across reloads and app restarts using testId.
 */

const STORAGE_KEYS = {
  ACCESSED_MOCK_IDS: 'dsssb_distinct_mocks_accessed_v5',
  UNLOCKED_SESSION_IDS: 'dsssb_quiz_unlocked_session_ids_v5',
  PAST_ATTEMPTS: 'dsssb_attempts',
  COMPLETED_TEST_IDS: 'dsssb_completed_test_ids',
};

/**
 * Get list of all distinct mock testIds accessed for the first time or completed in past
 */
export function getDistinctAccessedMockIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const rawAccessed = localStorage.getItem(STORAGE_KEYS.ACCESSED_MOCK_IDS);
    const accessedList: string[] = rawAccessed ? JSON.parse(rawAccessed) : [];

    const rawAttempts = localStorage.getItem(STORAGE_KEYS.PAST_ATTEMPTS);
    const pastAttempts: any[] = rawAttempts ? JSON.parse(rawAttempts) : [];
    const pastIds = pastAttempts.map(a => a && a.testId).filter(Boolean);

    const rawCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_TEST_IDS);
    const completedIds: string[] = rawCompleted ? JSON.parse(rawCompleted) : [];

    const combinedSet = new Set([...accessedList, ...pastIds, ...completedIds]);
    return Array.from(combinedSet);
  } catch (err) {
    console.warn('[AttemptRules] Error reading accessed mock list:', err);
    return [];
  }
}

/**
 * Checks if a mock has already been accessed or completed at least once in the past
 */
export function hasMockBeenAccessedBefore(testId: string): boolean {
  if (!testId) return false;
  const accessedList = getDistinctAccessedMockIds();
  return accessedList.includes(testId);
}

/**
 * Get the total number of distinct mocks accessed so far
 */
export function getDistinctMockCount(): number {
  return getDistinctAccessedMockIds().length;
}

/**
 * Determines whether a test launch is FREE or requires a Rewarded Ad.
 * 
 * Flow:
 * - If test has ALREADY been accessed before -> REATTEMPT -> Requires Rewarded Ad (returns false)
 * - If test has NOT been accessed before:
 *   - If count of distinct mocks accessed < 2 -> FREE (returns true)
 *   - If count of distinct mocks accessed >= 2 -> Requires Rewarded Ad (returns false)
 */
export function isAttemptFree(testId: string): boolean {
  return isMockAttemptFree(testId);
}

export function isMockAttemptFree(testId: string): boolean {
  if (!testId) return true;

  // Reattempt rule: any test previously accessed or completed requires an Ad
  if (hasMockBeenAccessedBefore(testId)) {
    return false;
  }

  // First time access rule: first 2 distinct mocks are free
  const distinctCount = getDistinctMockCount();
  return distinctCount < 2;
}

/**
 * Records a mock testId as accessed for the first time in persistent storage
 */
export function recordMockAccess(testId: string): void {
  if (!testId || typeof window === 'undefined') return;
  try {
    const accessedList = getDistinctAccessedMockIds();
    if (!accessedList.includes(testId)) {
      accessedList.push(testId);
      localStorage.setItem(STORAGE_KEYS.ACCESSED_MOCK_IDS, JSON.stringify(accessedList));
    }
  } catch (err) {
    console.warn('[AttemptRules] Error recording mock access:', err);
  }
}

/**
 * Checks if mock is currently unlocked for the session (either free or has temporary unlock token)
 */
export function isAttemptUnlocked(testId: string): boolean {
  if (isMockAttemptFree(testId)) return true;
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
 * Marks a test attempt as unlocked after successful Rewarded Ad completion
 */
export function unlockAttemptForMock(testId: string): void {
  if (!testId || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS);
    const unlockedMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    unlockedMap[testId] = true;
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS, JSON.stringify(unlockedMap));
  } catch (err) {
    console.warn('[AttemptRules] Error saving unlock token:', err);
  }
}

/**
 * Clears temporary unlock token after test workspace launches
 */
export function consumeAttemptUnlock(testId: string): void {
  if (!testId || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS);
    const unlockedMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    delete unlockedMap[testId];
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_SESSION_IDS, JSON.stringify(unlockedMap));
  } catch (err) {
    console.warn('[AttemptRules] Error clearing unlock token:', err);
  }
}

// Backwards compatibility alias
export function incrementMockAttemptCount(testId: string): void {
  recordMockAccess(testId);
}
