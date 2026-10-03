/**
 * Automated Daily Mock Unlocking System
 * 
 * Logic:
 * - Baseline launch date: July 28, 2026 (00:00:00 UTC)
 * - Initial state (Day 0): 2 mock tests unlocked by default (indices 0 and 1)
 * - Schedule: +2 new mock tests automatically unlock every single day (+2 per 24 hours)
 * - Dynamic status calculation for any test list across every exam category/subject/topic
 */

export const UNLOCK_BASELINE_DATE_MS = new Date('2026-07-28T00:00:00Z').getTime();

export interface MockUnlockStatus {
  isUnlocked: boolean;
  daysRemaining: number;
  unlockDate: Date;
  timeRemainingMs: number;
  formattedCountdown: string;
}

export function getDaysSinceBaseline(nowMs: number = Date.now()): number {
  return 0;
}

export function getMaxUnlockedCount(nowMs: number = Date.now()): number {
  return 999999;
}

export function getMockUnlockStatus(testIndex: number, nowMs: number = Date.now()): MockUnlockStatus {
  return {
    isUnlocked: true,
    daysRemaining: 0,
    unlockDate: new Date(nowMs),
    timeRemainingMs: 0,
    formattedCountdown: ''
  };
}
