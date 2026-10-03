import React, { useState, useMemo } from 'react';
import { 
  History, Trophy, Target, Clock, Calendar, CheckCircle2, 
  AlertCircle, ChevronRight, RotateCcw, FileText, Search, 
  ArrowUpDown, Filter, Sparkles, Award, ArrowLeft, Trash2,
  ChevronDown, ChevronUp, Lock, Zap, Flame, BarChart3,
  TrendingUp, AlertTriangle, ShieldCheck, Check, Star, Share2
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';
import { Attempt, Quiz } from '../types';
import { isPassActive, getOrCreateReferralWallet } from '../lib/passSystem';
import ScorecardShareModal from './ScorecardShareModal';

interface MockHistoryViewProps {
  attempts: Attempt[];
  allQuizzes: Quiz[];
  onReviewAttempt: (attempt: Attempt) => void;
  onRetakeQuiz: (quiz: Quiz) => void;
  onDeleteAttempt?: (attemptIndex: number) => void;
  onNavigateToDashboard: () => void;
  isPassUnlocked?: boolean;
  onOpenPassModal?: () => void;
}

export default function MockHistoryView({
  attempts,
  allQuizzes,
  onReviewAttempt,
  onRetakeQuiz,
  onDeleteAttempt,
  onNavigateToDashboard,
  isPassUnlocked: propIsPassUnlocked,
  onOpenPassModal
}: MockHistoryViewProps) {
  const isPassUnlocked = propIsPassUnlocked !== undefined ? propIsPassUnlocked : isPassActive();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'full' | 'partA' | 'partB'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestScore' | 'lowestScore'>('newest');

  // Two separate dropdown view toggle states
  const [isPartWiseOpen, setIsPartWiseOpen] = useState(true);
  const [isSubjectWiseOpen, setIsSubjectWiseOpen] = useState(false);

  // Viral Scorecard & Referral Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMode, setShareMode] = useState<'part-wise' | 'subject-wise' | 'combined'>('combined');
  const userWallet = getOrCreateReferralWallet();

  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  // Group attempts by testId or testTitle so each unique mock test has 1 primary entry
  const groupedAttempts = useMemo(() => {
    const map = new Map<string, Attempt[]>();
    attempts.forEach((a) => {
      const key = a.testId || a.testTitle || 'unknown_mock';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(a);
    });

    const result: {
      key: string;
      latestAttempt: Attempt;
      bestAttempt: Attempt;
      allAttempts: Attempt[];
      timesTaken: number;
    }[] = [];

    map.forEach((groupAttempts, key) => {
      // Sort newest first
      groupAttempts.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());

      const latestAttempt = groupAttempts[0];
      let bestAttempt = groupAttempts[0];
      groupAttempts.forEach((a) => {
        if ((a.score || 0) > (bestAttempt.score || 0)) {
          bestAttempt = a;
        }
      });

      result.push({
        key,
        latestAttempt,
        bestAttempt,
        allAttempts: groupAttempts,
        timesTaken: groupAttempts.length,
      });
    });

    return result;
  }, [attempts]);

  // Filter & Sort Grouped Attempts
  const filteredGroupedAttempts = useMemo(() => {
    let list = [...groupedAttempts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((group) => {
        const a = group.latestAttempt;
        const quizObj = allQuizzes.find(quiz => quiz.testId === a.testId);
        const matchTitle = a.testTitle && a.testTitle.toLowerCase().includes(q);
        const matchSubject = (a.subject && a.subject.toLowerCase().includes(q)) || (quizObj?.subject && quizObj.subject.toLowerCase().includes(q));
        return matchTitle || matchSubject;
      });
    }

    // Category filter
    if (filterCategory === 'full') {
      list = list.filter((group) => {
        const a = group.latestAttempt;
        const quizObj = allQuizzes.find(quiz => quiz.testId === a.testId);
        return quizObj?.category === 'full' || (a.testTitle && a.testTitle.toLowerCase().includes('full'));
      });
    } else if (filterCategory === 'partA') {
      list = list.filter((group) => {
        const a = group.latestAttempt;
        const quizObj = allQuizzes.find(quiz => quiz.testId === a.testId);
        return quizObj?.category === 'part_a' || quizObj?.subject?.toLowerCase().includes('part a') || a.testTitle?.toLowerCase().includes('part a') || a.testTitle?.toLowerCase().includes('part-a');
      });
    } else if (filterCategory === 'partB') {
      list = list.filter((group) => {
        const a = group.latestAttempt;
        const quizObj = allQuizzes.find(quiz => quiz.testId === a.testId);
        const isFull = quizObj?.category === 'full' || (a.testTitle && a.testTitle.toLowerCase().includes('full')) || (a.totalQuestions && a.totalQuestions >= 180);
        const isPartA = quizObj?.category === 'part_a' || (a.testTitle && (a.testTitle.toLowerCase().includes('part a') || a.testTitle.toLowerCase().includes('part-a')));
        return !isFull && !isPartA;
      });
    }

    // Sort order
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.latestAttempt.timestamp).getTime() - new Date(a.latestAttempt.timestamp).getTime());
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.latestAttempt.timestamp).getTime() - new Date(b.latestAttempt.timestamp).getTime());
    } else if (sortBy === 'highestScore') {
      list.sort((a, b) => (b.bestAttempt.score || 0) - (a.bestAttempt.score || 0));
    } else if (sortBy === 'lowestScore') {
      list.sort((a, b) => (a.latestAttempt.score || 0) - (b.latestAttempt.score || 0));
    }

    return list;
  }, [groupedAttempts, searchQuery, filterCategory, sortBy, allQuizzes]);

  // Overall Performance Statistics
  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { totalAttempts: 0, uniqueMocks: 0, avgScore: 0, avgAccuracy: 0, bestScore: 0 };
    }
    const totalAttempts = attempts.length;
    const uniqueMocks = groupedAttempts.length;
    const avgScore = (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts).toFixed(1);
    const avgAccuracy = Math.round(attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalAttempts);
    const bestScore = Math.max(...attempts.map((a) => a.score || 0));

    return { totalAttempts, uniqueMocks, avgScore, avgAccuracy, bestScore };
  }, [attempts, groupedAttempts]);

  // ==========================================
  // DYNAMIC PREDICTIVE EXAM CLEARING ENGINE
  // ==========================================
  const predictiveInsights = useMemo(() => {
    if (attempts.length === 0) {
      return {
        hasData: false,
        partAAvg: 0,
        partBAvg: 0,
        projectedScore: 0,
        clearingChance: 0,
        statusLabel: 'No Mocks Attempted Yet',
        statusColor: 'text-slate-500',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        partACleared: false,
        partBCleared: false,
        advice: 'Attempt your first free mock test to calculate your real-time clearing chances.'
      };
    }

    const partAAttempts: Attempt[] = [];
    const partBAttempts: Attempt[] = [];
    const fullAttempts: Attempt[] = [];

    attempts.forEach(a => {
      const q = allQuizzes.find(quiz => quiz.testId === a.testId);
      const titleLower = (a.testTitle || '').toLowerCase();
      const subLower = (a.subject || '').toLowerCase();

      if (q?.category === 'full' || titleLower.includes('full mock') || (a.totalQuestions && a.totalQuestions >= 180)) {
        fullAttempts.push(a);
      } else if (q?.category === 'part_a' || subLower.includes('part a') || titleLower.includes('part a')) {
        partAAttempts.push(a);
      } else {
        partBAttempts.push(a);
      }
    });

    // Compute Part A average (normalized to 100 marks scale)
    let partAScoreNormalized = 0;
    if (partAAttempts.length > 0) {
      const sum = partAAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
      partAScoreNormalized = sum / partAAttempts.length;
    } else if (fullAttempts.length > 0) {
      // Estimate from full mocks (typically 50% weight)
      const fullAvg = fullAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / fullAttempts.length;
      partAScoreNormalized = fullAvg * 0.48; // estimated Part A share
    } else {
      partAScoreNormalized = 45; // baseline assumption if only Part B solved
    }

    // Compute Part B average (normalized to 100 marks scale)
    let partBScoreNormalized = 0;
    if (partBAttempts.length > 0) {
      const sum = partBAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
      partBScoreNormalized = sum / partBAttempts.length;
    } else if (fullAttempts.length > 0) {
      const fullAvg = fullAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / fullAttempts.length;
      partBScoreNormalized = fullAvg * 0.52; // estimated Part B share
    } else {
      partBScoreNormalized = 45; // baseline assumption if only Part A solved
    }

    // Normalize scale to 0-100
    partAScoreNormalized = Math.min(100, Math.max(0, partAScoreNormalized));
    partBScoreNormalized = Math.min(100, Math.max(0, partBScoreNormalized));

    const projectedTotal = Math.round((partAScoreNormalized + partBScoreNormalized) * 10) / 10;
    const partACleared = partAScoreNormalized >= 40;
    const partBCleared = partBScoreNormalized >= 40;

    let clearingChance = 0;
    let statusLabel = 'Moderate';
    let statusColor = 'text-amber-600 dark:text-amber-400';
    let badgeBg = 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300';
    let advice = '';

    if (!partACleared || !partBCleared) {
      clearingChance = Math.min(35, Math.round((projectedTotal / 200) * 45));
      statusLabel = '⚠️ Below Sectional Cutoff';
      statusColor = 'text-rose-600 dark:text-rose-400';
      badgeBg = 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300';
      if (!partACleared && !partBCleared) {
        advice = 'Critical: You need at least 40% (40/100) in both Part A and Part B separately to qualify.';
      } else if (!partACleared) {
        advice = `Part A average is ${partAScoreNormalized.toFixed(1)}/100 (needs ${(40 - partAScoreNormalized).toFixed(1)}+ marks to cross the mandatory 40% sectional cutoff).`;
      } else {
        advice = `Part B average is ${partBScoreNormalized.toFixed(1)}/100 (needs ${(40 - partBScoreNormalized).toFixed(1)}+ marks to cross the mandatory 40% domain cutoff).`;
      }
    } else if (projectedTotal < 110) {
      clearingChance = 52;
      statusLabel = '🟡 Qualified Sectionally (Cutoff Risk)';
      statusColor = 'text-amber-600 dark:text-amber-400';
      badgeBg = 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300';
      advice = `Both sections qualified (≥40%), but total projected score (${projectedTotal}/200) is close to borderline merit. Aim for 125+ for a safe selection.`;
    } else if (projectedTotal < 130) {
      clearingChance = 78;
      statusLabel = '🟢 High Selection Probability';
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      badgeBg = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300';
      advice = `Strong performance! Projected score of ${projectedTotal}/200 comfortably clears typical DoE Delhi cutoffs (115–125 marks). Maintain consistency!`;
    } else {
      clearingChance = 94;
      statusLabel = '🔥 Top Ranker Territory';
      statusColor = 'text-purple-600 dark:text-purple-400';
      badgeBg = 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300';
      advice = `Outstanding! Projected score of ${projectedTotal}/200 places you in the top 1% ranker bracket. Keep practicing to solidify timing.`;
    }

    return {
      hasData: true,
      partAAvg: Math.round(partAScoreNormalized * 10) / 10,
      partBAvg: Math.round(partBScoreNormalized * 10) / 10,
      projectedScore: projectedTotal,
      clearingChance,
      statusLabel,
      statusColor,
      badgeBg,
      partACleared,
      partBCleared,
      advice,
      totalPartAMocks: partAAttempts.length,
      totalPartBMocks: partBAttempts.length,
      totalFullMocks: fullAttempts.length
    };
  }, [attempts, allQuizzes]);

  // ==========================================
  // DYNAMIC SUBJECT-WISE AVERAGE SCORES
  // ==========================================
  const subjectBreakdown = useMemo(() => {
    const subjectMap: Record<string, { attempts: number; totalScore: number; totalAccuracy: number; totalQuestions: number; category: string }> = {};

    attempts.forEach(a => {
      const q = allQuizzes.find(quiz => quiz.testId === a.testId);
      const subj = q?.subject || a.subject || 'Computer Science';
      const cat = q?.category || (a.testTitle?.toLowerCase().includes('part a') ? 'part_a' : 'part_b');

      if (!subjectMap[subj]) {
        subjectMap[subj] = { attempts: 0, totalScore: 0, totalAccuracy: 0, totalQuestions: 0, category: cat };
      }
      subjectMap[subj].attempts += 1;
      subjectMap[subj].totalScore += (a.score || 0);
      subjectMap[subj].totalAccuracy += (a.accuracy || 0);
      subjectMap[subj].totalQuestions += (a.totalQuestions || 20);
    });

    return Object.entries(subjectMap).map(([subjectName, data]) => {
      const avgScore = (data.totalScore / data.attempts).toFixed(1);
      const avgAccuracy = Math.round(data.totalAccuracy / data.attempts);
      let strength: 'High' | 'Good' | 'Needs Work' | 'Critical' = 'Good';

      if (avgAccuracy >= 80) strength = 'High';
      else if (avgAccuracy >= 65) strength = 'Good';
      else if (avgAccuracy >= 45) strength = 'Needs Work';
      else strength = 'Critical';

      return {
        subjectName,
        category: data.category,
        attempts: data.attempts,
        avgScore,
        avgAccuracy,
        strength
      };
    }).sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore));
  }, [attempts, allQuizzes]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-3 sm:px-6 transition-colors duration-200">
      
      {/* Top Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToDashboard}
            className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs flex items-center justify-center cursor-pointer shrink-0 group"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                <span>Mock History &amp; Predictive Analytics</span>
              </h1>
              <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
              Comprehensive attempt archive, real-time subject averages &amp; predictive exam clearing engine
            </p>
          </div>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setShareMode('combined');
              setIsShareModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Share Performance Scorecard Graphic with your referral link"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Share Analytics Graphic</span>
          </button>

          {!isPassUnlocked && onOpenPassModal && (
            <button
              onClick={onOpenPassModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock Premium Analytics</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Aggregate Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalAttempts}</div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{stats.uniqueMocks} unique tests taken</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Score</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.avgScore}</div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Across all sessions</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Accuracy</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.avgAccuracy}%</div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Scoring precision</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Highest Marks</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{stats.bestScore}</div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Personal best</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* PREDICTIVE CHANCES OF CLEARING EXAM & SECTIONAL CUTOFF ENGINE */}
        {/* ==================================================================== */}
        {isPassUnlocked ? (
          /* UNLOCKED PREMIUM PREDICTIVE ENGINE */
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-indigo-500/40 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                    PREMIUM FEATURE
                  </span>
                  <span className="text-indigo-200 text-xs font-bold">
                    DSSSB CBT Cutoff Predictor
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <span>Real-Time Chances of Clearing DSSSB 2026</span>
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setShareMode('combined');
                    setIsShareModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Share Cutoff Analysis Graphic"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Share Graphic</span>
                </button>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">
                    Probability of Selection
                  </span>
                  <span className="text-3xl font-black text-amber-300">
                    {predictiveInsights.clearingChance}%
                  </span>
                </div>
              </div>
            </div>

            {/* Gauge & Score Forecast Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Box 1: Part A Sectional Average */}
              <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-200 uppercase">Part A Sectional Avg</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${predictiveInsights.partACleared ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'}`}>
                    {predictiveInsights.partACleared ? '✓ Cutoff Cleared (≥40%)' : '✗ Cutoff Failed (<40%)'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{predictiveInsights.partAAvg}</span>
                  <span className="text-xs text-indigo-300 font-bold">/ 100 Marks</span>
                </div>
                <p className="text-[11px] text-indigo-200 leading-tight">
                  Mandatory DSSSB rule: Minimum 40 marks required to qualify for merit.
                </p>
              </div>

              {/* Box 2: Part B CS Sectional Average */}
              <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-200 uppercase">Part B Domain Avg</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${predictiveInsights.partBCleared ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'}`}>
                    {predictiveInsights.partBCleared ? '✓ Cutoff Cleared (≥40%)' : '✗ Cutoff Failed (<40%)'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{predictiveInsights.partBAvg}</span>
                  <span className="text-xs text-indigo-300 font-bold">/ 100 Marks</span>
                </div>
                <p className="text-[11px] text-indigo-200 leading-tight">
                  Subject domain: CS Theory, Programming, OS, DBMS &amp; Pedagogy.
                </p>
              </div>

              {/* Box 3: Projected Total Merit Score */}
              <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase">Projected Total Score</span>
                  <span className="text-[10px] font-bold text-slate-300">Target: 125+</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-amber-300">{predictiveInsights.projectedScore}</span>
                  <span className="text-xs text-indigo-300 font-bold">/ 200 Marks</span>
                </div>
                <p className="text-[11px] text-indigo-200 leading-tight">
                  Based on your current attempt history. Updates live after each test!
                </p>
              </div>
            </div>

            {/* Dynamic Advice & Status Badge */}
            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-indigo-300">Predictive Engine Diagnosis:</span>
                <p className="text-slate-200 font-medium">{predictiveInsights.advice}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black shrink-0 ${predictiveInsights.badgeBg}`}>
                {predictiveInsights.statusLabel}
              </div>
            </div>

          </div>
        ) : (
          /* PROMOTIONAL BRANDING CARD FOR FREE USERS (LOCKED PREVIEW) */
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 border-2 border-indigo-400/50 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    PREMIUM TOOL
                  </span>
                  <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Predictive Cutoff Engine
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Unlock Live Subject Averages &amp; Chances of Clearing DSSSB Exam
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
                  Get real-time probability estimates for clearing the DSSSB exam, separate Part A vs Part B mandatory 40% cutoff validation, and dynamic subject-by-subject score projections that update with every single mock you attempt!
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-amber-300 justify-center md:justify-start flex-wrap">
                  <span className="flex items-center gap-1">✓ Live Subject Averages</span>
                  <span className="flex items-center gap-1">✓ Sectional 40% Cutoff Checker</span>
                  <span className="flex items-center gap-1">✓ Real-Time Probability of Selection</span>
                </div>
              </div>

              <div className="shrink-0 text-center space-y-2">
                <button
                  onClick={onOpenPassModal}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock With Pass (From ₹19)</span>
                </button>
                <span className="text-[10px] text-indigo-200 block">
                  3 Plans: ₹19 (1 Month) • ₹49 (3 Months) • ₹99 (Lifetime)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TWO SEPARATE DROPDOWN VIEWS: PART-WISE & SUBJECT-WISE BREAKDOWNS */}
        {/* PREMIUM FEATURE: Locked for free users with promotional branding */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          
          {/* Dropdown View 1: Part-Wise Sectional Score Analysis */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <button
              onClick={() => setIsPartWiseOpen(!isPartWiseOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Part-Wise Sectional Average Scores
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Part A vs Part B
                    </span>
                    {!isPassUnlocked && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Premium Feature
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sectional breakdown against mandatory 40% (40/100) DSSSB qualifying threshold
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-bold hidden sm:inline">
                  {isPartWiseOpen ? 'Collapse' : 'Expand View'}
                </span>
                {isPartWiseOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {isPartWiseOpen && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {isPassUnlocked ? (
                  /* UNLOCKED PART-WISE BREAKDOWN */
                  <div className="space-y-3 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60">
                      <div className="text-xs">
                        <span className="font-black text-indigo-900 dark:text-indigo-200 block">
                          DSSSB Mandatory Sectional Radar (Part A vs Part B)
                        </span>
                        <span className="text-[11px] text-indigo-700/80 dark:text-indigo-300">
                          Real-time 40% cutoff validation for both sections
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShareMode('part-wise');
                          setIsShareModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-95"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Share Part-Wise Graphic</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Part A Card */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-indigo-700 dark:text-indigo-400">
                            Part A (General Section)
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            5 Subjects • 100 Qs
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {predictiveInsights.partAAvg}
                          </span>
                          <span className="text-xs font-bold text-slate-400">/ 100 Average Score</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-300 text-[11px]">
                            <span>40% Mandatory Qualifying Mark</span>
                            <strong className={predictiveInsights.partACleared ? 'text-emerald-600' : 'text-rose-600'}>
                              {predictiveInsights.partACleared ? 'Qualified (≥40)' : 'Not Yet Qualified (<40)'}
                            </strong>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${predictiveInsights.partACleared ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, (predictiveInsights.partAAvg / 100) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Part B Card */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-purple-700 dark:text-purple-400">
                            Part B (Computer Science Domain)
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Subject + Pedagogy • 100 Qs
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {predictiveInsights.partBAvg}
                          </span>
                          <span className="text-xs font-bold text-slate-400">/ 100 Average Score</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-300 text-[11px]">
                            <span>40% Mandatory Qualifying Mark</span>
                            <strong className={predictiveInsights.partBCleared ? 'text-emerald-600' : 'text-rose-600'}>
                              {predictiveInsights.partBCleared ? 'Qualified (≥40)' : 'Not Yet Qualified (<40)'}
                            </strong>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${predictiveInsights.partBCleared ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, (predictiveInsights.partBAvg / 100) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PROMOTIONAL BRANDING CARD FOR PART-WISE SCORE TOOL */
                  <div className="pt-3">
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 border-2 border-indigo-400/50 text-white overflow-hidden shadow-xl text-center space-y-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/30 shadow-inner">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="max-w-lg mx-auto space-y-2">
                        <div className="flex items-center gap-2 justify-center flex-wrap">
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                            PREMIUM ANALYTICS TOOL
                          </span>
                          <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Sectional 40% Cutoff Radar
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          Unlock Live Part A &amp; Part B Sectional Averages
                        </h4>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                          In DSSSB CBT, candidates MUST score at least 40% in Part A and Part B separately to qualify. This tool continuously recalculates your sectional averages after every mock test to ensure you never fail the cutoff.
                        </p>
                      </div>
                      <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        {onOpenPassModal && (
                          <button
                            onClick={onOpenPassModal}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Unlock Part-Wise Averages (From ₹19)</span>
                          </button>
                        )}
                        <span className="text-[11px] text-indigo-300 font-semibold">
                          Available on all Pass plans: ₹19 (1 Month) • ₹49 (3 Months) • ₹99 (Lifetime)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dropdown View 2: Subject-Wise Average Scores */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <button
              onClick={() => setIsSubjectWiseOpen(!isSubjectWiseOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Subject-Wise Performance &amp; Average Scores
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Topic Mastery
                    </span>
                    {!isPassUnlocked && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Premium Feature
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Live dynamic averages across each Computer Science &amp; General subject
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-bold hidden sm:inline">
                  {isSubjectWiseOpen ? 'Collapse' : 'Expand View'}
                </span>
                {isSubjectWiseOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {isSubjectWiseOpen && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {isPassUnlocked ? (
                  /* UNLOCKED SUBJECT MASTERY TABLE */
                  <div className="pt-3 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
                      <div className="text-xs">
                        <span className="font-black text-purple-900 dark:text-purple-200 block">
                          Computer Science &amp; General Subject Mastery Tracker
                        </span>
                        <span className="text-[11px] text-purple-700/80 dark:text-purple-300">
                          Average marks, attempted count and accuracy rating per domain
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShareMode('subject-wise');
                          setIsShareModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-95"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Share Subject-Wise Graphic</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      {subjectBreakdown.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500">
                          No subject-specific mock attempts recorded yet. Attempt a subject or full mock to generate your subject mastery table.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                              <th className="py-2.5 px-3">Subject / Topic</th>
                              <th className="py-2.5 px-3">Mocks Attempted</th>
                              <th className="py-2.5 px-3">Average Score</th>
                              <th className="py-2.5 px-3">Accuracy</th>
                              <th className="py-2.5 px-3 text-right">Mastery Rating</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                            {subjectBreakdown.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-3">
                                  <span className="font-bold text-slate-900 dark:text-white block">
                                    {row.subjectName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                    {row.category === 'part_a' ? 'Part A General' : 'Part B Domain CS'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                                  {row.attempts} {row.attempts === 1 ? 'mock' : 'mocks'}
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                                  {row.avgScore}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    {row.avgAccuracy}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    row.strength === 'High'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : row.strength === 'Good'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                      : row.strength === 'Needs Work'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}>
                                    {row.strength}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ) : (
                  /* PROMOTIONAL BRANDING CARD FOR SUBJECT-WISE SCORE TOOL */
                  <div className="pt-3">
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 border-2 border-purple-400/50 text-white overflow-hidden shadow-xl text-center space-y-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-purple-400/20 text-purple-300 flex items-center justify-center mx-auto border border-purple-400/30 shadow-inner">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="max-w-lg mx-auto space-y-2">
                        <div className="flex items-center gap-2 justify-center flex-wrap">
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                            PREMIUM EXCLUSIVE TOOL
                          </span>
                          <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Dynamic Subject Mastery
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          Continuous Subject-Wise Average Scoring Engine
                        </h4>
                        <p className="text-xs text-purple-100 leading-relaxed">
                          Get continuous real-time average marks across Operating Systems, DBMS, Python, Networking, Pedagogy, Math, Reasoning, English &amp; Hindi. The engine recalculates your strengths and weakness automatically after every single test!
                        </p>
                      </div>
                      <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        {onOpenPassModal && (
                          <button
                            onClick={onOpenPassModal}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Unlock Subject Mastery Table (From ₹19)</span>
                          </button>
                        )}
                        <span className="text-[11px] text-purple-300 font-semibold">
                          Available on all Pass plans: ₹19 (1 Month) • ₹49 (3 Months) • ₹99 (Lifetime)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ==================================================================== */}
        {/* MOCK ATTEMPT ARCHIVE & FILTERS */}
        {/* ==================================================================== */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test name or subject..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Tabs & Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              {[
                { id: 'all', label: 'All Mocks' },
                { id: 'full', label: 'Full Mocks' },
                { id: 'partA', label: 'Part A Mocks' },
                { id: 'partB', label: 'Subject-Wise Mocks' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCategory === f.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highestScore">Highest Score</option>
                <option value="lowestScore">Lowest Score</option>
              </select>
            </div>
          </div>

        </div>

        {/* Mock Test History List */}
        {filteredGroupedAttempts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                No Mock Attempts Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchQuery || filterCategory !== 'all' 
                  ? 'No attempts matched your search or category filter. Try clearing filters.'
                  : 'You have not taken any mock tests yet. Start with Mock 1 or 2 for free!'}
              </p>
            </div>
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Go to Practice Mocks</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroupedAttempts.map((group) => {
              const { key, latestAttempt, bestAttempt, allAttempts, timesTaken } = group;
              const isExpanded = expandedGroupKey === key;
              const quizObj = allQuizzes.find(q => q.testId === latestAttempt.testId);

              const latestDate = new Date(latestAttempt.timestamp);
              const formattedDate = latestDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={key}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {quizObj?.category === 'part_b' ? 'Part B CS' : quizObj?.category === 'part_a' ? 'Part A General' : 'Full Mock'}
                        </span>
                        {timesTaken > 1 && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {timesTaken} Attempts
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {latestAttempt.testTitle}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>Latest Score: <strong className="text-slate-900 dark:text-white">{latestAttempt.score}</strong></span>
                        {timesTaken > 1 && (
                          <span>Best: <strong className="text-emerald-600 dark:text-emerald-400">{bestAttempt.score}</strong></span>
                        )}
                        <span>Acc: <strong className="text-slate-700 dark:text-slate-300">{latestAttempt.accuracy}%</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onReviewAttempt(latestAttempt)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Solutions</span>
                      </button>

                      {quizObj && (
                        <button
                          onClick={() => onRetakeQuiz(quizObj)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reattempt</span>
                        </button>
                      )}

                      {timesTaken > 1 && (
                        <button
                          onClick={() => setExpandedGroupKey(isExpanded ? null : key)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                          title="View all reattempt records"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reattempt History Drawer */}
                  {isExpanded && timesTaken > 1 && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        All Reattempt Timestamps:
                      </span>
                      <div className="space-y-1.5 divide-y divide-slate-200/60 dark:divide-slate-700/50">
                        {allAttempts.map((att, attIdx) => {
                          const attDate = new Date(att.timestamp);
                          const attDateStr = attDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          });
                          const attTimeStr = attDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div key={attIdx} className="pt-1.5 flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-extrabold text-slate-400 text-[11px]">
                                  Attempt #{timesTaken - attIdx}
                                </span>
                                <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                                  {attDateStr} at {attTimeStr}
                                </span>
                                {attIdx === 0 && (
                                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold rounded shrink-0">
                                    Latest
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Score: {att.score}
                                </span>
                                <span className="text-slate-500 font-medium hidden sm:inline">
                                  ({att.accuracy}% Acc)
                                </span>
                                <button
                                  onClick={() => onReviewAttempt(att)}
                                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" /> Solutions
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Share Scorecard Graphic Modal with Viral Referral Link */}
      <ScorecardShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialMode={shareMode}
        referralCode={userWallet.code}
        predictiveInsights={predictiveInsights}
        subjectBreakdown={subjectBreakdown}
        stats={stats}
      />

    </div>
  );
}
