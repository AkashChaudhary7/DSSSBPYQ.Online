import React, { useState, useMemo } from 'react';
import { 
  History, Trophy, Target, Clock, Calendar, CheckCircle2, 
  AlertCircle, ChevronRight, RotateCcw, FileText, Search, 
  ArrowUpDown, Filter, Sparkles, Award, ArrowLeft, Trash2
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';
import { Attempt, Quiz } from '../types';

interface MockHistoryViewProps {
  attempts: Attempt[];
  allQuizzes: Quiz[];
  onReviewAttempt: (attempt: Attempt) => void;
  onRetakeQuiz: (quiz: Quiz) => void;
  onDeleteAttempt?: (attemptIndex: number) => void;
  onNavigateToDashboard: () => void;
}

export default function MockHistoryView({
  attempts,
  allQuizzes,
  onReviewAttempt,
  onRetakeQuiz,
  onDeleteAttempt,
  onNavigateToDashboard
}: MockHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'full' | 'partA' | 'partB'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestScore' | 'lowestScore'>('newest');

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
        return quizObj?.category === 'full' || (a.testTitle && a.testTitle.toLowerCase().includes('full mock'));
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
        return quizObj?.category === 'part_b' || quizObj?.subject?.toLowerCase().includes('part b') || a.testTitle?.toLowerCase().includes('part b') || a.testTitle?.toLowerCase().includes('computer science');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-3 sm:px-6 transition-colors duration-200">
      
      {/* Top Header */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToDashboard}
            className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs flex items-center justify-center cursor-pointer shrink-0 group"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Mock History</span>
              <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                {groupedAttempts.length}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Complete archive of all your DSSSB CBT mock attempts, scores, timestamps &amp; attempt counts
            </p>
          </div>
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

        {/* Filter & Search Controls Bar */}
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
                { id: 'all', label: 'All' },
                { id: 'full', label: 'Full Mocks' },
                { id: 'partA', label: 'Part A' },
                { id: 'partB', label: 'Part B CS' },
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
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {attempts.length === 0 ? 'No Mock Tests Attempted Yet' : 'No Matching Mocks Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                {attempts.length === 0 
                  ? 'Take full-length and topic-wise CBT mock tests from the Dashboard to record your scores and track your progress!' 
                  : 'Try adjusting your search terms or filters above.'}
              </p>
            </div>
            {attempts.length === 0 && (
              <button
                onClick={onNavigateToDashboard}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Mock Tests</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroupedAttempts.map((group) => {
              const latest = group.latestAttempt;
              const timesTaken = group.timesTaken;
              const isExpanded = expandedGroupKey === group.key;

              const quizObj = allQuizzes.find((q) => q.testId === latest.testId) ||
                allQuizzes.find((q) => q.title?.toLowerCase() === (latest.testTitle || '').toLowerCase()) ||
                (allQuizzes.length > 0 ? {
                  testId: latest.testId || 'dsssb_custom_mock',
                  title: latest.testTitle || 'DSSSB CBT Mock Test',
                  description: 'DSSSB Practice Examination Session',
                  durationMinutes: 120,
                  questions: latest.questions || allQuizzes[0]?.questions || [],
                  markingScheme: { correct: 1, negative: 0.25 }
                } : null);

              const dateObj = new Date(latest.timestamp);
              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={group.key}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left: Title, Date, Times Taken Badge */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-md uppercase">
                          {latest.subject || 'DSSSB CBT Mock'}
                        </span>

                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${
                          timesTaken > 1 
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
                            : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {timesTaken > 1 ? `🔁 Taken ${timesTaken} times` : '1 Attempt'}
                        </span>

                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Latest: {formattedDate} at {formattedTime}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {latest.testTitle}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>Correct: <strong className="text-emerald-600">{latest.correctCount || latest.correctAnswers || 0}</strong></span>
                        <span>•</span>
                        <span>Incorrect: <strong className="text-rose-600">{latest.incorrectCount || latest.incorrectAnswers || 0}</strong></span>
                        <span>•</span>
                        <span>Unattempted: <strong className="text-slate-600 dark:text-slate-300">{latest.unattemptedCount || latest.unanswered || 0}</strong></span>
                        {latest.timeSpentSeconds ? (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {Math.round(latest.timeSpentSeconds / 60)} mins
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* Middle & Right: Score, Accuracy & Actions */}
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left md:text-right">
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {latest.score} <span className="text-xs font-normal text-slate-400">/ {latest.totalQuestions || 200}</span>
                        </div>
                        <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            latest.accuracy >= 75 ? 'bg-emerald-500' : latest.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {latest.accuracy}% Accuracy
                          </span>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReviewAttempt(latest)}
                          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Review Solutions & Explanations"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Solutions</span>
                        </button>

                        {timesTaken > 1 && (
                          <button
                            onClick={() => setExpandedGroupKey(isExpanded ? null : group.key)}
                            className="px-2.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1 cursor-pointer"
                            title="View all past attempt logs"
                          >
                            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[11px]">{isExpanded ? 'Hide' : `Logs (${timesTaken})`}</span>
                          </button>
                        )}

                        {quizObj && (
                          <button
                            onClick={() => onRetakeQuiz(quizObj as Quiz)}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Retake this mock test"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retake Quiz</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable History Breakdown for Multiple Attempts */}
                  {timesTaken > 1 && isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-fadeIn">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Attempt Breakdown ({timesTaken} Total Attempts)
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
                        {group.allAttempts.map((att, attIdx) => {
                          const attDate = new Date(att.timestamp);
                          const attDateStr = attDate.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          });
                          const attTimeStr = attDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div key={attIdx} className="p-2.5 sm:p-3 flex items-center justify-between text-xs gap-2">
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

    </div>
  );
}
