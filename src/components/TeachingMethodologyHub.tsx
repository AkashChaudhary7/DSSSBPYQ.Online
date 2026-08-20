import React, { useState } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { 
  GraduationCap, BookOpen, Trophy, Share2, Lock, Clock, CheckCircle2, Sparkles, Search, Layers 
} from 'lucide-react';
import { getMockNumberLabel, getQuestionCount, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';

interface TeachingMethodologyHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  getMockUnlockStatus: (testIndex: number, nowMs?: number) => MockUnlockStatus;
}

export const TeachingMethodologyHub: React.FC<TeachingMethodologyHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  getMockUnlockStatus
}) => {
  const [topicFilter, setTopicFilter] = useState<string>('All Topics');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(50);

  // Filter quizzes for Teaching Methodology / Pedagogy
  const pedagogyQuizzes = quizzes.filter(q => {
    if (q.testType === 'pyp') return false;
    const lowerSub = (q.subject || '').toLowerCase();
    const lowerTopic = (q.topic || '').toLowerCase();
    const lowerTitle = (q.title || '').toLowerCase();
    const lowerFile = (q.file || '').toLowerCase();

    const isPedagogy = 
      lowerSub.includes('teaching methodology') || 
      lowerSub.includes('pedagogy') || 
      lowerTopic.includes('pedagogy') || 
      lowerTopic.includes('teaching methodology') || 
      lowerTitle.includes('teaching methodology') || 
      lowerFile.includes('/teaching/');

    if (!isPedagogy) return false;

    // Filter by specific sub-topic if selected
    if (topicFilter !== 'All Topics') {
      const lowerFilter = topicFilter.toLowerCase();
      if (!lowerTitle.includes(lowerFilter) && !lowerTopic.includes(lowerFilter) && !lowerSub.includes(lowerFilter)) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const qStr = searchQuery.toLowerCase().trim();
      const matchTitle = lowerTitle.includes(qStr);
      const matchTopic = lowerTopic.includes(qStr);
      if (!matchTitle && !matchTopic) return false;
    }

    return true;
  });

  // Apply Practice Status Filter
  const displayedQuizzes = pedagogyQuizzes.filter(q => {
    const isAttempted = pastAttempts.some(a => a.testId === q.testId);
    if (statusFilter === 'attempted') return isAttempted;
    if (statusFilter === 'unattempted') return !isAttempted;
    return true;
  });

  const attemptedCount = pedagogyQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;

  return (
    <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Decorative Gradient Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-200 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              <span className="hidden sm:inline">Teaching Methodology &amp; Pedagogy Hub</span>
              <span className="sm:hidden">Teaching Methodology</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl hidden md:block">
            Comprehensive practice for Child Development, Educational Psychology, Learning Theories (Piaget, Vygotsky, Bandura), Assessment &amp; Evaluation, TLM, Inclusive Education, and NEP 2020.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-50 border border-purple-100 p-1.5 sm:p-2 rounded-2xl shrink-0">
          <div className="text-center px-2 sm:px-2.5 border-r border-purple-200">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-purple-600 uppercase block">Total</span>
            <span className="text-sm sm:text-base font-black text-purple-950">{pedagogyQuizzes.length}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5 border-r border-purple-200">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase block">Attempted</span>
            <span className="text-sm sm:text-base font-black text-emerald-950">{attemptedCount}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-purple-700 uppercase block">Unattempted</span>
            <span className="text-sm sm:text-base font-black text-purple-950">{Math.max(0, pedagogyQuizzes.length - attemptedCount)}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 md:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pedagogy & methodology tests..."
              className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({pedagogyQuizzes.length})
            </button>
            <button
              onClick={() => setStatusFilter('unattempted')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'unattempted'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unattempted
            </button>
            <button
              onClick={() => setStatusFilter('attempted')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                statusFilter === 'attempted'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attempted ({attemptedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Cards Grid */}
      {displayedQuizzes.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4">
            {displayedQuizzes.slice(0, visibleCount).map((quiz, index) => {
              const attempt = pastAttempts.find(a => a.testId === quiz.testId);
              const isAttempted = !!attempt;
              const unlockStatus = getMockUnlockStatus(index, nowTick);
              const isLocked = false;
              const questionCount = getQuestionCount(quiz);
              const mockNumberLabel = getMockNumberLabel(quiz, index);

              return (
                <div
                  key={quiz.testId || index}
                  onClick={() => {
                    if (isLocked) {
                      onLockedQuizClick(quiz, unlockStatus);
                    } else {
                      onStartQuiz(quiz, index);
                    }
                  }}
                  className={`bg-white border rounded-2xl p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all relative group ${
                    isAttempted 
                      ? 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20' 
                      : isLocked 
                        ? 'border-slate-200/60 bg-slate-50/50 opacity-90' 
                        : 'border-slate-200 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-purple-50 text-purple-700 font-black text-[10px] px-2.5 py-0.5 rounded-md border border-purple-100 uppercase tracking-wider">
                        {mockNumberLabel}
                      </span>

                      <div className="flex items-center gap-1">
                        {isAttempted && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Score: {attempt.score}
                          </span>
                        )}
                        {isLocked && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-600" /> Locked
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareQuiz(quiz, e);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Share Quiz Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                      {quiz.title}
                    </h3>
                  </div>

                  {/* Card Info Details */}
                  {(() => {
                    const diffTag = getDifficultyTag(index);
                    return (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                          <span>{diffTag.icon}</span> {diffTag.label}
                        </span>

                        <span className={`font-black text-xs flex items-center gap-1 ${
                          isAttempted ? 'text-emerald-600' : isLocked ? 'text-amber-600' : 'text-purple-600 group-hover:translate-x-0.5 transition-transform'
                        }`}>
                          {isAttempted ? 'Re-attempt' : isLocked ? 'Unlock' : 'Start Test →'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {displayedQuizzes.length > visibleCount && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold px-6 py-2.5 rounded-2xl text-xs border border-purple-200 transition-all cursor-pointer shadow-2xs"
              >
                Load More Tests ({displayedQuizzes.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-2">
          <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">No Teaching Methodology tests match your filters</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching the status filter to "All" or clearing your search term.
          </p>
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner location="tgt_cs_bottom" />
    </div>
  );
};

export default TeachingMethodologyHub;
