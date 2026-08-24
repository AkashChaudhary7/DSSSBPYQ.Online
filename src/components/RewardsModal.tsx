import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { 
  getUserCoins, 
  getAvailableTasks, 
  claimTaskReward, 
  claimDailyStreakBonus,
  getCoinTransactions, 
  MOCK_UNLOCK_COST, 
  unlockMockWithCoins,
  RewardTask,
  CoinTransaction
} from '../lib/rewardsSystem';
import { Glass3dIcon } from './Glass3dIcons';
import { 
  X, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Clock, 
  Coins, 
  ChevronRight,
  Flame,
  Download,
  AlertCircle
} from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLockedQuiz?: Quiz | null;
  onUnlockSuccess?: (quiz: Quiz) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  targetLockedQuiz,
  onUnlockSuccess
}) => {
  const [coins, setCoins] = useState<number>(getUserCoins());
  const [tasks, setTasks] = useState<RewardTask[]>(getAvailableTasks());
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'economy'>('tasks');
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCoins(getUserCoins());
      setTasks(getAvailableTasks());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimTask = (task: RewardTask) => {
    if (task.isCompleted) return;

    if (task.actionType === 'link' && task.link) {
      window.open(task.link, '_blank');
    }

    const success = claimTaskReward(task.id, task.title, task.coins);
    if (success) {
      const updatedCoins = getUserCoins();
      setCoins(updatedCoins);
      setTasks(getAvailableTasks());
      setClaimToast(`Claimed +${task.coins} Coins! 🪙`);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const handleClaimDaily = () => {
    const success = claimDailyStreakBonus();
    if (success) {
      setCoins(getUserCoins());
      setTasks(getAvailableTasks());
      setClaimToast(`Claimed Daily +10 Coins! 🪙`);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const handleUnlockTest = () => {
    if (!targetLockedQuiz) return;
    setIsUnlocking(true);
    const res = unlockMockWithCoins(targetLockedQuiz.testId, targetLockedQuiz.title);
    setIsUnlocking(false);

    if (res.success) {
      setCoins(res.remainingCoins);
      setClaimToast(res.message);
      if (onUnlockSuccess) {
        onUnlockSuccess(targetLockedQuiz);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setClaimToast(res.message);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const transactions = getCoinTransactions();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <Glass3dIcon type="wallet" size="lg" className="shrink-0 shadow-lg" />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-100">
                <Sparkles className="w-3.5 h-3.5" /> Rewards &amp; Coin Hub
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black">{coins}</span>
                <span className="text-sm font-bold text-amber-100">Coins Balance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast alert */}
        {claimToast && (
          <div className="bg-emerald-500 text-white text-xs font-black px-4 py-2.5 text-center flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{claimToast}</span>
          </div>
        )}

        {/* Special Unlock Prompt if targetLockedQuiz was passed */}
        {targetLockedQuiz && (
          <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Unlock Mock Test
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {targetLockedQuiz.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>Cost: <strong className="text-amber-600 font-black">100 Coins</strong></span>
                  <span>•</span>
                  <span>Your Balance: <strong className="text-slate-900 dark:text-white">{coins} Coins</strong></span>
                </div>
              </div>
            </div>

            {coins >= MOCK_UNLOCK_COST ? (
              <button
                onClick={handleUnlockTest}
                disabled={isUnlocking}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Test Now for 100 Coins 🔓</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You need {MOCK_UNLOCK_COST - coins} more coins to unlock this mock. Complete tasks or daily quizzes below to earn free coins!</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Earn Coins (Tasks)
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'economy'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            How to Earn Coins
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Coin History
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 max-h-96 overflow-y-auto space-y-4">
          {/* TAB 1: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Complete tasks, maintain daily streaks, or solve daily quizzes to earn free BytePrep Coins:
              </div>

              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.isCompleted
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Glass3dIcon type={task.iconType} size="sm" className="shrink-0" />
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {task.title}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    {task.isCompleted ? (
                      <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimTask(task)}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                      >
                        <span>+{task.coins} 🪙</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: COIN RULES / ECONOMY */}
          {activeTab === 'economy' && (
            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                <h5 className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                  <Coins className="w-4 h-4 text-amber-600" /> BytePrep Reward &amp; Economy Rules:
                </h5>
                <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300">
                  <li><strong>All Mocks Locked by Default:</strong> Every CBT Mock Test is unlockable using <strong>100 Coins</strong> (permanent unlock).</li>
                  <li><strong>Welcome Starter Balance:</strong> Every new candidate receives <strong>50 Coins</strong> immediately upon registration.</li>
                  <li><strong>First Attempt Rewards:</strong> Base attempt coins and high accuracy performance bonuses are awarded on your <strong>1st attempt</strong> of each test (reattempts do not yield additional coin rewards).</li>
                  <li><strong>Attempt Daily Quizzes:</strong> Earn <strong>+25 Coins</strong> on your first attempt of any daily booster quiz.</li>
                  <li><strong>High Accuracy Performance Bonuses on Mocks:</strong>
                    <ul className="list-circle pl-4 mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                      <li>🏆 <strong>≥90% Accuracy:</strong> +50 Bonus Coins (Total 70 Coins per mock!)</li>
                      <li>⭐ <strong>≥80% Accuracy:</strong> +35 Bonus Coins (Total 55 Coins per mock!)</li>
                      <li>🎯 <strong>≥70% Accuracy:</strong> +20 Bonus Coins (Total 40 Coins per mock!)</li>
                      <li>💡 <strong>≥50% Accuracy:</strong> +10 Bonus Coins (Total 30 Coins per mock!)</li>
                      <li>📝 <strong>&lt;50% Accuracy:</strong> +20 Base Participation Coins.</li>
                    </ul>
                  </li>
                  <li><strong>Daily Check-In Streak:</strong> Claim <strong>+20 Coins</strong> every single day.</li>
                  <li><strong>Syllabus Mastery:</strong> Marking syllabus sub-topics as done gives <strong>+15 Coins</strong> each.</li>
                  <li><strong>One-Click Tasks:</strong> Join Telegram (+50 🪙), Subscribe YouTube (+50 🪙), Install Web App (+50 🪙).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6">No coin transactions yet.</div>
              ) : (
                transactions.map(tx => (
                  <div 
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{tx.reason}</div>
                      <div className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                    <div className={`font-black text-sm ${tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} 🪙
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;
