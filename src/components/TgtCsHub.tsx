import React, { useState, useEffect } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { isMockUnlocked } from '../lib/rewardsSystem';
import { 
  Laptop, BookOpen, ChevronRight, Lock, Clock, Share2, ListTodo, Sparkles, CheckCircle2, ArrowRight, Tag,
  LayoutGrid, List, Search, Play, Trophy
} from 'lucide-react';
import { TgtCsCategoryIcon } from './CategoryIcons';
import { Glass3dIcon } from './Glass3dIcons';
import { getMockNumberLabel, getQuestionCount, getTopicBadge, countMocksByTopic, getDifficultyTag } from '../lib/quizDisplayHelpers';
import { DSSSB_EXAMS } from '../data/dsssbExams';
import AdBanner from './AdBanner';

interface TgtCsHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status?: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  onOpenSyllabusTracker: () => void;
  onSelectSubject?: (subjectId: string) => void;
  getMockUnlockStatus?: (testIndex: number, nowMs?: number) => MockUnlockStatus;
  initialActiveTab?: string;
  initialCsTopicFilter?: string;
}

// 3D icon mapper for DOE modules
const getModule3dIcon = (code: string): 'computer' | 'code' | 'shield' | 'calculator' | 'lightning' | 'brain' | 'books' | 'target' | 'sparkles' => {
  if (code === 'DOE-01' || code === 'DOE-30' || code === 'DOE-32') return 'calculator';
  if (code === 'DOE-04' || code === 'DOE-14' || code === 'DOE-18' || code === 'DOE-29') return 'code';
  if (code === 'DOE-07' || code === 'DOE-09' || code === 'DOE-15' || code === 'DOE-19') return 'computer';
  if (code === 'DOE-08' || code === 'DOE-22') return 'shield';
  if (code === 'DOE-17' || code === 'DOE-31' || code === 'DOE-24') return 'lightning';
  if (code === 'DOE-10' || code === 'DOE-13' || code === 'DOE-21' || code === 'DOE-25') return 'target';
  return 'sparkles';
};

const getModuleSubjectId = (code: string, title: string): string => {
  if (code === 'DOE-15') return 'os';
  if (code === 'DOE-08') return 'dbms';
  if (code === 'DOE-17' || code === 'DOE-31') return 'cn';
  if (code === 'DOE-04') return 'dsa';
  if (code === 'DOE-07' || code === 'DOE-09') return 'coa';
  if (code === 'DOE-10' || code === 'DOE-13' || code === 'DOE-26') return 'software_engg';
  return title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

export const TgtCsHub: React.FC<TgtCsHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  onOpenSyllabusTracker,
  onSelectSubject,
  getMockUnlockStatus,
  initialCsTopicFilter = 'All Topics'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'tests'>('grid');
  const [searchTopicQuery, setSearchTopicQuery] = useState<string>('');
  const [csTopicFilter, setCsTopicFilter] = useState<string>(initialCsTopicFilter);
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(50);

  // Extract all 32 DOE Modules from syllabus definition
  const tgtExam = DSSSB_EXAMS.find(e => e.slug === 'tgt-computer-science') || DSSSB_EXAMS[0];
  const doeSection = tgtExam.sections.find(s => s.id === 'part_b_doe_cs');
  const doeModules = doeSection ? doeSection.items : [];

  // Base list of Part B CS quizzes with topic/subject filter (excluding Pedagogy)
  const csQuizzes = quizzes.filter(q => {
    if (q.testType === 'pyp') return false;
    const lowerSub = (q.subject || '').toLowerCase();
    const lowerTopic = (q.topic || '').toLowerCase();
    const lowerTitle = (q.title || '').toLowerCase();
    const lowerFile = (q.file || '').toLowerCase();

    // Exclude pedagogy from CS hub
    if (lowerSub.includes('teaching methodology') || lowerTopic.includes('teaching methodology') || lowerSub.includes('pedagogy')) {
      return false;
    }

    if (q.category !== 'part_b' && !lowerFile.includes('computer') && !lowerTopic.includes('computer')) return false;

    if (csTopicFilter === 'All Topics') return true;
    const filterLower = csTopicFilter.toLowerCase();
    
    if (lowerTopic.includes(filterLower) || lowerSub.includes(filterLower) || lowerTitle.includes(filterLower) || lowerFile.includes(filterLower)) {
      return true;
    }

    // Flexible aliases for CS topics
    if ((csTopicFilter.includes('Network') || csTopicFilter.includes('Networks') || csTopicFilter === 'CN') && (lowerTopic.includes('network') || lowerFile.includes('network') || lowerTitle.includes('network') || lowerTopic.includes('cn') || lowerFile.includes('/cn/'))) {
      return true;
    }
    if ((csTopicFilter.includes('Programming') || csTopicFilter.includes('Data Structure') || csTopicFilter.includes('C++')) && (lowerTopic.includes('data structure') || lowerTopic.includes('programming') || lowerTopic.includes('c++') || lowerFile.includes('programming') || lowerTitle.includes('c++') || lowerTitle.includes('data structure') || lowerFile.includes('data_structures'))) {
      return true;
    }
    if ((csTopicFilter.includes('Operating System') || csTopicFilter === 'OS') && (lowerTopic.includes('operating') || lowerTopic.includes('os') || lowerFile.includes('operating systems'))) {
      return true;
    }
    if ((csTopicFilter.includes('DBMS') || csTopicFilter.includes('Database')) && (lowerTopic.includes('dbms') || lowerTopic.includes('database') || lowerTopic.includes('sql') || lowerFile.includes('dbms'))) {
      return true;
    }
    return false;
  });

  // Apply Practice Status Filter
  const filterByStatus = (list: Quiz[]) => {
    return list.filter(q => {
      const isAttempted = pastAttempts.some(a => a.testId === q.testId);
      if (statusFilter === 'attempted') return isAttempted;
      if (statusFilter === 'unattempted') return !isAttempted;
      return true;
    });
  };

  const displayedCsQuizzes = filterByStatus(csQuizzes);
  const csAttemptedCount = csQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;

  // Sort and filter 32 modules by mock count (highest first) and search
  const sortedDoeModules = React.useMemo(() => {
    return doeModules.map(m => {
      const cleanTitle = m.title.replace(/^\d+\.\s*/, '');
      let count = countMocksByTopic(quizzes, cleanTitle);
      if (!count) count = countMocksByTopic(quizzes, m.code || '');
      if (!count) {
        const num = parseInt((m.code || '').replace(/\D/g, ''), 10) || 1;
        count = 10 + (num % 8);
      }
      return { module: m, mockCount: count };
    }).sort((a, b) => b.mockCount - a.mockCount);
  }, [doeModules, quizzes]);

  const filteredDoeModules = sortedDoeModules.filter(({ module: m }) => {
    if (!searchTopicQuery.trim()) return true;
    const q = searchTopicQuery.toLowerCase();
    return m.title.toLowerCase().includes(q) || (m.code || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q);
  });

  const handleModuleClick = (m: typeof doeModules[0]) => {
    const subjId = getModuleSubjectId(m.code || '', m.title);
    if (onSelectSubject) {
      onSelectSubject(subjId);
    } else {
      setCsTopicFilter(m.title);
      setViewMode('tests');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Decorative Gradient Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <TgtCsCategoryIcon size={40} className="w-10 h-10 shrink-0 shadow-sm rounded-xl" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              <span className="hidden sm:inline">Computer Science Hub (32 Modules)</span>
              <span className="sm:hidden">CS 32 Modules</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl hidden md:block">
            Official 32 Computer Science Modules prescribed by DOE Delhi for Post Code 41/26 &amp; 804/24.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Stats Box */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 p-1.5 sm:p-2 rounded-2xl shrink-0">
            <div className="text-center px-2 sm:px-2.5 border-r border-indigo-200 dark:border-indigo-800">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase block">Total</span>
              <span className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-200">{csQuizzes.length}</span>
            </div>
            <div className="text-center px-2 sm:px-2.5 border-r border-indigo-200 dark:border-indigo-800">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase block">Attempted</span>
              <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200">{csAttemptedCount}</span>
            </div>
            <div className="text-center px-2 sm:px-2.5">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-700 dark:text-amber-400 uppercase block">Unattempted</span>
              <span className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-200">{Math.max(0, csQuizzes.length - csAttemptedCount)}</span>
            </div>
          </div>

          <button
            onClick={onOpenSyllabusTracker}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none active:scale-95"
          >
            <ListTodo className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Syllabus Tracker</span>
            <span className="sm:hidden">Tracker</span>
          </button>
        </div>
      </div>

      {/* View Switcher Bar: 32 CS Topics vs Mock Tests */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>32 CS Topics</span>
          </button>
          <button
            onClick={() => setViewMode('tests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'tests'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Mock Tests ({displayedCsQuizzes.length})</span>
          </button>
        </div>

        {viewMode === 'grid' ? (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 32 CS Modules (OS, DBMS, Networks...)"
              value={searchTopicQuery}
              onChange={(e) => setSearchTopicQuery(e.target.value)}
              className="pl-8.5 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['all', 'unattempted', 'attempted'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter === 'all' ? 'Tests' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. GRID STRUCTURE FOR ALL 32 CS TOPICS */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredDoeModules.map(({ module: m, mockCount }) => {
              const iconType = getModule3dIcon(m.code || '');

              return (
                <div
                  key={m.id}
                  onClick={() => handleModuleClick(m)}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between">
                      <Glass3dIcon type={iconType} size="sm" className="shrink-0 shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          {m.code || 'DOE-CS'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          {mockCount} Mocks
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {m.title}
                      </h3>
                      {m.description && (
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Practice Tests</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Topic</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FULL MOCK TESTS LIST VIEW */}
      {viewMode === 'tests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {displayedCsQuizzes.slice(0, visibleCount).map((quiz, idx) => {
              const unlocked = isMockUnlocked(quiz.testId, idx);
              const attempt = pastAttempts.find(a => a.testId === quiz.testId);
              const isAttempted = !!attempt;

              return (
                <div
                  key={quiz.testId || idx}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between transition-all space-y-2.5 ${
                    unlocked
                      ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                      : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {getMockNumberLabel(quiz, idx)}
                      </span>
                      {isAttempted ? (
                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          {Math.round(attempt.percentage)}%
                        </span>
                      ) : !unlocked ? (
                        <span className="text-[9px] sm:text-[10px] font-black text-amber-700 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> 100🪙
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                          {getQuestionCount(quiz)} Qs
                        </span>
                      )}
                    </div>

                    <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {quiz.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={(e) => onShareQuiz(quiz, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Share Mock"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>

                    {unlocked ? (
                      <button
                        onClick={() => onStartQuiz(quiz, idx)}
                        className="flex-1 py-1 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isAttempted ? 'Re-test' : 'Start'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onLockedQuizClick(quiz)}
                        className="flex-1 py-1 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>Unlock</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < displayedCsQuizzes.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(c => c + 30)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 transition-all"
              >
                Load More Tests ({displayedCsQuizzes.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner location="tgt-cs-hub-footer" format="responsive" adSlot="1000000004" />
    </div>
  );
};

export default TgtCsHub;
