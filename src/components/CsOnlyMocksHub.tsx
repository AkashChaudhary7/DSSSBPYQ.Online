import React, { useState, useMemo } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { isMockUnlocked } from '../lib/passSystem';
import { 
  Code, Terminal, Trophy, Share2, Lock, Clock, CheckCircle2, Sparkles, Search, Layers, ShieldCheck, Cpu, Database, Network
} from 'lucide-react';
import { getMockNumberLabel, getQuestionCount, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';
import Pagination from './Pagination';

interface CsOnlyMocksHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status?: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  getMockUnlockStatus?: (testIndex: number, nowMs?: number) => MockUnlockStatus;
}

export const CsOnlyMocksHub: React.FC<CsOnlyMocksHubProps> = ({
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

  // Filter 100-Question CS only Mocks (Domain Part B)
  const csOnlyQuizzes = useMemo(() => {
    const list = quizzes.filter(q => {
      const isCsMock = 
        q.subject === 'CS Only Mock' || 
        q.topic === 'Computer Science Domain (Part B)' ||
        (q.file && q.file.toLowerCase().includes('cs only mock')) ||
        (q.file && q.file.toLowerCase().includes('cs_mock')) ||
        (q.isCsOnly === true) ||
        (q.title && q.title.toLowerCase().startsWith('cs mock test'));
      return isCsMock;
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
    if (!searchQuery.trim()) return csOnlyQuizzes;
    const qStr = searchQuery.toLowerCase().trim();
    return csOnlyQuizzes.filter(q => {
      const titleMatch = (q.title || '').toLowerCase().includes(qStr);
      const subMatch = (q.subject || '').toLowerCase().includes(qStr);
      const testIdMatch = (q.testId || '').toLowerCase().includes(qStr);
      return titleMatch || subMatch || testIdMatch;
    });
  }, [csOnlyQuizzes, searchQuery]);

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
    return csOnlyQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;
  }, [csOnlyQuizzes, pastAttempts]);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-cyan-200/90 dark:border-cyan-800/80 rounded-3xl p-5 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black shadow-md shadow-cyan-200 shrink-0">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="hidden sm:inline">CS Only Mock Tests (Part B)</span>
                <span className="sm:hidden">CS Only Mocks</span>
              </h2>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                100 Pure Computer Science Questions • 60 Minutes • 100 Marks
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl hidden md:block">
            Dedicated 100-mark mock tests covering pure Computer Science domain topics: Operating Systems, DBMS &amp; SQL, Data Structures &amp; Algorithms, Computer Networks, C/C++, Java, Python, Web Technologies, Software Engineering, Digital Logic, and Computer Architecture.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 p-1.5 sm:p-2 rounded-2xl shrink-0">
          <div className="text-center px-2 sm:px-2.5 border-r border-cyan-200 dark:border-cyan-800">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-cyan-600 uppercase block">Total Mocks</span>
            <span className="text-sm sm:text-base font-black text-cyan-950 dark:text-cyan-100">{csOnlyQuizzes.length}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5 border-r border-cyan-200 dark:border-cyan-800">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase block">Attempted</span>
            <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-100">{attemptedCount}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-cyan-700 dark:text-cyan-300 uppercase block">Unattempted</span>
            <span className="text-sm sm:text-base font-black text-cyan-950 dark:text-cyan-100">{Math.max(0, csOnlyQuizzes.length - attemptedCount)}</span>
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
              placeholder="Search CS Only mocks (e.g. CS Mock Test 1)..."
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
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
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({filteredBySearch.length})
            </button>
            <button
              onClick={() => { setStatusFilter('unattempted'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'unattempted'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unattempted
            </button>
            <button
              onClick={() => { setStatusFilter('attempted'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'attempted'
                  ? 'bg-cyan-600 text-white shadow-2xs'
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
              const unlocked = isMockUnlocked(quiz.testId, globalIdx, 'part_b');
              const isLocked = !unlocked;
              const questionCount = getQuestionCount(quiz) || 100;
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
                        : 'border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:shadow-md'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-black text-[10px] px-2.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800 uppercase tracking-wider">
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
                          className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
                          title="Share Quiz Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1 leading-snug">
                      {quiz.title}
                    </h3>
                  </div>

                  {/* Badges / Metrics Row */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Layers className="w-3 h-3 text-cyan-500" /> {questionCount} Qs (CS)
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-cyan-500" /> 60 Mins
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> 100 Marks
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                      {diffTag.label}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      OS • DBMS • DS • CN • OOP • Web
                    </span>
                    <button
                      type="button"
                      className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all ${
                        isLocked
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-2xs'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-2xs group-hover:scale-105'
                      }`}
                    >
                      {isLocked ? 'Unlock Test' : isAttempted ? 'Re-attempt' : 'Start CS Mock'}
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
            No CS mock tests match your current search or status filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-cyan-600 dark:text-cyan-400 font-extrabold text-xs underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Ad slot */}
      <React.Suspense fallback={null}>
        <AdBanner location="cs_only_mocks_bottom" adSlot="1000000006" />
      </React.Suspense>
    </div>
  );
};

export default CsOnlyMocksHub;
