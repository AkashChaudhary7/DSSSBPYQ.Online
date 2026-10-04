import React, { useState, useMemo } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { isMockUnlocked } from '../lib/passSystem';
import { 
  Trophy, Share2, Lock, Clock, CheckCircle2, Sparkles, Search, Layers, ShieldCheck, Zap 
} from 'lucide-react';
import { getMockNumberLabel, getQuestionCount, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';
import Pagination from './Pagination';

interface CsFullMocksHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status?: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  getMockUnlockStatus?: (testIndex: number, nowMs?: number) => MockUnlockStatus;
}

export const CsFullMocksHub: React.FC<CsFullMocksHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  getMockUnlockStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20;

  // Filter 200-Question CS Full Mocks
  const csFullMocks = useMemo(() => {
    const list = quizzes.filter(q => {
      const isPartA = 
        q.category === 'part_a_full' || 
        (q.file && q.file.includes('Part A full')) || 
        (q.subject && q.subject.toLowerCase().includes('part a full mock')) ||
        (q.isPartA && (q.category === 'full' || (q.totalQuestions || 0) >= 50));
      
      if (isPartA) return false;

      const isCsFull = 
        (q.category === 'full') || 
        (q.file && q.file.includes('Full Mocks')) ||
        (q.title && q.title.toLowerCase().includes('cbt mock'));

      return isCsFull;
    });

    // Natural sort by mock test number
    return list.sort((a, b) => {
      const numA = parseInt(a.title.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.title.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [quizzes]);

  // Apply Search
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return csFullMocks;
    const qStr = searchQuery.toLowerCase().trim();
    return csFullMocks.filter(q => {
      const titleMatch = (q.title || '').toLowerCase().includes(qStr);
      const subMatch = (q.subject || '').toLowerCase().includes(qStr);
      const testIdMatch = (q.testId || '').toLowerCase().includes(qStr);
      return titleMatch || subMatch || testIdMatch;
    });
  }, [csFullMocks, searchQuery]);

  // Apply Status Filter
  const displayedQuizzes = useMemo(() => {
    return filteredBySearch.filter(q => {
      const isAttempted = pastAttempts.some(a => a.testId === q.testId);
      if (statusFilter === 'attempted') return isAttempted;
      if (statusFilter === 'unattempted') return !isAttempted;
      return true;
    });
  }, [filteredBySearch, statusFilter, pastAttempts]);

  const attemptedCount = useMemo(() => {
    return csFullMocks.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;
  }, [csFullMocks, pastAttempts]);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200/90 dark:border-indigo-800/80 rounded-3xl p-5 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="hidden sm:inline">CS Full-Length CBT Mocks Hub</span>
                <span className="sm:hidden">CS Full Mocks</span>
              </h2>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                200 Questions • 120 Minutes (2 Hours) • Part A + Part B Simulation
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl hidden md:block">
            Strict DSSSB CBT exam condition simulation: Part A (100 Qs: GK, Reasoning, Maths, English, Hindi) + Part B Computer Science &amp; Pedagogy (100 Qs). Strict 120-minute countdown with negative marking (-0.25).
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-1.5 sm:p-2 rounded-2xl shrink-0">
          <div className="text-center px-2 sm:px-2.5 border-r border-indigo-200 dark:border-indigo-800">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 uppercase block">Total Mocks</span>
            <span className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-100">{csFullMocks.length}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5 border-r border-indigo-200 dark:border-indigo-800">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase block">Attempted</span>
            <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-100">{attemptedCount}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase block">Unattempted</span>
            <span className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-100">{Math.max(0, csFullMocks.length - attemptedCount)}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 md:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Full CBT mocks (e.g. Mock Test 5)..."
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({filteredBySearch.length})
            </button>
            <button
              onClick={() => { setStatusFilter('unattempted'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'unattempted'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unattempted
            </button>
            <button
              onClick={() => { setStatusFilter('attempted'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'attempted'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Attempted ({attemptedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Cards Grid */}
      {displayedQuizzes.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4">
            {displayedQuizzes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((quiz, index) => {
              const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + index;
              const attempt = pastAttempts.find(a => a.testId === quiz.testId);
              const isAttempted = !!attempt;
              const unlocked = isMockUnlocked(quiz.testId, globalIdx, 'full');
              const isLocked = !unlocked;
              const questionCount = getQuestionCount(quiz) || 200;
              const mockNumberLabel = getMockNumberLabel(quiz, globalIdx);
              const diffTag = getDifficultyTag(globalIdx);

              return (
                <div
                  key={quiz.testId || globalIdx}
                  onClick={() => {
                    if (isLocked) {
                      onLockedQuizClick(quiz);
                    } else {
                      onStartQuiz(quiz, globalIdx);
                    }
                  }}
                  className={`bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all relative group ${
                    isAttempted 
                      ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 bg-emerald-50/20' 
                      : isLocked 
                        ? 'border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-90' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-[10px] px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                        {mockNumberLabel}
                      </span>

                      <div className="flex items-center gap-1">
                        {isAttempted && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Score: {attempt.score}
                          </span>
                        )}
                        {isLocked && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-600" /> Pass
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareQuiz(quiz, e);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="Share Quiz Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
                      {quiz.title}
                    </h3>
                  </div>

                  {/* Badges / Metrics Row */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Layers className="w-3 h-3 text-indigo-500" /> {questionCount} Qs
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-indigo-500" /> 120 Mins (2h)
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> 200 Marks
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                      {diffTag.label}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Full CBT • 10 Sections
                    </span>
                    <button
                      type="button"
                      className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all ${
                        isLocked
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs group-hover:scale-105'
                      }`}
                    >
                      {isLocked ? 'Unlock Test' : isAttempted ? 'Re-attempt' : 'Start CBT Mock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {displayedQuizzes.length > ITEMS_PER_PAGE && (
            <div className="pt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={displayedQuizzes.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-10 text-center space-y-3">
          <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
            No mock tests match your current search or status filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Ad slot */}
      <React.Suspense fallback={null}>
        <AdBanner location="cs_full_mocks_bottom" adSlot="1000000004" />
      </React.Suspense>
    </div>
  );
};

export default CsFullMocksHub;
