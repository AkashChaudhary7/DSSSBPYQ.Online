import React, { useState } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { 
  Building2, BookOpen, Trophy, Share2, Lock, Clock, CheckCircle2, Sparkles 
} from 'lucide-react';
import { CommonDsssbCategoryIcon } from './CategoryIcons';
import { getMockNumberLabel, getQuestionCount, getTopicBadge, countMocksByTopic, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';

interface CommonDsssbHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  getMockUnlockStatus: (testIndex: number, nowMs?: number) => MockUnlockStatus;
}

export const CommonDsssbHub: React.FC<CommonDsssbHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  getMockUnlockStatus
}) => {
  const [activeSubject, setActiveSubject] = useState<string>('All Subjects');
  const [activeTab, setActiveTab] = useState<'subject_mocks' | 'part_a_full'>('subject_mocks');
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

  // Filter Part A Full Mocks (100 Marks combined) - strictly full papers, exclude subject-wise mocks
  const partAFullQuizzes = quizzes.filter(q => {
    if (q.testType === 'pyp') return false;
    const lowerTitle = (q.title || '').toLowerCase();
    const lowerSub = (q.subject || '').toLowerCase();
    const lowerTopic = (q.topic || '').toLowerCase();
    const isExplicitFullPartA = 
      q.testType === 'part_a_full' || 
      q.isPartAFullMock === true || 
      q.category === 'full_part_a' || 
      lowerSub === 'part a full mock' || 
      lowerTopic === 'part a full mock series' || 
      (q.file && q.file.startsWith('/Part A full Mocks')) ||
      (q.isPartA && q.qCount === 100);
    const isTitleMatch = (lowerTitle.includes('part a full mock') || lowerTitle.includes('part-a full mock') || lowerTitle.includes('100 marks full mock')) && !lowerTitle.includes('chapter') && !lowerTitle.includes('topic');
    return isExplicitFullPartA || isTitleMatch;
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
  const displayedPartAFullQuizzes = filterByStatus(partAFullQuizzes);

  const partAAttemptedCount = partAQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;

  return (
    <div className="bg-white border-2 border-amber-100 rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-sm space-y-4 md:space-y-5 relative overflow-hidden">
      {/* Decorative Gradient Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <CommonDsssbCategoryIcon size={40} className="w-10 h-10 shrink-0 shadow-sm rounded-xl" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              <span className="hidden sm:inline">Common DSSSB Exam Practice Hub</span>
              <span className="sm:hidden">General Ability</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl hidden md:block">
            Part A General Ability carries <span className="font-bold text-slate-900">100 Marks</span> and is 100% common across all DSSSB teaching (TGT, PGT, PRT, Nursery, Special Educator) and non-teaching (LDC, Steno, Jr Assistant) exams.
          </p>
        </div>

        {/* Quick Stats Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 border border-amber-100 p-1.5 sm:p-2 rounded-2xl shrink-0">
          <div className="text-center px-2 sm:px-2.5 border-r border-amber-200">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-700 uppercase block">Total</span>
            <span className="text-sm sm:text-base font-black text-amber-950">{partAQuizzes.length}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5 border-r border-amber-200">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase block">Attempted</span>
            <span className="text-sm sm:text-base font-black text-emerald-950">{partAAttemptedCount}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-800 uppercase block">Unattempted</span>
            <span className="text-sm sm:text-base font-black text-amber-950">{Math.max(0, partAQuizzes.length - partAAttemptedCount)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-3 md:gap-4 border-b border-slate-200 pb-3 md:pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('subject_mocks')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'subject_mocks'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="sm:hidden">Part A Mocks ({partAQuizzes.length})</span>
            <span className="hidden sm:inline">Subject-Wise Part A Mocks ({partAQuizzes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('part_a_full')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'part_a_full'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="sm:hidden">Full Mocks ({partAFullQuizzes.length})</span>
            <span className="hidden sm:inline">Part A Full Mocks ({partAFullQuizzes.length})</span>
          </button>
        </div>

        {/* Filter by Status Sub-Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-2 md:px-3">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Filter by Status:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All (${
                activeTab === 'subject_mocks' ? partAQuizzes.length : partAFullQuizzes.length
              })` },
              { id: 'attempted', label: `Attempted (${
                activeTab === 'subject_mocks' 
                  ? partAQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length 
                  : partAFullQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length
              })` },
              { id: 'unattempted', label: `Unattempted (${
                activeTab === 'subject_mocks' 
                  ? partAQuizzes.filter(q => !pastAttempts.some(a => a.testId === q.testId)).length 
                  : partAFullQuizzes.filter(q => !pastAttempts.some(a => a.testId === q.testId)).length
              })` }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => {
                  setStatusFilter(status.id as any);
                  setVisibleCount(15);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === status.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      {activeTab === 'subject_mocks' && (
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Select Part A Subject
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'All Subjects',
              'Quantitative Aptitude',
              'Reasoning',
              'General Awareness',
              'General English',
              'General Hindi'
            ].map(sub => {
              const count = countMocksByTopic(quizzes.filter(q => q.category === 'part_a' && q.testType !== 'pyp'), sub);
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    activeSubject === sub
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz List Rendering */}
      <div>
        {activeTab === 'subject_mocks' && displayedPartAQuizzes.length === 0 && (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
            No mock tests found for the selected filter combination (Subject &amp; Status).
          </div>
        )}

        {activeTab === 'subject_mocks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {displayedPartAQuizzes.slice(0, visibleCount).map((quiz, index) => {
              const unlockStatus = getMockUnlockStatus(index, nowTick);
              const quizAttempts = pastAttempts.filter(a => a.testId === quiz.testId);
              const isAttempted = quizAttempts.length > 0;
              const mockLabel = getMockNumberLabel(quiz, index);
              const topicBadge = getTopicBadge(quiz);
              const diffTag = getDifficultyTag(index);

              return (
                <div 
                  key={quiz.testId} 
                  className="bg-white border-2 border-slate-200/90 hover:border-amber-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md group relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none pb-0.5">
                      <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                        {mockLabel}
                      </span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                        📌 {topicBadge}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border shrink-0 whitespace-nowrap ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                        <span>{diffTag.icon}</span> {diffTag.label}
                      </span>
                      {isAttempted && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0 whitespace-nowrap">
                          ✅ Attempted ({quizAttempts.length}x)
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-amber-700 transition-colors text-center py-2 border-y border-slate-100/80 my-1">
                      {quiz.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 w-full shrink-0">
                    <button
                      onClick={(e) => onShareQuiz(quiz, e)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 shrink-0"
                      title="Share Direct Link"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    {unlockStatus.isUnlocked ? (
                      <button
                        onClick={() => onStartQuiz(quiz, index)}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-amber-600 hover:bg-amber-700 text-white shadow-xs text-center"
                      >
                        {isAttempted ? "Reattempt Test" : "Start Test"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onLockedQuizClick(quiz, unlockStatus)}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-slate-800 hover:bg-slate-900 text-white shadow-xs text-center flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3 h-3 text-amber-400" /> Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'part_a_full' && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 font-bold mb-3">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Full Mocks Section: 100 Marks combined simulations.</span>
            </span>
          </div>
        )}

        {activeTab === 'part_a_full' && displayedPartAFullQuizzes.length === 0 && (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium space-y-2">
            <p className="font-bold text-slate-700">No Full Mocks found matching the selected status filter.</p>
          </div>
        )}

        {activeTab === 'part_a_full' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {displayedPartAFullQuizzes.slice(0, visibleCount).map((quiz, index) => {
              const unlockStatus = getMockUnlockStatus(index, nowTick);
              const quizAttempts = pastAttempts.filter(a => a.testId === quiz.testId);
              const isAttempted = quizAttempts.length > 0;
              const mockLabel = getMockNumberLabel(quiz, index);
              const diffTag = getDifficultyTag(index);

              return (
                <div 
                  key={quiz.testId} 
                  className="bg-white border-2 border-slate-200/90 hover:border-amber-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md group relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none pb-0.5">
                      <span className="bg-amber-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                        {mockLabel}
                      </span>
                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                        🏆 Part A 100 Marks Full Mock
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border shrink-0 whitespace-nowrap ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                        <span>{diffTag.icon}</span> {diffTag.label}
                      </span>
                      {isAttempted && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0 whitespace-nowrap">
                          ✅ Attempted ({quizAttempts.length}x)
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-amber-700 transition-colors text-center py-2 border-y border-slate-100/80 my-1">
                      {quiz.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 w-full shrink-0">
                    <button
                      onClick={(e) => onShareQuiz(quiz, e)}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 shrink-0"
                      title="Share Direct Link"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    {unlockStatus.isUnlocked ? (
                      <button
                        onClick={() => onStartQuiz(quiz, index)}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-amber-600 hover:bg-amber-700 text-white shadow-xs text-center"
                      >
                        {isAttempted ? "Reattempt Test" : "Start Test"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onLockedQuizClick(quiz, unlockStatus)}
                        className="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-slate-800 hover:bg-slate-900 text-white shadow-xs text-center flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3 h-3 text-amber-400" /> Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(() => {
          const currentList = activeTab === 'subject_mocks' ? displayedPartAQuizzes : displayedPartAFullQuizzes;
          if (currentList.length > visibleCount) {
            return (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 15)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  ⚡ Load More Mock Tests ({currentList.length - visibleCount} remaining)
                </button>
              </div>
            );
          }
          return null;
        })()}
      </div>

      <AdBanner location="common_dsssb_hub_bottom" />
    </div>
  );
};

export default CommonDsssbHub;
