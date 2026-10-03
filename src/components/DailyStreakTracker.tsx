import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Check, ChevronRight, Award, Zap, Calendar, Sparkles, Trophy, Share2 } from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

interface DailyStreakTrackerProps {
  onStartDailyBooster: () => void;
  hasAttemptedToday: boolean;
  onShareAchievement?: () => void;
  className?: string;
}

interface DayStatus {
  dateStr: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  isCompleted: boolean;
}

export default function DailyStreakTracker({ onStartDailyBooster, hasAttemptedToday, onShareAchievement, className = '' }: DailyStreakTrackerProps) {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [weeklyDays, setWeeklyDays] = useState<DayStatus[]>([]);
  const [completedTodayState, setCompletedTodayState] = useState<boolean>(hasAttemptedToday);

  const calculateStreak = () => {
    if (typeof window === 'undefined') return;

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const todayDone = localStorage.getItem(`dsssb_daily_quiz_attempted_${todayStr}`) === 'true' || hasAttemptedToday;
      setCompletedTodayState(todayDone);

      // Build 7-day week view (Mon to Sun for current week or last 7 days)
      const daysList: DayStatus[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Generate last 7 days including today
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

      // Calculate consecutive streak days walking backwards
      let currentStreak = 0;
      let checkDate = new Date(today);

      if (!todayDone) {
        // If today not done yet, start checking from yesterday to see if streak is still active
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
      console.warn("Failed to calculate streak:", err);
    }
  };

  useEffect(() => {
    calculateStreak();
  }, [hasAttemptedToday]);

  const getMilestoneBadge = (streak: number) => {
    if (streak >= 30) return { title: '30-Day DSSSB Legend', icon: '👑', color: 'from-amber-400 to-yellow-600', border: 'border-amber-300' };
    if (streak >= 14) return { title: '14-Day Consistency Pro', icon: '🏆', color: 'from-purple-500 to-indigo-600', border: 'border-purple-300' };
    if (streak >= 7) return { title: '7-Day Flame Master', icon: '🔥', color: 'from-orange-500 to-rose-600', border: 'border-orange-300' };
    if (streak >= 3) return { title: '3-Day Starter Streak', icon: '⚡', color: 'from-blue-500 to-cyan-600', border: 'border-blue-300' };
    return null;
  };

  const currentMilestone = getMilestoneBadge(streakCount);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.14 }}
      className={`glass-box backdrop-blur-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-2 border-amber-300/70 dark:border-amber-700/60 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl relative overflow-hidden space-y-4 ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-400/10 to-amber-500/0 rounded-full blur-2xl pointer-events-none" />

      {/* Top Banner Row: Streak Counter & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <Glass3dIcon type="flame" size="lg" className="group-hover:scale-110 transition-transform shadow-amber-500/30" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-300/60 dark:border-amber-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-bounce" />
                Daily Challenge Streak
              </span>
              {currentMilestone && (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-300/40">
                  <span>{currentMilestone.icon}</span> {currentMilestone.title}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{streakCount} {streakCount === 1 ? 'Day' : 'Days'} Streak</span>
              {streakCount > 0 && <span className="text-sm font-extrabold text-amber-500">🔥 On Fire!</span>}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {completedTodayState 
                ? "🎉 Fantastic! You completed today's Daily Booster. Come back tomorrow to extend your streak!"
                : "⚡ Complete today's 20 MCQ Daily Booster Quiz to keep your streak alive!"}
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {onShareAchievement && (
            <button
              onClick={onShareAchievement}
              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-200 border border-amber-400/50 font-extrabold text-xs px-3.5 py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              title="Share Achievement Card"
            >
              <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Share Card</span>
            </button>
          )}

          <button
            onClick={onStartDailyBooster}
            className={`shrink-0 flex-1 sm:flex-none font-black text-xs px-5 py-3 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
              completedTodayState 
                ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-orange-500/25'
            }`}
          >
            <span>{completedTodayState ? 'Practice Booster Again' : 'Start Today\'s Challenge'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 7-Day Week Calendar Progress Tracker */}
      <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 relative z-10 space-y-2">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Last 7 Days Progress
          </span>
          <span className="text-amber-700 dark:text-amber-300">
            {weeklyDays.filter(d => d.isCompleted).length} / 7 Days Active
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeklyDays.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-2 rounded-xl sm:rounded-2xl border text-center transition-all ${
                day.isCompleted
                  ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-white border-amber-400 shadow-md shadow-orange-500/20 scale-102'
                  : day.isToday
                    ? 'bg-amber-100/80 dark:bg-amber-950/50 border-2 border-amber-500 text-amber-900 dark:text-amber-200 animate-pulse'
                    : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase opacity-90">
                {day.dayLabel}
              </span>
              <span className="text-xs sm:text-sm font-black my-0.5">
                {day.dayNumber}
              </span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5">
                {day.isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                ) : day.isToday ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
