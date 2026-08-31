import React, { useState, useEffect } from 'react';
import { Quiz, Attempt } from '../types';
import { getSubjectDetail } from '../data/subjectResources';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { isMockUnlocked, rewardSyllabusTopicCompletion, getUserCoins, subscribeToCoins } from '../lib/rewardsSystem';
import { Glass3dIcon } from './Glass3dIcons';
import { 
  ArrowLeft, 
  Play, 
  Lock, 
  Square, 
  CheckSquare, 
  Share2, 
  Trophy,
  AlertCircle
} from 'lucide-react';
import { getMockNumberLabel, getQuestionCount } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';

interface SubjectDetailViewProps {
  subjectId: string;
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  userCoins?: number;
  completedSyllabusIds?: Set<string>;
  onToggleSyllabusItem?: (itemId: string, title: string) => void;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  onBack: () => void;
  getMockUnlockStatus?: (testIndex: number, nowMs?: number) => MockUnlockStatus;
  nowTick?: number;
  onOpenRewards?: () => void;
  onSelectSubject?: (subjectId: string) => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subjectId = 'maths',
  quizzes = [],
  pastAttempts = [],
  userCoins,
  completedSyllabusIds,
  onToggleSyllabusItem,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'mocks' | 'syllabus'>('mocks');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');

  // Coins state with real-time reactivity
  const [currentCoins, setCurrentCoins] = useState<number>(() => userCoins ?? getUserCoins());
  useEffect(() => {
    if (userCoins !== undefined) {
      setCurrentCoins(userCoins);
    }
    const unsub = subscribeToCoins((newCoins) => setCurrentCoins(newCoins));
    return () => unsub();
  }, [userCoins]);

  // Local syllabus completion persistence
  const [localCompletedIds, setLocalCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('dsssb_subject_syllabus_checked_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(Array.isArray(parsed) ? parsed : Object.keys(parsed));
      }
    } catch (_) {}
    return new Set<string>();
  });

  const subjectData = getSubjectDetail(subjectId || 'maths');

  const isTopicDone = (topicId: string, altId?: string): boolean => {
    if (completedSyllabusIds && typeof completedSyllabusIds.has === 'function') {
      if (completedSyllabusIds.has(topicId) || (altId && completedSyllabusIds.has(altId))) {
        return true;
      }
    }
    return localCompletedIds.has(topicId) || (altId ? localCompletedIds.has(altId) : false);
  };

  const handleToggleTopic = (topicId: string, topicName: string) => {
    const isCurrentlyDone = isTopicDone(topicId);
    const nextSet = new Set(localCompletedIds);
    if (isCurrentlyDone) {
      nextSet.delete(topicId);
    } else {
      nextSet.add(topicId);
      try {
        rewardSyllabusTopicCompletion(topicId, topicName);
      } catch (_) {}
    }
    setLocalCompletedIds(nextSet);
    try {
      localStorage.setItem('dsssb_subject_syllabus_checked_v1', JSON.stringify(Array.from(nextSet)));
    } catch (_) {}

    if (onToggleSyllabusItem) {
      onToggleSyllabusItem(topicId, topicName);
    }
  };

  // Filter quizzes matching this subject
  const subjectQuizzes = quizzes.filter(q => {
    if (q.testType === 'pyp') return false;
    const lowerSub = (q.subject || '').toLowerCase();
    const lowerTopic = (q.topic || '').toLowerCase();
    const lowerTitle = (q.title || '').toLowerCase();
    const lowerFile = (q.file || '').toLowerCase();
    const subIdLower = (subjectId || '').toLowerCase();

    // Map common aliases
    if (subIdLower === 'maths' || subIdLower.includes('math') || subIdLower.includes('arithmetic')) {
      return lowerSub.includes('arithmetic') || lowerSub.includes('numerical') || lowerSub.includes('math') || lowerTopic.includes('math') || lowerFile.includes('math');
    }
    if (subIdLower === 'reasoning' || subIdLower.includes('reason') || subIdLower.includes('intelligence')) {
      return lowerSub.includes('reasoning') || lowerSub.includes('intelligence') || lowerTopic.includes('reasoning') || lowerFile.includes('reasoning');
    }
    if (subIdLower === 'gk' || subIdLower.includes('general awareness') || subIdLower.includes('general knowledge')) {
      return lowerSub.includes('general awareness') || lowerSub.includes('gk') || lowerSub.includes('general knowledge') || lowerTopic.includes('awareness') || lowerFile.includes('awareness') || lowerFile.includes('gk');
    }
    if (subIdLower === 'english') {
      return lowerSub.includes('english') || lowerTopic.includes('english') || lowerFile.includes('english');
    }
    if (subIdLower === 'hindi') {
      return lowerSub.includes('hindi') || lowerTopic.includes('hindi') || lowerFile.includes('hindi') || lowerSub.includes('हिंदी');
    }
    if (subIdLower === 'pedagogy' || subIdLower.includes('teaching methodology')) {
      return lowerSub.includes('pedagogy') || lowerSub.includes('teaching methodology') || lowerTopic.includes('pedagogy') || lowerTopic.includes('teaching');
    }

    // CS Topics by code or text
    const cleanTitle = (subjectData.title || '').toLowerCase();
    return lowerTopic.includes(cleanTitle) || lowerSub.includes(cleanTitle) || lowerTitle.includes(cleanTitle) || (subIdLower && lowerFile.includes(subIdLower));
  });

  const displayedQuizzes = subjectQuizzes.filter(q => {
    const isAttempted = pastAttempts.some(a => a.testId === q.testId);
    if (statusFilter === 'attempted') return isAttempted;
    if (statusFilter === 'unattempted') return !isAttempted;
    return true;
  });

  // Calculate Syllabus Completion for this subject
  const totalSyllabusItems = subjectData.syllabusTopics?.length || 0;
  const completedCount = (subjectData.syllabusTopics || []).filter((_, idx) => {
    const topicId = `subj_${subjectId}_${idx}`;
    const altId = `${subjectId}_${idx}`;
    return isTopicDone(topicId, altId);
  }).length;
  const progressPercent = totalSyllabusItems > 0 ? Math.round((completedCount / totalSyllabusItems) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs group shrink-0"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black">
            <span>🪙 {currentCoins} Coins</span>
          </div>
        </div>
      </div>

      {/* Hero Subject Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs relative overflow-hidden space-y-2">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex items-center gap-3">
          <Glass3dIcon type={subjectData.iconType} size="md" className="shrink-0 shadow-sm" />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {subjectData.code && (
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {subjectData.code}
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {subjectData.badge}
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {subjectQuizzes.length} Tests
              </span>
            </div>
            <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {subjectData.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 2-CARD SELECTOR BAR: MOCKS & SYLLABUS */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Pillar 1: Mocks */}
        <button
          onClick={() => setActiveTab('mocks')}
          className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between cursor-pointer ${
            activeTab === 'mocks'
              ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <Glass3dIcon type="target" size="sm" className="shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
              {subjectQuizzes.length} Tests
            </span>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Mocks &amp; Tests</div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">Chapter-wise CBT</p>
          </div>
        </button>

        {/* Pillar 2: Syllabus Checklist */}
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between cursor-pointer ${
            activeTab === 'syllabus'
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <Glass3dIcon type="star" size="sm" className="shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
              +10 🪙 each
            </span>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Syllabus Tracker</div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">{completedCount}/{totalSyllabusItems} Checked</p>
          </div>
        </button>
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. MOCKS TAB */}
      {activeTab === 'mocks' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-2xl">
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-indigo-500" />
              <span>{subjectData.title}</span>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['all', 'unattempted', 'attempted'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {displayedQuizzes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">No mock tests found for this filter.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5">
              {displayedQuizzes.map((quiz, idx) => {
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
                        <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {getMockNumberLabel(quiz, idx)}
                        </span>
                        {isAttempted ? (
                          <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {Math.round(attempt.percentage)}%
                          </span>
                        ) : !unlocked ? (
                          <span className="text-[9px] sm:text-[10px] font-black text-amber-700 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-0.5">
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
          )}
        </div>
      )}

      {/* 2. SYLLABUS CHECKLIST TAB */}
      {activeTab === 'syllabus' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Glass3dIcon type="star" size="xs" />
                <span>{subjectData.title} Checklist</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Earn <strong className="text-amber-600">+10 Coins 🪙</strong> per topic
              </p>
            </div>
            <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
              {completedCount}/{totalSyllabusItems} ({progressPercent}%)
            </div>
          </div>

          <div className="space-y-2">
            {subjectData.syllabusTopics.map((topicName, idx) => {
              const topicId = `subj_${subjectId}_${idx}`;
              const altId = `${subjectId}_${idx}`;
              const isDone = isTopicDone(topicId, altId);

              return (
                <div
                  key={topicId}
                  onClick={() => handleToggleTopic(topicId, topicName)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </span>
                    <div>
                      <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : 'text-slate-800 dark:text-slate-100'}`}>
                        {topicName}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isDone ? (
                      <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full">
                        ✓ +10🪙
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        +10🪙
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ad Banner for continuous learning */}
      <AdBanner location="subject-detail-footer" format="responsive" adSlot="1000000006" />
    </div>
  );
};

export default SubjectDetailView;
