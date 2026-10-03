import { Attempt } from '../types';

const DAILY_GOAL_TARGET_KEY = 'dsssb_daily_goal_target';
const DAILY_QUESTIONS_LOG_PREFIX = 'dsssb_daily_questions_count_';

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyGoalTarget(): number {
  if (typeof window === 'undefined') return 25;
  try {
    const saved = localStorage.getItem(DAILY_GOAL_TARGET_KEY);
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num > 0) return num;
    }
  } catch (_) {}
  return 25; // Standard 25 questions daily target
}

export function setDailyGoalTarget(target: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_GOAL_TARGET_KEY, String(target));
  } catch (_) {}
}

export function recordQuestionsAnsweredToday(count: number): void {
  if (typeof window === 'undefined' || count <= 0) return;
  try {
    const todayKey = `${DAILY_QUESTIONS_LOG_PREFIX}${getTodayDateString()}`;
    const current = parseInt(localStorage.getItem(todayKey) || '0', 10) || 0;
    localStorage.setItem(todayKey, String(current + count));
  } catch (_) {}
}

export function getTodayQuestionsCount(attempts: Attempt[] = []): number {
  if (typeof window === 'undefined') return 0;
  const todayStr = getTodayDateString();
  const todayDateObj = new Date().toDateString();

  // 1. Check logged questions count in localStorage for today
  let loggedCount = 0;
  try {
    const raw = localStorage.getItem(`${DAILY_QUESTIONS_LOG_PREFIX}${todayStr}`);
    if (raw) {
      loggedCount = parseInt(raw, 10) || 0;
    }
  } catch (_) {}

  // 2. Count questions from pastAttempts timestamps for today
  let attemptQuestionsToday = 0;
  if (Array.isArray(attempts)) {
    attempts.forEach((att) => {
      try {
        const attDate = new Date(att.timestamp).toDateString();
        if (attDate === todayDateObj) {
          const qCount = (att.correctCount || 0) + (att.incorrectCount || 0);
          attemptQuestionsToday += qCount;
        }
      } catch (_) {}
    });
  }

  return Math.max(loggedCount, attemptQuestionsToday);
}

export interface DailyGoalStatus {
  answeredToday: number;
  targetGoal: number;
  percentage: number;
  isCompleted: boolean;
  remaining: number;
  todayDateStr: string;
}

export function getDailyGoalStatus(attempts: Attempt[] = []): DailyGoalStatus {
  const answeredToday = getTodayQuestionsCount(attempts);
  const targetGoal = getDailyGoalTarget();
  const percentage = Math.min(100, Math.round((answeredToday / targetGoal) * 100));
  const isCompleted = answeredToday >= targetGoal;
  const remaining = Math.max(0, targetGoal - answeredToday);
  const todayDateStr = getTodayDateString();

  return {
    answeredToday,
    targetGoal,
    percentage,
    isCompleted,
    remaining,
    todayDateStr,
  };
}
