import React, { useState } from 'react';
import { Target, Sparkles, CheckCircle2, Flame, ChevronRight, Settings2, Zap } from 'lucide-react';
import { Attempt } from '../types';
import { getDailyGoalStatus, setDailyGoalTarget } from '../lib/dailyGoalTracker';

interface DailyGoalWidgetProps {
  attempts: Attempt[];
  onStartPractice?: () => void;
  className?: string;
}

export default function DailyGoalWidget({
  attempts,
  onStartPractice,
  className = ''
}: DailyGoalWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const goalStatus = getDailyGoalStatus(attempts);
  const [currentTarget, setCurrentTarget] = useState(goalStatus.targetGoal);

  // SVG Progress Ring calculations
  const radius = 38;
  const strokeWidth = 7;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (goalStatus.percentage / 100) * circumference;

  const handleTargetChange = (newTarget: number) => {
    setCurrentTarget(newTarget);
    setDailyGoalTarget(newTarget);
    setShowSettings(false);
  };

  return (
    <div className={`bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden ${className}`}>
      
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Ring + Stats */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          
          {/* Circular SVG Progress Ring */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                className="text-slate-200 dark:text-slate-800"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#goalGradient)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <defs>
                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content of Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {goalStatus.isCompleted ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">100%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                    {goalStatus.percentage}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 leading-none mt-0.5">GOAL</span>
                </div>
              )}
            </div>
          </div>

          {/* Text Info */}
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Daily Practice Goal
              </span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                title="Customize daily question target"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {goalStatus.answeredToday}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {goalStatus.targetGoal} Questions Solved Today
              </span>
            </div>

            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              {goalStatus.isCompleted ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Goal Crushed! Your practice streak is locked for today! 🔥
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <strong>{goalStatus.remaining} more questions</strong> to reach today's target!
                </span>
              )}
            </p>
          </div>

        </div>

        {/* Right: Quick Action Button */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          {onStartPractice && !goalStatus.isCompleted && (
            <button
              onClick={onStartPractice}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continue Daily Goal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {goalStatus.isCompleted && onStartPractice && (
            <button
              onClick={onStartPractice}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Keep Practicing</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Target Settings Popover */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-2 flex-wrap text-xs animate-fadeIn">
          <span className="font-bold text-slate-700 dark:text-slate-300">Set Daily Target:</span>
          <div className="flex items-center gap-1.5">
            {[15, 25, 50, 75].map((targetNum) => (
              <button
                key={targetNum}
                onClick={() => handleTargetChange(targetNum)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  currentTarget === targetNum
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {targetNum} Qs
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
