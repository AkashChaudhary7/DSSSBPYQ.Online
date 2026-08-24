/**
 * BytePrep Rewards & Coin Economy Engine
 * 
 * Rules:
 * - Initial balance: 50 coins (Starter Bonus)
 * - Mock Unlock cost: 100 coins per test (All mocks are locked by default; no first two free)
 * - Attempting a daily quiz / booster: +25 Base Coins
 * - Attempting a full mock: +20 Base Coins
 * - High Accuracy Bonuses on previous mocks:
 *   - Accuracy ≥ 90% (Ranker / Mastery): +50 Bonus Coins (Total 70 Coins)
 *   - Accuracy ≥ 80% (High Accuracy): +35 Bonus Coins (Total 55 Coins)
 *   - Accuracy ≥ 70% (Great Accuracy): +20 Bonus Coins (Total 40 Coins)
 *   - Accuracy ≥ 50%: +10 Bonus Coins (Total 30 Coins)
 *   - Accuracy < 50%: +0 Bonus Coins (Base 20 Coins)
 * - Completing a syllabus topic: +15 Coins
 * - Daily check-in streak: +20 Coins
 * - Task: Join Telegram Channel: +50 Coins
 * - Task: Subscribe YouTube Channel: +50 Coins
 * - Task: Install BytePrep App: +50 Coins
 */

export interface RewardTask {
  id: string;
  title: string;
  description: string;
  coins: number;
  iconType: 'telegram' | 'youtube' | 'rocket' | 'code' | 'sparkles' | 'target' | 'trophy';
  link?: string;
  actionType: 'link' | 'install' | 'syllabus' | 'daily';
  isCompleted: boolean;
}

export interface CoinTransaction {
  id: string;
  timestamp: number;
  amount: number; // positive for earn, negative for spend
  reason: string;
  type: 'mock_unlock' | 'quiz_attempt' | 'score_bonus' | 'task_completion' | 'syllabus_progress' | 'daily_streak' | 'initial_bonus';
}

const STORAGE_KEYS = {
  COINS: 'dsssb_user_coins',
  UNLOCKED_MOCKS: 'dsssb_unlocked_mocks',
  CLAIMED_TASKS: 'dsssb_claimed_tasks',
  TRANSACTIONS: 'dsssb_coin_transactions',
  LAST_DAILY_CLAIM: 'dsssb_last_daily_coin_claim',
  CLAIMED_SYLLABUS_ITEMS: 'dsssb_claimed_syllabus_coins'
};

export const DEFAULT_INITIAL_COINS = 50;
export const MOCK_UNLOCK_COST = 100;
export const QUIZ_ATTEMPT_REWARD = 20;
export const DAILY_QUIZ_REWARD = 25;
export const SYLLABUS_TOPIC_REWARD = 15;
export const DAILY_STREAK_REWARD = 20;

// Listeners for real-time reactivity
type CoinChangeListener = (coins: number) => void;
const coinListeners: Set<CoinChangeListener> = new Set();

export function subscribeToCoins(listener: CoinChangeListener): () => void {
  coinListeners.add(listener);
  return () => coinListeners.delete(listener);
}

function notifyCoinChange(coins: number) {
  coinListeners.forEach(l => {
    try {
      l(coins);
    } catch (e) {
      console.error('Error notifying coin listener', e);
    }
  });
  // Dispatch custom window event for broad reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dsssb_coins_updated', { detail: { coins } }));
  }
}

// 1. Get Current User Coins
export function getUserCoins(): number {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_COINS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    if (saved === null) {
      // First time user: initialize with 50 coins
      localStorage.setItem(STORAGE_KEYS.COINS, String(DEFAULT_INITIAL_COINS));
      addTransaction(DEFAULT_INITIAL_COINS, 'Welcome Bonus Initial Balance', 'initial_bonus');
      return DEFAULT_INITIAL_COINS;
    }
    const parsed = parseInt(saved, 10);
    return isNaN(parsed) ? DEFAULT_INITIAL_COINS : parsed;
  } catch (e) {
    return DEFAULT_INITIAL_COINS;
  }
}

// 2. Set/Add Coins
export function addCoins(amount: number, reason: string, type: CoinTransaction['type']): number {
  if (amount === 0) return getUserCoins();
  const current = getUserCoins();
  const updated = Math.max(0, current + amount);
  try {
    localStorage.setItem(STORAGE_KEYS.COINS, String(updated));
    addTransaction(amount, reason, type);
  } catch (e) {
    console.error('Failed to save coins to localStorage', e);
  }
  notifyCoinChange(updated);
  return updated;
}

// 3. Transactions Log
export function getCoinTransactions(): CoinTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addTransaction(amount: number, reason: string, type: CoinTransaction['type']) {
  try {
    const history = getCoinTransactions();
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      amount,
      reason,
      type
    };
    const updated = [newTx, ...history.slice(0, 99)]; // keep latest 100
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  } catch (e) {}
}

// 4. Unlocked Mocks Management
export function getUnlockedMockIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_MOCKS);
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch (e) {
    return new Set();
  }
}

/**
 * Check if a mock is unlocked.
 * Requirement: ALL mocks are locked by default and need 100 coins to unlock.
 * (The first two are NOT free).
 */
export function isMockUnlocked(testId: string, _testIndex?: number): boolean {
  if (!testId) return false;
  const unlocked = getUnlockedMockIds();
  return unlocked.has(testId);
}

export function unlockMockWithCoins(testId: string, testTitle: string): { success: boolean; message: string; remainingCoins: number } {
  const current = getUserCoins();
  const unlocked = getUnlockedMockIds();

  if (unlocked.has(testId)) {
    return { success: true, message: 'Mock is already unlocked!', remainingCoins: current };
  }

  if (current < MOCK_UNLOCK_COST) {
    return {
      success: false,
      message: `Insufficient coins. You have ${current} coins, but ${MOCK_UNLOCK_COST} coins are required.`,
      remainingCoins: current
    };
  }

  // Deduct coins & record unlock
  const remaining = addCoins(-MOCK_UNLOCK_COST, `Unlocked Mock: ${testTitle}`, 'mock_unlock');
  unlocked.add(testId);
  try {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_MOCKS, JSON.stringify(Array.from(unlocked)));
  } catch (e) {}

  return {
    success: true,
    message: `Successfully unlocked "${testTitle}" for ${MOCK_UNLOCK_COST} coins! 🎉`,
    remainingCoins: remaining
  };
}

// 5. Test Completion Rewards Calculation
export function calculateQuizAttemptReward(
  percentage: number, 
  quizTitle: string,
  isDailyQuiz: boolean = false,
  isReattempt: boolean = false
): {
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  bonusReason: string;
} {
  if (isReattempt) {
    return {
      baseCoins: 0,
      bonusCoins: 0,
      totalCoins: 0,
      bonusReason: 'Reattempt (Coins awarded on 1st attempt only)'
    };
  }

  const baseCoins = isDailyQuiz ? DAILY_QUIZ_REWARD : QUIZ_ATTEMPT_REWARD;
  let bonusCoins = 0;
  let bonusReason = '';

  if (percentage >= 90) {
    bonusCoins = 50;
    bonusReason = 'Ranker Mastery Bonus (≥90% Accuracy)';
  } else if (percentage >= 80) {
    bonusCoins = 35;
    bonusReason = 'High Accuracy Bonus (≥80% Accuracy)';
  } else if (percentage >= 70) {
    bonusCoins = 20;
    bonusReason = 'Great Performance Bonus (≥70% Accuracy)';
  } else if (percentage >= 50) {
    bonusCoins = 10;
    bonusReason = 'Good Accuracy Bonus (≥50% Accuracy)';
  } else {
    bonusCoins = 0;
    bonusReason = isDailyQuiz ? 'Daily Quiz Participation (<50%)' : 'Attempt Participation (<50%)';
  }

  const totalCoins = baseCoins + bonusCoins;

  // Add base coins
  const attemptLabel = isDailyQuiz ? `Completed Daily Quiz: ${quizTitle}` : `Completed Mock Attempt: ${quizTitle}`;
  addCoins(baseCoins, attemptLabel, 'quiz_attempt');
  
  // Add accuracy bonus coins if earned
  if (bonusCoins > 0) {
    addCoins(bonusCoins, `High Accuracy Bonus (${Math.round(percentage)}%): ${quizTitle}`, 'score_bonus');
  }

  return {
    baseCoins,
    bonusCoins,
    totalCoins,
    bonusReason
  };
}

// 6. Claim Task
export function getClaimedTaskIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMED_TASKS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

export function claimTaskReward(taskId: string, title: string, coins: number): boolean {
  const claimed = getClaimedTaskIds();
  if (claimed.has(taskId)) return false;

  claimed.add(taskId);
  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMED_TASKS, JSON.stringify(Array.from(claimed)));
  } catch (e) {}

  addCoins(coins, `Completed Task: ${title}`, 'task_completion');
  return true;
}

// 7. Syllabus Topic Completion Reward (+15 Coins each)
export function getClaimedSyllabusItemIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMED_SYLLABUS_ITEMS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

export function rewardSyllabusTopicCompletion(topicId: string, topicTitle: string): boolean {
  const claimed = getClaimedSyllabusItemIds();
  if (claimed.has(topicId)) return false;

  claimed.add(topicId);
  try {
    localStorage.setItem(STORAGE_KEYS.CLAIMED_SYLLABUS_ITEMS, JSON.stringify(Array.from(claimed)));
  } catch (e) {}

  addCoins(SYLLABUS_TOPIC_REWARD, `Syllabus Topic Mastered: ${topicTitle}`, 'syllabus_progress');
  return true;
}

// 8. Available Engagement Tasks
export function getAvailableTasks(): RewardTask[] {
  const claimed = getClaimedTaskIds();

  return [
    {
      id: 'task_telegram',
      title: 'Join Official Telegram Channel',
      description: 'Get daily DSSSB PYQ updates, PDFs, exam dates, and discussion groups.',
      coins: 50,
      iconType: 'telegram',
      link: 'https://t.me/byteprep_cs',
      actionType: 'link',
      isCompleted: claimed.has('task_telegram')
    },
    {
      id: 'task_youtube',
      title: 'Subscribe YouTube Channel',
      description: 'Watch video lectures, topic breakdowns, and marathon live sessions.',
      coins: 50,
      iconType: 'youtube',
      link: 'https://www.youtube.com/@BytePrepCS',
      actionType: 'link',
      isCompleted: claimed.has('task_youtube')
    },
    {
      id: 'task_install_app',
      title: 'Install BytePrep CS App',
      description: 'Add BytePrep to your home screen or install the app for instant offline access.',
      coins: 50,
      iconType: 'rocket',
      actionType: 'install',
      isCompleted: claimed.has('task_install_app')
    },
    {
      id: 'task_daily_streak',
      title: 'Daily Practice Check-In',
      description: 'Visit daily and maintain your streak to keep your knowledge razor sharp.',
      coins: 20,
      iconType: 'sparkles',
      actionType: 'daily',
      isCompleted: hasClaimedDailyToday()
    }
  ];
}

function hasClaimedDailyToday(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const last = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_CLAIM);
    if (!last) return false;
    const lastDate = new Date(parseInt(last, 10)).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
  } catch (e) {
    return false;
  }
}

export function claimDailyStreakBonus(): boolean {
  if (hasClaimedDailyToday()) return false;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_DAILY_CLAIM, String(Date.now()));
  } catch (e) {}
  addCoins(DAILY_STREAK_REWARD, 'Daily Practice Check-In Streak', 'daily_streak');
  return true;
}

export function claimDailyLoginStreak(): { success: boolean; message: string; coinsEarned: number } {
  if (hasClaimedDailyToday()) {
    return {
      success: false,
      message: `You already claimed your 🪙 ${DAILY_STREAK_REWARD} Daily Streak Coins today! Come back tomorrow for more.`,
      coinsEarned: 0
    };
  }
  const ok = claimDailyStreakBonus();
  if (ok) {
    return {
      success: true,
      message: `🎉 Claimed +${DAILY_STREAK_REWARD} BytePrep Coins for your daily practice streak!`,
      coinsEarned: DAILY_STREAK_REWARD
    };
  }
  return {
    success: false,
    message: 'Unable to claim daily streak right now.',
    coinsEarned: 0
  };
}
