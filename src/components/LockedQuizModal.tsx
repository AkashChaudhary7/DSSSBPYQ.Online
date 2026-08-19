import React, { useState } from 'react';
import { Quiz } from '../types';
import { Capacitor } from '@capacitor/core';
import { Lock, Sparkles, X, Play, ShieldAlert, CheckCircle2, Video } from 'lucide-react';
import { showRewardedAd } from '../lib/admob';
import { TestAccessManager } from '../lib/testAccessManager';
import { getQuestionCount } from '../lib/quizDisplayHelpers';

interface LockedQuizModalProps {
  quiz: Quiz | null;
  onClose: () => void;
  onUnlocked: (quiz: Quiz) => void;
}

export const LockedQuizModal: React.FC<LockedQuizModalProps> = ({
  quiz,
  onClose,
  onUnlocked,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [adError, setAdError] = useState<string | null>(null);
  
  // Web preview simulation states
  const [isSimulatingAd, setIsSimulatingAd] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  if (!quiz) return null;

  const qCount = getQuestionCount(quiz);

  const handleWatchAd = async () => {
    setIsProcessing(true);
    setAdError(null);

    if (Capacitor.isNativePlatform()) {
      try {
        let rewardEarned = false;

        const success = await showRewardedAd((reward) => {
          console.log('[LockedQuizModal] Rewarded callback fired:', reward);
          rewardEarned = true;
        });

        if (success && rewardEarned) {
          TestAccessManager.unlockTest(quiz.testId);
          onUnlocked(quiz);
        } else {
          setAdError('Ad was closed before completion. Mock test remains locked.');
        }
      } catch (err: any) {
        console.warn('[LockedQuizModal] Native Rewarded Ad Error:', err);
        setAdError('Failed to load video advertisement. Please check your internet connection and try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Browser / Web Environment: Show interactive 5-second simulated rewarded ad
      setIsSimulatingAd(true);
      setCountdown(5);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleClaimWebReward = () => {
    TestAccessManager.unlockTest(quiz.testId);
    setIsSimulatingAd(false);
    setIsProcessing(false);
    onUnlocked(quiz);
  };

  const handleCancelSimulatedAd = () => {
    setIsSimulatingAd(false);
    setIsProcessing(false);
    setAdError('Ad simulation was dismissed. Mock test remains locked.');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[95] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden animate-scaleIn">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing || isSimulatingAd}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSimulatingAd ? (
          /* Web Dev / Simulator View */
          <div className="text-center space-y-5 py-2">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
              <Video className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Watching Sponsored Video
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulating Google AdMob Rewarded Video stream...
              </p>
            </div>

            {/* Countdown timer pill */}
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-black text-purple-700 dark:text-purple-300 block">
                {countdown > 0 ? `Reward unlocks in ${countdown}s...` : '🎉 Reward Ready to Claim!'}
              </span>
              <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {countdown === 0 ? (
                <button
                  onClick={handleClaimWebReward}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Claim Reward &amp; Unlock Test
                </button>
              ) : (
                <button
                  onClick={handleCancelSimulatedAd}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Dismiss / Skip Ad (No Reward)
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Normal Unlock Prompt View */
          <>
            {/* Header Icon & Title */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-sm">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 inline-block">
                  🔒 Locked Mock Test
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {quiz.title}
                </h3>
              </div>
            </div>

            {/* Test Details Pill */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex items-center justify-around text-center text-xs">
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Questions</span>
                <span className="font-black text-slate-800 dark:text-slate-200">📝 {qCount} Qs</span>
              </div>
              <div className="h-6 border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Duration</span>
                <span className="font-black text-slate-800 dark:text-slate-200">⏱️ {quiz.totalTimeMinutes || 20} Mins</span>
              </div>
              <div className="h-6 border-r border-slate-200 dark:border-slate-700" />
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Section</span>
                <span className="font-black text-slate-800 dark:text-slate-200 capitalize">{quiz.category || 'Practice'}</span>
              </div>
            </div>

            {/* Explanatory Message */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
              Watch a quick sponsored video ad to unlock full, unlimited attempts for this test. Unlocks persist locally across app restarts.
            </p>

            {/* Error Message if ad was dismissed */}
            {adError && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-3 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{adError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleWatchAd}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-200 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>Loading Sponsored Ad...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Watch Video Ad to Unlock Test</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LockedQuizModal;
