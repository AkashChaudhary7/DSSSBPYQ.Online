/**
 * Centralized Test Access & Unlock Manager (TestAccessManager)
 * 
 * Access Control Architecture:
 * 1. Free Tests: The first 2 distinct mock tests accessed for the first time are FREE.
 * 2. Rewarded Unlock: From the 3rd distinct test onward, or for re-attempting a previously completed test,
 *    a Rewarded Advertisement must be completed to unlock the test.
 * 3. Scope of Unlock: Unlocking ONE test unlocks ONLY that specific test.
 * 4. Persistence: Unlocked state is persisted locally using stable test IDs (e.g., `teaching_mock_1`)
 *    and survives screen navigation, Activity recreation, and application restarts.
 */

const STORAGE_KEYS = {
  ACCESSED_TEST_IDS: 'dsssb_distinct_mocks_accessed_v5',
  UNLOCKED_TEST_IDS: 'dsssb_unlocked_tests_v5',
  SESSION_UNLOCKED_IDS: 'dsssb_quiz_unlocked_session_ids_v5',
  PAST_ATTEMPTS: 'dsssb_attempts',
  COMPLETED_TEST_IDS: 'dsssb_completed_test_ids',
};

export class TestAccessManager {
  /**
   * Returns list of all distinct test IDs accessed or completed in past.
   */
  static getDistinctAccessedMockIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const rawAccessed = localStorage.getItem(STORAGE_KEYS.ACCESSED_TEST_IDS);
      const accessedList: string[] = rawAccessed ? JSON.parse(rawAccessed) : [];

      const rawAttempts = localStorage.getItem(STORAGE_KEYS.PAST_ATTEMPTS);
      const pastAttempts: any[] = rawAttempts ? JSON.parse(rawAttempts) : [];
      const pastIds = pastAttempts.map((a) => a && a.testId).filter(Boolean);

      const rawCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_TEST_IDS);
      const completedIds: string[] = rawCompleted ? JSON.parse(rawCompleted) : [];

      const combinedSet = new Set([...accessedList, ...pastIds, ...completedIds]);
      return Array.from(combinedSet);
    } catch (err) {
      console.warn('[TestAccessManager] Error reading accessed mock list:', err);
      return [];
    }
  }

  /**
   * Returns total count of distinct mock tests accessed.
   */
  static getDistinctMockCount(): number {
    return this.getDistinctAccessedMockIds().length;
  }

  /**
   * Returns remaining number of initial free tests (up to 2).
   */
  static getRemainingFreeAttempts(): number {
    return Math.max(0, 2 - this.getDistinctMockCount());
  }

  /**
   * Checks if a test was accessed or completed before.
   */
  static hasTestBeenAccessed(testId: string): boolean {
    if (!testId) return false;
    return this.getDistinctAccessedMockIds().includes(testId);
  }

  /**
   * Determines if a test is currently free to access without an ad.
   */
  static isTestFree(testId: string): boolean {
    if (!testId) return true;

    // If test was already accessed or attempted, reattempts require unlocking
    if (this.hasTestBeenAccessed(testId)) {
      return false;
    }

    // First 2 distinct mock tests are free
    return this.getDistinctMockCount() < 2;
  }

  /**
   * Checks if a test has been unlocked through a completed Rewarded Ad.
   */
  static isTestUnlocked(testId: string): boolean {
    if (!testId) return true;
    if (this.isTestFree(testId)) return true;
    if (typeof window === 'undefined') return false;

    try {
      // Check persistent unlocked storage
      const rawUnlocked = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TEST_IDS);
      const unlockedMap: Record<string, boolean> = rawUnlocked ? JSON.parse(rawUnlocked) : {};
      if (unlockedMap[testId]) return true;

      // Check legacy session unlocked storage
      const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED_IDS);
      const sessionMap: Record<string, boolean> = rawSession ? JSON.parse(rawSession) : {};
      if (sessionMap[testId]) return true;

      return false;
    } catch (_) {
      return false;
    }
  }

  /**
   * Checks whether the user can start this test (either because it is free or unlocked).
   */
  static canStartTest(testId: string): boolean {
    return this.isTestFree(testId) || this.isTestUnlocked(testId);
  }

  /**
   * Unlocks a specific test after a successful Rewarded Ad callback.
   * Persists across app restart and activity recreations.
   */
  static unlockTest(testId: string): void {
    if (!testId || typeof window === 'undefined') return;
    try {
      const rawUnlocked = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TEST_IDS);
      const unlockedMap: Record<string, boolean> = rawUnlocked ? JSON.parse(rawUnlocked) : {};
      unlockedMap[testId] = true;
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_TEST_IDS, JSON.stringify(unlockedMap));

      // Also sync session map
      const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED_IDS);
      const sessionMap: Record<string, boolean> = rawSession ? JSON.parse(rawSession) : {};
      sessionMap[testId] = true;
      localStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED_IDS, JSON.stringify(sessionMap));

      console.log(`[TestAccessManager] Test "${testId}" successfully unlocked and persisted.`);
    } catch (err) {
      console.warn('[TestAccessManager] Error persisting test unlock:', err);
    }
  }

  /**
   * Records test access for distinct test counting and history tracking.
   */
  static recordTestAccess(testId: string): void {
    if (!testId || typeof window === 'undefined') return;
    try {
      const accessedList = this.getDistinctAccessedMockIds();
      if (!accessedList.includes(testId)) {
        accessedList.push(testId);
        localStorage.setItem(STORAGE_KEYS.ACCESSED_TEST_IDS, JSON.stringify(accessedList));
      }
    } catch (err) {
      console.warn('[TestAccessManager] Error recording test access:', err);
    }
  }

  /**
   * Cleans up temporary unlock token if needed.
   */
  static consumeAttemptUnlock(testId: string): void {
    // Keep persistent unlock intact for full persistence; legacy cleanup optional
    if (!testId || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED_IDS);
      const sessionMap: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      delete sessionMap[testId];
      localStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED_IDS, JSON.stringify(sessionMap));
    } catch (_) {}
  }
}
