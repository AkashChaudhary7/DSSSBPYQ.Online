import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Flame, Zap, ArrowRight, Target, Award, Bell } from 'lucide-react';

// Official Exam Target Date: 27 November 2026 (27-11-2026)
export const EXAM_TARGET_DATE_STR = '2026-11-27T09:00:00+05:30';
export const EXAM_DISPLAY_DATE = '27 Nov 2026';
export const EXAM_RAW_DATE = '27-11-2026';
export const EXAM_NAME = 'DSSSB TGT Computer Science';

export interface CountdownTime {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function calculateExamCountdown(targetIso: string = EXAM_TARGET_DATE_STR): CountdownTime {
  const targetTime = new Date(targetIso).getTime();
  const now = Date.now();
  const totalMs = targetTime - now;

  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true
    };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isPast: false
  };
}

interface ExamCountdownWidgetProps {
  variant?: 'card' | 'compact' | 'pill' | 'banner';
  onStartPractice?: () => void;
  className?: string;
}

export default function ExamCountdownWidget({
  variant = 'card',
  onStartPractice,
  className = ''
}: ExamCountdownWidgetProps) {
  const [countdown, setCountdown] = useState<CountdownTime>(() => calculateExamCountdown());

  useEffect(() => {
    // Tick every second for live countdown
    const timer = setInterval(() => {
      setCountdown(calculateExamCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 1. Compact Header Pill Variant
  if (variant === 'pill' || variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all select-none shadow-2xs ${
          countdown.isPast
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            : 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-rose-500/20 border-amber-300/80 dark:border-amber-700/80 text-amber-950 dark:text-amber-200'
        } ${className}`}
        title={`DSSSB Exam Date: ${EXAM_RAW_DATE} (${EXAM_DISPLAY_DATE}) • ${countdown.days} Days Left`}
      >
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-[11px] font-black tracking-tight flex items-center gap-1">
          <span className="hidden lg:inline text-slate-600 dark:text-slate-400 font-bold">Exam Date:</span>
          <span className="font-mono font-extrabold text-slate-900 dark:text-white">{EXAM_RAW_DATE}</span>
          <span className="text-amber-600 dark:text-amber-400 font-black">•</span>
          <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-md text-[10px] uppercase shadow-2xs">
            {countdown.days} {countdown.days === 1 ? 'Day' : 'Days'} Left
          </span>
        </span>
      </div>
    );
  }

  // 2. Banner Variant (e.g. ribbon below header or alert)
  if (variant === 'banner') {
    return (
      <div className={`w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between gap-3 shadow-sm ${className}`}>
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              EXAM DATE ALERT
            </span>
            <span className="text-slate-950 font-black tracking-tight">
              {EXAM_NAME} Scheduled for <span className="underline underline-offset-2">{EXAM_DISPLAY_DATE}</span> ({EXAM_RAW_DATE})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/90 text-slate-950 px-2.5 py-1 rounded-lg font-mono font-black text-xs shadow-2xs">
              ⏳ {countdown.days} Days : {String(countdown.hours).padStart(2, '0')}h : {String(countdown.minutes).padStart(2, '0')}m Left
            </div>
            {onStartPractice && (
              <button
                onClick={onStartPractice}
                className="bg-slate-950 text-white hover:bg-slate-900 px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer shadow-xs"
              >
                Start Practice →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Full Featured Card Variant (Perfect for Dashboard Top Row)
  return (
    <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border-2 border-amber-300/80 dark:border-amber-600/50 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50/50 dark:from-slate-900 dark:via-amber-950/20 dark:to-orange-950/30 p-4 sm:p-5 shadow-sm transition-all ${className}`}>
      
      {/* Decorative Background Highlights */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-gradient-to-tr from-rose-400/20 to-amber-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left Side: Exam Target & Info */}
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-950"></span>
              </span>
              Official Target Exam Date
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
              <Calendar className="w-3 h-3" />
              {EXAM_RAW_DATE} ({EXAM_DISPLAY_DATE})
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{EXAM_NAME}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              Strict CBT Exam Date set to <strong className="text-slate-900 dark:text-white font-extrabold">{EXAM_RAW_DATE}</strong>. Maximize your score with daily timed full CBT mocks!
            </p>
          </div>
        </div>

        {/* Right Side: Digital Countdown Digits */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-stretch md:self-auto justify-between sm:justify-start">
          
          {/* Days Box */}
          <div className="flex-1 sm:flex-none flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 border-2 border-amber-400/80 dark:border-amber-500/60 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 min-w-[68px] sm:min-w-[76px] shadow-sm">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
              {countdown.days}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              Days Left
            </span>
          </div>

          <span className="text-lg font-black text-amber-500 dark:text-amber-400 animate-pulse">:</span>

          {/* Hours Box */}
          <div className="flex-1 sm:flex-none flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[62px] shadow-2xs">
            <span className="text-lg sm:text-xl font-black font-mono text-slate-800 dark:text-slate-200 leading-none">
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
              Hours
            </span>
          </div>

          <span className="text-lg font-black text-slate-400 dark:text-slate-600">:</span>

          {/* Mins Box */}
          <div className="flex-1 sm:flex-none flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[62px] shadow-2xs">
            <span className="text-lg sm:text-xl font-black font-mono text-slate-800 dark:text-slate-200 leading-none">
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
              Mins
            </span>
          </div>

          <span className="text-lg font-black text-slate-400 dark:text-slate-600">:</span>

          {/* Secs Box */}
          <div className="flex-1 sm:flex-none flex flex-col items-center justify-center bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-[56px] sm:min-w-[62px] shadow-2xs">
            <span className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400 leading-none">
              {String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
              Secs
            </span>
          </div>

        </div>

      </div>

      {/* Motivational Urgency Footer Line */}
      <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>Daily Mission: 1 Full Mock (200 Qs) or 2 Topic Quizzes every day before 27-11-2026.</span>
        </div>

        {onStartPractice && (
          <button
            onClick={onStartPractice}
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-black cursor-pointer group transition-colors text-xs"
          >
            <span>Practice Today&apos;s Mock</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

    </div>
  );
}
