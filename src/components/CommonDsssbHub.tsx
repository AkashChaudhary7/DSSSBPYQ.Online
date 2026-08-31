import React, { useState } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { isMockUnlocked } from '../lib/rewardsSystem';
import { 
  Building2, BookOpen, Trophy, Share2, Lock, Clock, CheckCircle2, Sparkles, LayoutGrid, List,
  ChevronRight, Play, ArrowRight, ListTodo
} from 'lucide-react';
import { CommonDsssbCategoryIcon } from './CategoryIcons';
import { Glass3dIcon } from './Glass3dIcons';
import { getMockNumberLabel, getQuestionCount, getTopicBadge, countMocksByTopic, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';

interface CommonDsssbHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status?: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  onSelectSubject?: (subjectId: string) => void;
  onOpenSyllabusTracker?: () => void;
  getMockUnlockStatus?: (testIndex: number, nowMs?: number) => MockUnlockStatus;
}

interface GeneralSubjectInfo {
  id: string;
  name: string;
  marks: string;
  iconType: 'calculator' | 'brain' | 'sparkles' | 'books' | 'trophy';
  description: string;
  color: string;
  matchTerms: string[];
}

const PART_A_SUBJECTS: GeneralSubjectInfo[] = [
  {
    id: 'maths',
    name: 'Arithmetical & Numerical Ability',
    marks: '20 Marks',
    iconType: 'calculator',
    description: 'Simplification, Fractions, LCM/HCF, Percentage, Profit & Loss, SI/CI, Time & Work, Mensuration, and Data Interpretation.',
    color: 'from-amber-500 to-orange-600',
    matchTerms: ['math', 'arithmetic', 'numerical', 'quant']
  },
  {
    id: 'reasoning',
    name: 'General Intelligence & Reasoning',
    marks: '20 Marks',
    iconType: 'brain',
    description: 'Analogies, Syllogisms, Blood Relations, Coding-Decoding, Number Series, Directions, Paper Folding, and Venn Diagrams.',
    color: 'from-purple-500 to-indigo-600',
    matchTerms: ['reasoning', 'intelligence', 'logical']
  },
  {
    id: 'gk',
    name: 'General Awareness & Delhi GK',
    marks: '20 Marks',
    iconType: 'sparkles',
    description: 'Indian Constitution, Articles, Modern History, Physical Geography, Everyday Science, Delhi Heritage, and Current Affairs.',
    color: 'from-emerald-500 to-teal-600',
    matchTerms: ['awareness', 'gk', 'general awareness', 'polity', 'delhi']
  },
  {
    id: 'english',
    name: 'General English Language & Comprehension',
    marks: '20 Marks',
    iconType: 'books',
    description: 'Reading Comprehension, 120 Grammar Rules, Error Spotting, Vocabulary, Idioms & Phrases, Synonyms, and Antonyms.',
    color: 'from-blue-500 to-sky-600',
    matchTerms: ['english', 'comprehension', 'grammar', 'vocab']
  },
  {
    id: 'hindi',
    name: 'General Hindi Language & Comprehension',
    marks: '20 Marks',
    iconType: 'books',
    description: 'अपठित गद्यांश, संधि, समास, उपसर्ग-प्रत्यय, संज्ञा-सर्वनाम, पर्यायवाची, विलोम, मुहावरे एवं वाक्य शुद्धि।',
    color: 'from-rose-500 to-red-600',
    matchTerms: ['hindi', 'हिंदी', 'vyakaran']
  }
];

export const CommonDsssbHub: React.FC<CommonDsssbHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  onSelectSubject,
  onOpenSyllabusTracker,
  getMockUnlockStatus
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'tests'>('grid');
  const [activeSubject, setActiveSubject] = useState<string>('All Subjects');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(50);

  // Filter Part A quizzes
  const partAQuizzes = quizzes.filter(q => {
    if (q.testType === 'pyp') return false;
    if (q.category !== 'part_a') return false;
    if (activeSubject === 'All Subjects') return true;
    
    const isReasoningMatch = activeSubject === 'Reasoning' && 
      (q.subject === 'General Intelligence & Reasoning' || q.subject === 'Reasoning' || q.subject === 'Reasoning Ability');
    
    return q.subject === activeSubject || isReasoningMatch;
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

  const displayedPartAQuizzes = filterByStatus(partAQuizzes);
  const partAAttemptedCount = partAQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;

  const handleSubjectCardClick = (subjId: string, subjName: string) => {
    if (onSelectSubject) {
      onSelectSubject(subjId);
    } else {
      setActiveSubject(subjName);
      setViewMode('tests');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-amber-100 dark:border-slate-800 rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6 relative overflow-hidden">
      {/* Decorative Gradient Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <CommonDsssbCategoryIcon size={36} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 shadow-sm rounded-xl" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              <span className="hidden sm:inline">General Ability Hub (All 5 Subjects)</span>
              <span className="sm:hidden">General Ability (Part A)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl hidden md:block">
            Part A carries <strong className="text-slate-900 dark:text-white">100 Marks</strong> across 5 core subjects: Maths, Reasoning, General Awareness, English, and Hindi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Stats Box */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60 p-1.5 sm:p-2 rounded-2xl shrink-0">
            <div className="text-center px-2 sm:px-2.5 border-r border-amber-200 dark:border-amber-800">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase block">Total</span>
              <span className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-200">{partAQuizzes.length}</span>
            </div>
            <div className="text-center px-2 sm:px-2.5 border-r border-amber-200 dark:border-amber-800">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase block">Attempted</span>
              <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200">{partAAttemptedCount}</span>
            </div>
            <div className="text-center px-2 sm:px-2.5">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-700 dark:text-amber-400 uppercase block">Unattempted</span>
              <span className="text-sm sm:text-base font-black text-amber-950 dark:text-amber-200">{Math.max(0, partAQuizzes.length - partAAttemptedCount)}</span>
            </div>
          </div>

          {onOpenSyllabusTracker && (
            <button
              onClick={onOpenSyllabusTracker}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-amber-200 dark:shadow-none active:scale-95"
            >
              <ListTodo className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Part A Syllabus</span>
              <span className="sm:hidden">Syllabus</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Bar: 5 Subjects vs Mock Tests */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>5 Core Subjects</span>
          </button>
          <button
            onClick={() => setViewMode('tests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'tests'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Mock Tests ({displayedPartAQuizzes.length})</span>
          </button>
        </div>

        {viewMode === 'tests' && (
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['all', 'unattempted', 'attempted'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter === 'all' ? 'Tests' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. GRID STRUCTURE FOR ALL 5 GENERAL ABILITY SUBJECTS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {PART_A_SUBJECTS.map((subj) => {
            // Count mocks matching this subject
            const matchCount = partAQuizzes.filter(q => {
              const lowerSub = (q.subject || '').toLowerCase();
              const lowerTitle = (q.title || '').toLowerCase();
              return subj.matchTerms.some(term => lowerSub.includes(term) || lowerTitle.includes(term));
            }).length;

            return { subj, matchCount };
          })
          .sort((a, b) => b.matchCount - a.matchCount)
          .map(({ subj, matchCount }) => {
            return (
              <div
                key={subj.id}
                onClick={() => handleSubjectCardClick(subj.id, subj.name)}
                className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between">
                    <Glass3dIcon type={subj.iconType} size="sm" className="shrink-0 shadow-sm group-hover:scale-105 transition-transform" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                        {subj.marks}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        {matchCount} Tests
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {subj.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Practice Tests</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Subject</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. FULL MOCKS LIST VIEW */}
      {viewMode === 'tests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {displayedPartAQuizzes.slice(0, visibleCount).map((quiz, idx) => {
              const unlocked = isMockUnlocked(quiz.testId, idx);
              const attempt = pastAttempts.find(a => a.testId === quiz.testId);
              const isAttempted = !!attempt;

              return (
                <div
                  key={quiz.testId || idx}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between transition-all space-y-2.5 ${
                    unlocked
                      ? 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
                      : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
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
                          {getQuestionCount(quiz)}Q
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
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Share Mock"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>

                    {unlocked ? (
                      <button
                        onClick={() => onStartQuiz(quiz, idx)}
                        className="flex-1 py-1 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
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

          {visibleCount < displayedPartAQuizzes.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(c => c + 30)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                Load More Tests ({displayedPartAQuizzes.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner location="common-dsssb-hub-footer" format="responsive" adSlot="1000000003" />
    </div>
  );
};

export default CommonDsssbHub;
