/**
 * V5 Mock Test Advertisement & Access Tracking Rules
 * Backed by centralized TestAccessManager.
 */
import { TestAccessManager } from './testAccessManager';

export { TestAccessManager };

export function getDistinctAccessedMockIds(): string[] {
  return TestAccessManager.getDistinctAccessedMockIds();
}

export function hasMockBeenAccessedBefore(testId: string): boolean {
  return TestAccessManager.hasTestBeenAccessed(testId);
}

export function getDistinctMockCount(): number {
  return TestAccessManager.getDistinctMockCount();
}

export function isAttemptFree(testId: string): boolean {
  return TestAccessManager.isTestFree(testId);
}

export function isMockAttemptFree(testId: string): boolean {
  return TestAccessManager.isTestFree(testId);
}

export function recordMockAccess(testId: string): void {
  TestAccessManager.recordTestAccess(testId);
}

export function isAttemptUnlocked(testId: string): boolean {
  return TestAccessManager.isTestUnlocked(testId);
}

export function unlockAttemptForMock(testId: string): void {
  TestAccessManager.unlockTest(testId);
}

export function consumeAttemptUnlock(testId: string): void {
  TestAccessManager.consumeAttemptUnlock(testId);
}

export function incrementMockAttemptCount(testId: string): void {
  TestAccessManager.recordTestAccess(testId);
}
