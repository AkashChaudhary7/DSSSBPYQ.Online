import React, { useState, useMemo } from 'react';
import { Quiz, Question } from '../types';
import { 
  ArrowLeft, Clock, Zap, AlertTriangle, CheckCircle2, XCircle, 
  HelpCircle, Filter, BookOpen, Sparkles, TrendingUp, BarChart3, 
  Layers, Check, Award
} from 'lucide-react';
import { cleanOptionText } from '../lib/formatText';

interface TimeAnalyticsViewProps {
  quiz: Quiz;
  userAnswers: Record<number, number>;
  questionTimeSpent?: Record<number, number>;
  timeSpentSeconds?: number;
  onBack: () => void;
  onOpenSolutionReview?: (questionIndex?: number) => void;
}

export default function TimeAnalyticsView({
  quiz,
  userAnswers,
  questionTimeSpent = {},
  timeSpentSeconds = 0,
  onBack,
  onOpenSolutionReview,
}: TimeAnalyticsViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'traps' | 'fastest' | 'incorrect' | 'skipped'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;

  // Process timing stats
  const stats = useMemo(() => {
    let totalAttemptedTime = 0;
    let attemptedCount = 0;
    let correctTime = 0;
    let correctCount = 0;
    let incorrectTime = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    let fastCount = 0; // < 25s
    let idealCount = 0; // 25s - 60s
    let slowCount = 0; // 60s - 90s
    let trapCount = 0; // > 90s

    const questionAnalysis = questions.map((q, idx) => {
      const userSel = userAnswers[idx];
      const timeSpent = questionTimeSpent[q.id] || 0;
      const isAttempted = userSel !== undefined && userSel !== null && userSel !== -1;
      const isCorrect = isAttempted && userSel === q.answer;

      if (isAttempted) {
        attemptedCount++;
        totalAttemptedTime += timeSpent;
        if (isCorrect) {
          correctCount++;
          correctTime += timeSpent;
        } else {
          incorrectCount++;
          incorrectTime += timeSpent;
        }
      } else {
        unattemptedCount++;
      }

      if (timeSpent < 25) fastCount++;
      else if (timeSpent <= 60) idealCount++;
      else if (timeSpent <= 90) slowCount++;
      else trapCount++;

      let paceLabel = 'Ideal';
      let paceBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      if (timeSpent < 25) {
        paceLabel = 'Fast ⚡';
        paceBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      } else if (timeSpent > 90) {
        paceLabel = 'Time Trap ⚠️';
        paceBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
      } else if (timeSpent > 60) {
        paceLabel = 'Slow ⏳';
        paceBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
      }

      return {
        index: idx + 1,
        question: q,
        userSel,
        isAttempted,
        isCorrect,
        timeSpent,
        paceLabel,
        paceBadgeClass,
      };
    });

    const avgAttempted = attemptedCount > 0 ? Math.round(totalAttemptedTime / attemptedCount) : 0;
    const avgCorrect = correctCount > 0 ? Math.round(correctTime / correctCount) : 0;
    const avgIncorrect = incorrectCount > 0 ? Math.round(incorrectTime / incorrectCount) : 0;

    // Fastest & Slowest
    const attemptedItems = [...questionAnalysis].filter(q => q.isAttempted).sort((a, b) => a.timeSpent - b.timeSpent);
    const fastestQ = attemptedItems[0];
    const slowestQ = attemptedItems[attemptedItems.length - 1];

    return {
      questionAnalysis,
      totalAttemptedTime,
      attemptedCount,
      correctCount,
      incorrectCount,
      unattemptedCount,
      avgAttempted,
      avgCorrect,
      avgIncorrect,
      fastCount,
      idealCount,
      slowCount,
      trapCount,
      fastestQ,
      slowestQ,
    };
  }, [questions, userAnswers, questionTimeSpent]);

  // Filtered list for detailed view
  const filteredQuestions = useMemo(() => {
    return stats.questionAnalysis.filter(q => {
      if (filterMode === 'traps' && q.timeSpent <= 60) return false;
      if (filterMode === 'fastest' && q.timeSpent >= 25) return false;
      if (filterMode === 'incorrect' && (!q.isAttempted || q.isCorrect)) return false;
      if (filterMode === 'skipped' && q.isAttempted) return false;
      if (selectedSection !== 'all' && q.question.section !== selectedSection) return false;
      return true;
    });
  }, [stats.questionAnalysis, filterMode, selectedSection]);

  const uniqueSections = useMemo(() => {
    const secSet = new Set<string>();
    questions.forEach(q => {
      if (q.section) secSet.add(q.section);
    });
    return Array.from(secSet);
  }, [questions]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs group shrink-0"
            title="Back to Previous View"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Advance Analytics
              </span>
              <span className="text-xs font-bold text-slate-400">|</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{quiz.title}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-600" />
              <span>Time & Speed Audit Deep Dive</span>
            </h2>
          </div>
        </div>

        {onOpenSolutionReview && (
          <button
            onClick={() => onOpenSolutionReview()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Solutions Review</span>
          </button>
        )}
      </div>

      {/* Overview Metric Cards 4-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Avg Time / Q</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.avgAttempted}s
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Benchmark: ~45s / question
          </p>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Time on Correct</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
            {stats.avgCorrect}s
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            {stats.correctCount} solved accurately
          </p>
        </div>

        <div className="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Time on Incorrect</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-200">
            {stats.avgIncorrect}s
          </div>
          <p className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">
            {stats.avgIncorrect > 45 ? '⚠️ High time sink on wrong Qs' : 'Quick incorrect attempts'}
          </p>
        </div>

        <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Time Spent</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200">
            {Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
            {stats.unattemptedCount} questions skipped
          </p>
        </div>
      </div>

      {/* Speed Category Bucket Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Speed & Pacing Bucket Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase">Fast (&lt;25s)</div>
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">{stats.fastCount} Qs</div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(stats.fastCount / totalQuestions) * 100}%` }} />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase">Ideal (25s - 60s)</div>
            <div className="text-xl font-extrabold text-blue-900 dark:text-blue-200">{stats.idealCount} Qs</div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(stats.idealCount / totalQuestions) * 100}%` }} />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase">Slow (60s - 90s)</div>
            <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">{stats.slowCount} Qs</div>
            <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(stats.slowCount / totalQuestions) * 100}%` }} />
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-3.5 space-y-1">
            <div className="text-[10px] font-black text-rose-800 dark:text-rose-300 uppercase">Time Traps (&gt;90s)</div>
            <div className="text-xl font-extrabold text-rose-900 dark:text-rose-200">{stats.trapCount} Qs</div>
            <div className="w-full bg-rose-200 dark:bg-rose-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full" style={{ width: `${(stats.trapCount / totalQuestions) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Fastest & Slowest Highlight Cards */}
      {(stats.fastestQ || stats.slowestQ) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.fastestQ && (
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">Fastest Solved Question</span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {stats.fastestQ.timeSpent}s
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  Q.{stats.fastestQ.index}: {cleanOptionText(stats.fastestQ.question.question)}
                </p>
              </div>
            </div>
          )}

          {stats.slowestQ && (
            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-400">Most Time Consuming Question</span>
                  <span className="text-xs font-black text-rose-800 bg-rose-100 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                    {stats.slowestQ.timeSpent}s
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  Q.{stats.slowestQ.index}: {cleanOptionText(stats.slowestQ.question.question)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs & Question Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Question-Wise Time Audit</span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              ({filteredQuestions.length} Questions)
            </span>
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Qs
            </button>
            <button
              onClick={() => setFilterMode('traps')}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                filterMode === 'traps'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              Time Traps (&gt;60s)
            </button>
            <button
              onClick={() => setFilterMode('fastest')}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                filterMode === 'fastest'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Fastest (&lt;25s)
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                filterMode === 'incorrect'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              Incorrect Qs
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-2.5">
          {filteredQuestions.map((qItem) => (
            <div
              key={qItem.index}
              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black flex items-center justify-center shrink-0">
                  Q.{qItem.index}
                </span>

                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {cleanOptionText(qItem.question.question)}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className={`font-extrabold px-2 py-0.5 rounded-md ${
                      !qItem.isAttempted
                        ? 'bg-slate-200 text-slate-700'
                        : qItem.isCorrect
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {!qItem.isAttempted ? 'SKIPPED' : qItem.isCorrect ? 'CORRECT 🟢' : 'INCORRECT 🔴'}
                    </span>

                    {qItem.question.section && (
                      <span className="text-slate-500 font-medium">
                        • {qItem.question.section}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="text-right">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${qItem.paceBadgeClass}`}>
                    {qItem.timeSpent}s
                  </span>
                  <div className="text-[9px] text-slate-400 font-bold mt-0.5">{qItem.paceLabel}</div>
                </div>

                {onOpenSolutionReview && (
                  <button
                    onClick={() => onOpenSolutionReview(qItem.index - 1)}
                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer"
                    title="Review Solution"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium text-xs">
              No questions match the selected filter condition.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
