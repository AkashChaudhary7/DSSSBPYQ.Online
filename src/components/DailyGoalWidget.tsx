import React, { useState, useEffect } from 'react';
import { Target, Sparkles, CheckCircle2, Flame, ChevronRight, Settings2, Zap, Calendar, Sliders } from 'lucide-react';
import { Attempt } from '../types';
import { getDailyGoalStatus, setDailyGoalTarget } from '../lib/dailyGoalTracker';

interface DailyGoalWidgetProps {
  attempts: Attempt[];
  onStartPractice?: () => void;
  onStartDailyBooster?: () => void;
  hasAttemptedDailyBooster?: boolean;
  onOpenCustomMock?: () => void;
  className?: string;
}

interface DayStatus {
  dateStr: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  isCompleted: boolean;
}

export default function DailyGoalWidget({
  attempts,
  onStartPractice,
  onStartDailyBooster,
  hasAttemptedDailyBooster = false,
  onOpenCustomMock,
  className = ''
}: DailyGoalWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const goalStatus = getDailyGoalStatus(attempts);
  const [currentTarget, setCurrentTarget] = useState(goalStatus.targetGoal);

  const [streakCount, setStreakCount] = useState<number>(0);
  const [weeklyDays, setWeeklyDays] = useState<DayStatus[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const todayDone = localStorage.getItem(`dsssb_daily_quiz_attempted_${todayStr}`) === 'true' || hasAttemptedDailyBooster || goalStatus.isCompleted;

      // 7-day week calculation (last 7 days)
      const daysList: DayStatus[] = [];
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        const isToday = i === 0;
        const isCompleted = localStorage.getItem(`dsssb_daily_quiz_attempted_${dateStr}`) === 'true' || (isToday && todayDone);

        daysList.push({
          dateStr,
          dayLabel: dayNames[d.getDay()],
          dayNumber: d.getDate(),
          isToday,
          isCompleted
        });
      }
      setWeeklyDays(daysList);

      // Streak calculation
      let currentStreak = 0;
      let checkDate = new Date(today);

      if (!todayDone) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      let maxDays = 365;
      while (maxDays > 0) {
        maxDays--;
        const yyyy = checkDate.getFullYear();
        const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
        const dd = String(checkDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const isDone = localStorage.getItem(`dsssb_daily_quiz_attempted_${dateStr}`) === 'true' || (dateStr === todayStr && todayDone);

        if (isDone) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setStreakCount(currentStreak);
    } catch (err) {
      console.warn('Failed to calculate streak in DailyGoalWidget:', err);
    }
  }, [hasAttemptedDailyBooster, goalStatus.isCompleted, attempts]);

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
    <div className={`bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between ${className}`}>
      
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Ring + Goal Info */}
        <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Daily Goal
              </span>

              {/* Merged Streak Badge */}
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 dark:bg-amber-950/90 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {streakCount} Day Streak
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
                  Goal Crushed! Streak active! 🔥
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <strong>{goalStatus.remaining} Qs left</strong> for today's target!
                </span>
              )}
            </p>
          </div>

        </div>

        {/* Right Desktop Quick Action Buttons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {onOpenCustomMock && (
            <button
              onClick={onOpenCustomMock}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Build Custom Practice Mock"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Custom Mock</span>
            </button>
          )}

          {onStartPractice && !goalStatus.isCompleted && (
            <button
              onClick={onStartPractice}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continue Goal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {goalStatus.isCompleted && onStartPractice && (
            <button
              onClick={onStartPractice}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Keep Practicing</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* MERGED MOBILE STREAK & ACTION BAR (Only visible on Mobile view sm:hidden) */}
      <div className="block sm:hidden mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 space-y-3">
        
        {/* Mobile 7-Day Weekly Streak Dots */}
        <div className="flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            7-Day Streak
          </span>
          <div className="flex items-center gap-1.5">
            {weeklyDays.map((day, idx) => (
              <div
                key={day.dateStr || idx}
                className={`w-6 h-6 rounded-lg flex flex-col items-center justify-center text-[9px] font-black transition-all ${
                  day.isCompleted
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xs'
                    : day.isToday
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
                title={`${day.dateStr}: ${day.isCompleted ? 'Completed' : 'Pending'}`}
              >
                <span>{day.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          {onStartDailyBooster && (
            <button
              onClick={onStartDailyBooster}
              className={`py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                hasAttemptedDailyBooster
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{hasAttemptedDailyBooster ? 'Booster Done' : 'Daily Booster'}</span>
            </button>
          )}

          {onOpenCustomMock && (
            <button
              onClick={onOpenCustomMock}
              className="py-2 px-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Mock</span>
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
