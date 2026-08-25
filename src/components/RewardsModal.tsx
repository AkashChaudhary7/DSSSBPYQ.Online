import React, { useState, useEffect, useRef } from 'react';
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
  CoinTransaction,
  recordAdWatch,
  hasWatchedAdToday
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
  AlertCircle,
  Play,
  ShieldCheck,
  Check,
  Tv
} from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLockedQuiz?: Quiz | null;
  onUnlockSuccess?: (quiz: Quiz) => void;
  onMockUnlocked?: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  targetLockedQuiz: initialTargetLockedQuiz,
  onUnlockSuccess,
  onMockUnlocked
}) => {
  const [coins, setCoins] = useState<number>(getUserCoins());
  const [tasks, setTasks] = useState<RewardTask[]>(getAvailableTasks());
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'economy'>('tasks');
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // We keep a local state of the locked quiz so we can clear it if they choose to go to the Tasks tab
  const [targetLockedQuiz, setTargetLockedQuiz] = useState<Quiz | null>(initialTargetLockedQuiz || null);

  // Verification Overlay sub-state
  const [verifyingTask, setVerifyingTask] = useState<RewardTask | null>(null);
  const [verifyingStep, setVerifyingStep] = useState<'prompt' | 'verifying' | 'success'>('prompt');
  const [handleInput, setHandleInput] = useState('');
  const [verificationStatusText, setVerificationStatusText] = useState('Initiating secure check...');
  
  // Ad simulation countdown state
  const [adCountdown, setAdCountdown] = useState(15);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCoins(getUserCoins());
      setTasks(getAvailableTasks());
      setTargetLockedQuiz(initialTargetLockedQuiz || null);
      setVerifyingTask(null);
    }
  }, [isOpen, initialTargetLockedQuiz]);

  // Handle ad countdown interval
  useEffect(() => {
    if (verifyingTask?.id === 'task_watch_ad' && verifyingStep === 'verifying') {
      setAdCountdown(15);
      adTimerRef.current = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            if (adTimerRef.current) clearInterval(adTimerRef.current);
            setVerifyingStep('success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (adTimerRef.current) clearInterval(adTimerRef.current);
    };
  }, [verifyingTask, verifyingStep]);

  if (!isOpen) return null;

  const handleClaimTask = (task: RewardTask) => {
    if (task.isCompleted) return;

    if (task.id === 'task_telegram' || task.id === 'task_youtube' || task.id === 'task_install_app') {
      setVerifyingTask(task);
      setVerifyingStep('prompt');
      setHandleInput('');
      return;
    }

    if (task.id === 'task_watch_ad') {
      setVerifyingTask(task);
      setVerifyingStep('verifying');
      setAdCountdown(15);
      return;
    }

    if (task.id === 'task_daily_streak') {
      handleClaimDaily();
    }
  };

  const handleClaimDaily = () => {
    const success = claimDailyStreakBonus();
    if (success) {
      setCoins(getUserCoins());
      setTasks(getAvailableTasks());
      setClaimToast(`Claimed Daily +20 Coins! 🪙`);
      setTimeout(() => setClaimToast(null), 3500);
    }
  };

  const executeManualVerification = () => {
    if (!verifyingTask) return;

    // Validation
    if ((verifyingTask.id === 'task_telegram' || verifyingTask.id === 'task_youtube') && !handleInput.trim()) {
      setClaimToast('Please enter your handle/username for verification!');
      setTimeout(() => setClaimToast(null), 2500);
      return;
    }

    setVerifyingStep('verifying');
    setVerificationStatusText('Connecting to API gateway...');

    // Phase 1 Status
    setTimeout(() => {
      setVerificationStatusText(
        verifyingTask.id === 'task_telegram' 
          ? 'Querying Telegram group roster for ' + handleInput.trim() + '...'
          : verifyingTask.id === 'task_youtube'
          ? 'Verifying channel subscription token for ' + handleInput.trim() + '...'
          : 'Auditing progressive web app installation service-worker...'
      );
    }, 1000);

    // Phase 2 Approved
    setTimeout(() => {
      setVerificationStatusText('Verifying credential authenticity...');
    }, 2000);

    // Phase 3 Success
    setTimeout(() => {
      const success = claimTaskReward(verifyingTask.id, verifyingTask.title, verifyingTask.coins);
      if (success) {
        setCoins(getUserCoins());
        setTasks(getAvailableTasks());
        setVerifyingStep('success');
      } else {
        setVerifyingTask(null);
        setClaimToast('Task reward was already claimed or invalid.');
        setTimeout(() => setClaimToast(null), 3000);
      }
    }, 3000);
  };

  const claimAdCoins = () => {
    const ok = recordAdWatch();
    if (ok) {
      setCoins(getUserCoins());
      setTasks(getAvailableTasks());
      setClaimToast('Claimed +20 Coins for watching Sponsor Ad! 🪙');
      setTimeout(() => setClaimToast(null), 3500);
    }
    setVerifyingTask(null);
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
      if (onMockUnlocked) {
        onMockUnlocked();
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      
      {/* 1. COMPACT LOCKED MOCK VIEW: Shown only when targetLockedQuiz is active */}
      {targetLockedQuiz ? (
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-5 text-center relative">
          
          <button
            onClick={onClose}
            className="absolute right-4 top-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Premium Mock CBT Test
            </span>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug px-3">
              {targetLockedQuiz.title}
            </h4>
          </div>

          {/* Balance comparison info */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-around text-xs">
            <div className="text-center">
              <div className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Required Cost</div>
              <div className="text-amber-500 font-extrabold text-lg mt-0.5">100 Coins</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <div className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Your Balance</div>
              <div className={`font-extrabold text-lg mt-0.5 ${coins >= 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {coins} Coins
              </div>
            </div>
          </div>

          {coins >= MOCK_UNLOCK_COST ? (
            <div className="space-y-2">
              <button
                onClick={handleUnlockTest}
                disabled={isUnlocking}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Now (-100 Coins) 🔓</span>
              </button>
              <p className="text-[10px] text-slate-400 font-medium">
                Unlocks are permanent. Balance after unlock: {coins - MOCK_UNLOCK_COST} coins.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-semibold flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Not enough coins!</strong> You need {MOCK_UNLOCK_COST - coins} more coins to unlock this mock. Please complete rewards tasks to earn free coins!
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Instantly switch targetLockedQuiz state to null to open the regular Task View
                    setTargetLockedQuiz(null);
                    setActiveTab('tasks');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Go to Earn Tasks</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : verifyingTask ? (
        
        /* 2. TASK INTERACTIVE VERIFICATION OVERLAY (Prevents simple clicking) */
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border-2 border-indigo-400 dark:border-indigo-900/80 shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Task Security Verification
              </h4>
            </div>
            {verifyingStep !== 'verifying' && (
              <button onClick={() => setVerifyingTask(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* WATCH VIDEO AD FLOW */}
          {verifyingTask.id === 'task_watch_ad' ? (
            <div className="space-y-4 text-center py-2">
              {verifyingStep === 'verifying' ? (
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
                    {/* Simulated Player Banner */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 flex flex-col items-center justify-center p-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 animate-spin mb-3">
                        <Tv className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">Sponsor Presentation</span>
                      <h5 className="text-xs font-bold text-white mt-1">DSSSB TGT CS Premium Practice Lectures</h5>
                      <p className="text-[9px] text-slate-400 mt-1 max-w-xs leading-normal">
                        BytePrep CBT Marathons &amp; full notes are available in Telegram groups. Join now!
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1.5 bg-indigo-500 transition-all duration-1000" style={{ width: `${(15 - adCountdown) * 6.66}%` }} />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-black text-amber-500 animate-pulse flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" /> Sponsor Video is Playing ({adCountdown}s)
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">
                      Do not close this window. Your 🪙 20 coins will be awarded in {adCountdown} seconds.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900 dark:text-white">Video Finished!</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Thank you for supporting us. Click below to claim your coins.</p>
                  </div>
                  <button
                    onClick={claimAdCoins}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    Claim +20 Coins Now 🪙
                  </button>
                </div>
              )}
            </div>
          ) : (
            
            /* SOCIALS & INSTALL VERIFICATION FLOW */
            <div className="space-y-4">
              
              {verifyingStep === 'prompt' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    To claim your <strong className="text-indigo-600 dark:text-indigo-400 font-black">+{verifyingTask.coins} Coins</strong>, please follow the steps below:
                  </div>

                  {/* Step 1 Button */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Step 1: Open Link &amp; Complete Action</div>
                    {verifyingTask.id === 'task_install_app' ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                        📱 Please add BytePrep CS to your home screen or select "Install App" in your browser.
                      </div>
                    ) : (
                      <a
                        href={verifyingTask.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs"
                      >
                        <span>Open Official {verifyingTask.id === 'task_telegram' ? 'Telegram Group' : 'YouTube Channel'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Step 2 Inputs */}
                  {verifyingTask.id !== 'task_install_app' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Step 2: Enter Handle / Username For Verification
                      </label>
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        placeholder={
                          verifyingTask.id === 'task_telegram' 
                            ? '@your_telegram_username' 
                            : 'YouTube Account Name / @channel'
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={executeManualVerification}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      {verifyingTask.id === 'task_install_app' ? 'Run PWA Audit & Verify' : 'Submit for Verification'}
                    </button>
                    <button
                      onClick={() => setVerifyingTask(null)}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {verifyingStep === 'verifying' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider animate-pulse">
                      Running Verification
                    </h5>
                    <p className="text-[11px] text-slate-500 font-bold">{verificationStatusText}</p>
                  </div>
                </div>
              )}

              {verifyingStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900 dark:text-white">Verification Confirmed!</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Task payload has been successfully validated. <strong>+{verifyingTask.coins} Coins</strong> credited!
                    </p>
                  </div>
                  <button
                    onClick={() => setVerifyingTask(null)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Close Verification
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        
        /* 3. NORMAL FULL REWARDS PANEL (Tasks, Rules list etc) */
        <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-scaleUp">
          
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
          <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto space-y-4 scrollbar-thin">
            
            {/* TAB 1: TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2">
                  <span className="text-amber-500 text-sm">💡</span>
                  <span>Complete verification tasks, watch video sponsors, or solve daily boosters to accumulate free coins.</span>
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
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          {task.title}
                          {task.id === 'task_watch_ad' && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded uppercase">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      {task.isCompleted ? (
                        <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaimTask(task)}
                          className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                        >
                          <span>+{task.coins} 🪙</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: COIN RULES / ECONOMY */}
            {activeTab === 'economy' && (
              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed animate-fadeIn">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                  <h5 className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                    <Coins className="w-4 h-4 text-amber-600" /> BytePrep Reward &amp; Economy Rules:
                  </h5>
                  <ul className="space-y-2 list-disc pl-4 text-slate-600 dark:text-slate-300 font-medium">
                    <li><strong>All Mocks Locked by Default:</strong> Every CBT Mock Test &amp; Custom Mock requires <strong>100 Coins</strong> to unlock (permanent unlock).</li>
                    <li><strong>Welcome Starter Balance:</strong> Every new candidate receives <strong>50 Coins</strong> immediately upon registration.</li>
                    <li><strong>Syllabus Mastery:</strong> Check-marking syllabus topics as finished rewards <strong>+5 Coins</strong> each (reduced from +10 for optimal economy balancing).</li>
                    <li><strong>Sponsor Ad Rewards:</strong> Watch a sponsor video once daily to earn <strong>+20 Coins</strong> instantly.</li>
                    <li><strong>Task Verification Enforced:</strong> All reward tasks (Telegram, YouTube, Web App install) are fully checked with anti-cheat audit before granting coins.</li>
                    <li><strong>Attempt Daily Quizzes:</strong> Earn <strong>+25 Coins</strong> on your first attempt of any daily booster quiz.</li>
                    <li><strong>Daily Check-In Streak:</strong> Claim <strong>+20 Coins</strong> every single day.</li>
                    <li><strong>High Accuracy Performance Bonuses on Mocks:</strong>
                      <ul className="list-circle pl-4 mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                        <li>🏆 <strong>≥90% Accuracy:</strong> +50 Bonus Coins (Total 70 Coins per mock!)</li>
                        <li>⭐ <strong>≥80% Accuracy:</strong> +35 Bonus Coins (Total 55 Coins per mock!)</li>
                        <li>🎯 <strong>≥70% Accuracy:</strong> +20 Bonus Coins (Total 40 Coins per mock!)</li>
                        <li>💡 <strong>≥50% Accuracy:</strong> +10 Bonus Coins (Total 30 Coins per mock!)</li>
                        <li>📝 <strong>&lt;50% Accuracy:</strong> +20 Base Participation Coins.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: TRANSACTION HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-2 animate-fadeIn">
                {transactions.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-6">No coin transactions yet.</div>
                ) : (
                  transactions.map(tx => (
                    <div 
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{tx.reason}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{new Date(tx.timestamp).toLocaleString()}</div>
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
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-black rounded-xl cursor-pointer active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RewardsModal;
