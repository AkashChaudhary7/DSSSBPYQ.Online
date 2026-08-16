import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Quiz, Question, Bookmark } from '../types';
import { Trophy, RefreshCw, Star, CheckCircle, XCircle, Share2, Download, AlertCircle, ArrowLeft, Heart, Check, BookOpen, Send, Clock, Zap, Hourglass, BarChart3, TrendingUp, AlertTriangle, Filter } from 'lucide-react';
import { generateQuizPdf } from '../lib/pdfGenerator';
import { trackQuizComplete, trackPageView, trackPdfDownload } from '../lib/analytics';
import { cleanOptionText } from '../lib/formatText';

interface ResultScreenProps {
  quiz: Quiz;
  userAnswers: Record<number, number>;
  timeSpentSeconds: number;
  mode: 'exam' | 'practice';
  savedBookmarks: Bookmark[];
  onToggleGlobalBookmark: (question: Question) => void;
  onRestart: () => void;
  onBackToHome: () => void;
  onOpenSolutionReview: () => void;
  questionTimeSpent?: Record<number, number>;
}

export default function ResultScreen({
  quiz,
  userAnswers,
  timeSpentSeconds,
  mode,
  savedBookmarks,
  onToggleGlobalBookmark,
  onRestart,
  onBackToHome,
  onOpenSolutionReview,
  questionTimeSpent = {},
}: ResultScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted' | 'slow'>('all');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [shareScoreGenerating, setShareScoreGenerating] = useState(false);
  const [shareChallengeGenerating, setShareChallengeGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShareScore = async () => {
    if (!cardRef.current) return;
    setShareScoreGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const noExportEls = clonedDoc.querySelectorAll('[data-no-export="true"]');
          noExportEls.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((style) => {
            if (style.textContent) {
              if (style.textContent.includes('oklch')) {
                style.textContent = style.textContent.replace(/oklch\([^)]+\)/gi, '#2563eb');
              }
              if (style.textContent.includes('oklab')) {
                style.textContent = style.textContent.replace(/oklab\([^)]+\)/gi, '#2563eb');
              }
            }
          });
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const inlineStyle = el.getAttribute('style');
            if (inlineStyle) {
              let updatedStyle = inlineStyle;
              if (inlineStyle.includes('oklch')) {
                updatedStyle = updatedStyle.replace(/oklch\([^)]+\)/gi, '#2563eb');
              }
              if (inlineStyle.includes('oklab')) {
                updatedStyle = updatedStyle.replace(/oklab\([^)]+\)/gi, '#2563eb');
              }
              if (updatedStyle !== inlineStyle) {
                el.setAttribute('style', updatedStyle);
              }
            }
          });
        },
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `dsssb_score_${quiz.testId || 'result'}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My DSSSB Exam Score',
              text: `🎯 I scored ${score}/${totalQuestions} (${accuracy}% accuracy) on the DSSSB "${quiz.title}"! Check out https://dsssbpyq.online`,
              files: [file],
            });
            setShareScoreGenerating(false);
            return;
          } catch (err) {
            console.log('Share canceled or failed', err);
          }
        }
        const imageUri = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUri;
        link.download = `dsssb_score_${quiz.testId || 'result'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShareScoreGenerating(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating share score image:', err);
      alert('Error generating image. Please try again.');
      setShareScoreGenerating(false);
    }
  };

  const handleShareChallenge = async () => {
    if (!cardRef.current) return;
    setShareChallengeGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const noExportEls = clonedDoc.querySelectorAll('[data-no-export="true"]');
          noExportEls.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((style) => {
            if (style.textContent) {
              if (style.textContent.includes('oklch')) {
                style.textContent = style.textContent.replace(/oklch\([^)]+\)/gi, '#2563eb');
              }
              if (style.textContent.includes('oklab')) {
                style.textContent = style.textContent.replace(/oklab\([^)]+\)/gi, '#2563eb');
              }
            }
          });
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const inlineStyle = el.getAttribute('style');
            if (inlineStyle) {
              let updatedStyle = inlineStyle;
              if (inlineStyle.includes('oklch')) {
                updatedStyle = updatedStyle.replace(/oklch\([^)]+\)/gi, '#2563eb');
              }
              if (inlineStyle.includes('oklab')) {
                updatedStyle = updatedStyle.replace(/oklab\([^)]+\)/gi, '#2563eb');
              }
              if (updatedStyle !== inlineStyle) {
                el.setAttribute('style', updatedStyle);
              }
            }
          });
        },
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `dsssb_challenge_${quiz.testId || 'result'}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'DSSSB Exam Challenge',
              text: `🏆 I challenge you to beat my score of ${score}/${totalQuestions} (${accuracy}% accuracy) on the DSSSB "${quiz.title}"! Take the test at https://dsssbpyq.online`,
              files: [file],
            });
            setShareChallengeGenerating(false);
            return;
          } catch (err) {
            console.log('Share canceled or failed', err);
          }
        }
        const imageUri = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUri;
        link.download = `dsssb_challenge_${quiz.testId || 'result'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShareChallengeGenerating(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating share challenge image:', err);
      alert('Error generating image. Please try again.');
      setShareChallengeGenerating(false);
    }
  };

  // Compute metrics
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  (quiz?.questions || []).forEach((q) => {
    if (!q) return;
    const ans = userAnswers[q.id];
    if (ans === undefined) {
      unattemptedCount++;
    } else if (ans === q.answer) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const totalQuestions = (quiz?.questions || []).length;
  // DSSSB Marking Scheme: +1 for correct, -0.25 for incorrect
  const rawScore = correctCount - (incorrectCount * 0.25);
  const score = parseFloat(rawScore.toFixed(2));
  const accuracy = totalQuestions - unattemptedCount > 0 
    ? Math.round((correctCount / (totalQuestions - unattemptedCount)) * 100) 
    : 0;

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;

  useEffect(() => {
    trackPageView('Result Screen', `/results/${quiz.testId}`);
    trackQuizComplete(quiz.testId, score, accuracy, timeSpentSeconds);
  }, [quiz.testId, score, accuracy, timeSpentSeconds]);

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`🎯 I scored ${score}/${totalQuestions} in the DSSSB TGT CS Mock Test! Can you beat me? Try here: ${window.location.origin || 'https://dsssbpyq.online'}`);
    window.open(`https://t.me/share/url?url=${window.location.origin || 'https://dsssbpyq.online'}&text=${text}`, '_blank');
  };

  // Generate and Download PDF question paper with rich layout and Hindi Unicode support
  const generatePDF = async () => {
    setPdfGenerating(true);
    try {
      trackPdfDownload(quiz.testId);
      await generateQuizPdf(quiz, {
        totalQuestions,
        score,
        correctCount,
        incorrectCount,
        accuracy,
        minutes,
        seconds
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF question paper. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Direct download PDF without ad requirement
  const handlePdfDownloadClick = () => {
    generatePDF();
  };

  const isQuestionBookmarked = (qId: number) => {
    return savedBookmarks.some(b => b.quizId === quiz.testId && b.question.id === qId);
  };

  // Time-Per-Question Analysis Computations
  const timeMetrics = useMemo(() => {
    const questions = quiz?.questions || [];
    let totalCorrectTime = 0;
    let totalIncorrectTime = 0;
    let totalUnattemptedTime = 0;
    
    let fastestItem: { q: Question; index: number; time: number; status: string } | null = null;
    let slowestItem: { q: Question; index: number; time: number; status: string } | null = null;

    const questionRows = questions.map((q, idx) => {
      const isAnswered = userAnswers[q.id] !== undefined;
      const isCorrect = isAnswered && userAnswers[q.id] === q.answer;
      const isIncorrect = isAnswered && !isCorrect;
      const status = isCorrect ? 'correct' : isIncorrect ? 'incorrect' : 'unattempted';

      // Actual recorded time from session or estimated
      const recordedTime = (questionTimeSpent && questionTimeSpent[q.id] !== undefined)
        ? questionTimeSpent[q.id]
        : (isAnswered ? Math.max(1, Math.round(timeSpentSeconds / Math.max(1, Object.keys(userAnswers).length))) : 0);

      if (isCorrect) totalCorrectTime += recordedTime;
      else if (isIncorrect) totalIncorrectTime += recordedTime;
      else totalUnattemptedTime += recordedTime;

      // Track fastest & slowest attempted questions
      if (isAnswered && recordedTime > 0) {
        if (!fastestItem || recordedTime < fastestItem.time) {
          fastestItem = { q, index: idx + 1, time: recordedTime, status };
        }
        if (!slowestItem || recordedTime > slowestItem.time) {
          slowestItem = { q, index: idx + 1, time: recordedTime, status };
        }
      }

      return {
        question: q,
        index: idx + 1,
        time: recordedTime,
        status,
        isOvertime: recordedTime > 45
      };
    });

    const attemptedCount = correctCount + incorrectCount;
    const avgOverallTime = questions.length > 0 ? Math.round(timeSpentSeconds / questions.length) : 0;
    const avgAttemptedTime = attemptedCount > 0 ? Math.round((totalCorrectTime + totalIncorrectTime) / attemptedCount) : 0;
    const avgCorrectTime = correctCount > 0 ? Math.round(totalCorrectTime / correctCount) : 0;
    const avgIncorrectTime = incorrectCount > 0 ? Math.round(totalIncorrectTime / incorrectCount) : 0;
    const avgUnattemptedTime = unattemptedCount > 0 ? Math.round(totalUnattemptedTime / unattemptedCount) : 0;

    let paceGrade = 'Fast & Optimal';
    let paceColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (avgAttemptedTime > 65) {
      paceGrade = 'High Time / Slow Pace';
      paceColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (avgAttemptedTime > 45) {
      paceGrade = 'Moderate Pace';
      paceColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      avgOverallTime,
      avgAttemptedTime,
      avgCorrectTime,
      avgIncorrectTime,
      avgUnattemptedTime,
      fastestItem,
      slowestItem,
      questionRows,
      paceGrade,
      paceColor
    };
  }, [quiz?.questions, userAnswers, questionTimeSpent, timeSpentSeconds, correctCount, incorrectCount, unattemptedCount]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Result Metrics Header Card */}
      <div ref={cardRef} className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Colorful gradient abstract accent background elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Mock Report card
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2.5 py-1 rounded-full uppercase">
                {mode === 'exam' ? 'Exam Mode' : 'Practice'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight display-font">
              {quiz.title}
            </h2>
            <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Time Taken: {minutes}m {seconds}s</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>Marking Rules Applied (+1.00 for Correct, -0.25 for Incorrect)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 md:flex md:items-center md:gap-3 shrink-0 w-full md:w-auto" data-no-export="true">
            <button
              onClick={handleShareScore}
              disabled={shareScoreGenerating}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-2 px-1 sm:py-2.5 sm:px-4 rounded-xl text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:shadow-sm disabled:opacity-50 w-full"
              title="Share Score Image"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{shareScoreGenerating ? 'Wait...' : 'Share Score'}</span>
            </button>

            <button
              onClick={handleShareChallenge}
              disabled={shareChallengeGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold py-2 px-1 sm:py-2.5 sm:px-4 rounded-xl text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:shadow-sm disabled:opacity-50 w-full"
              title="Share Challenge Image"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{shareChallengeGenerating ? 'Wait...' : 'Share Chal.'}</span>
            </button>

            <button
              onClick={handleTelegramShare}
              className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold py-2 px-1 sm:py-2.5 sm:px-4 rounded-xl text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:shadow-sm w-full"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Telegram</span>
            </button>
          </div>
        </div>

        {/* Big Dashboard Grid Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-slate-100 pt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Score</p>
            <h3 className={`text-2xl font-black mt-1 ${score >= (totalQuestions * 0.5) ? 'text-emerald-600' : 'text-amber-600'}`}>
              {score.toFixed(2)}
            </h3>
            <span className="text-[9px] text-slate-500">out of {totalQuestions} marks</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accuracy %</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {accuracy}%
            </h3>
            <span className="text-[9px] text-slate-500">based on solved only</span>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Correct</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {correctCount}
            </h3>
            <span className="text-[9px] text-emerald-500">+{correctCount} Marks</span>
          </div>

          <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100/30 text-center">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Incorrect</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">
              {incorrectCount}
            </h3>
            <span className="text-[9px] text-red-500">-{parseFloat((incorrectCount * 0.25).toFixed(2))} Marks</span>
          </div>
        </div>

        {/* Official Website Stamp for Exported Image & Screen */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>🏛️ DSSSB TGT Computer Science Online Portal</span>
          </div>
          <div className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
            https://dsssbpyq.online
          </div>
        </div>

        {/* Primary Interactive Solution Review Banner Call-to-action */}
        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col items-center justify-center" data-no-export="true">
          <button
            onClick={onOpenSolutionReview}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100 hover:scale-[1.01]"
            id="open-solution-review-primary-btn"
          >
            <BookOpen className="w-5 h-5 text-white" />
            Open Interactive Solutions & Explanation Review (Mock Test Style)
          </button>
        </div>
      </div>

      {/* TIME-PER-QUESTION & SPEED INTELLIGENCE CARD */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                Time Analytics
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${timeMetrics.paceColor}`}>
                {timeMetrics.paceGrade}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              Time Per Question Analysis & Pace Intelligence
            </h3>
          </div>
          <div className="text-right text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
            <span>DSSSB Standard Pace: </span>
            <strong className="text-blue-700">~45s / Question</strong>
          </div>
        </div>

        {/* Speed Analytics 4-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Time / Q</span>
            <div className="text-xl font-black text-slate-800">
              {timeMetrics.avgAttemptedTime}s
            </div>
            <span className="text-[9px] text-slate-500 font-medium">on attempted questions</span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1 text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Time on Correct</span>
            <div className="text-xl font-black text-emerald-700">
              {timeMetrics.avgCorrectTime}s
            </div>
            <span className="text-[9px] text-emerald-600 font-medium">high speed efficiency</span>
          </div>

          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 space-y-1 text-center">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Time on Incorrect</span>
            <div className="text-xl font-black text-rose-700">
              {timeMetrics.avgIncorrectTime}s
            </div>
            <span className="text-[9px] text-rose-600 font-medium">
              {timeMetrics.avgIncorrectTime > 45 ? '⚠️ Time Sink Traps' : 'Quick Attempt'}
            </span>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 space-y-1 text-center">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Time on Skipped</span>
            <div className="text-xl font-black text-blue-700">
              {timeMetrics.avgUnattemptedTime}s
            </div>
            <span className="text-[9px] text-blue-600 font-medium">skipping speed</span>
          </div>
        </div>

        {/* Fastest & Slowest Questions Highlights */}
        {(timeMetrics.fastestItem || timeMetrics.slowestItem) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {timeMetrics.fastestItem && (
              <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ⚡
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-emerald-900 uppercase">Fastest Solved Question</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {timeMetrics.fastestItem.time}s
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    Q.{timeMetrics.fastestItem.index}: {cleanOptionText(timeMetrics.fastestItem.q.question)}
                  </p>
                  <span className="text-[10px] font-bold text-slate-500">
                    Status: <span className={timeMetrics.fastestItem.status === 'correct' ? 'text-emerald-600' : 'text-rose-600'}>{timeMetrics.fastestItem.status.toUpperCase()}</span>
                  </span>
                </div>
              </div>
            )}

            {timeMetrics.slowestItem && (
              <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ⏳
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-amber-900 uppercase">Most Time Consuming Question</span>
                    <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {timeMetrics.slowestItem.time}s
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    Q.{timeMetrics.slowestItem.index}: {cleanOptionText(timeMetrics.slowestItem.q.question)}
                  </p>
                  <span className="text-[10px] font-bold text-slate-500">
                    Status: <span className={timeMetrics.slowestItem.status === 'correct' ? 'text-emerald-600' : 'text-rose-600'}>{timeMetrics.slowestItem.status.toUpperCase()}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Question-by-Question Time Breakdown Matrix */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Question-by-Question Time Breakdown Matrix
            </h4>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  timeFilter === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                All ({totalQuestions})
              </button>
              <button
                onClick={() => setTimeFilter('correct')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  timeFilter === 'correct'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                onClick={() => setTimeFilter('incorrect')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  timeFilter === 'incorrect'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
              <button
                onClick={() => setTimeFilter('slow')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  timeFilter === 'slow'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                Overtime (&gt;45s)
              </button>
              <button
                onClick={() => setTimeFilter('unattempted')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  timeFilter === 'unattempted'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                Skipped ({unattemptedCount})
              </button>
            </div>
          </div>

          {/* Matrix List Rows */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {timeMetrics.questionRows
              .filter(row => {
                if (timeFilter === 'correct') return row.status === 'correct';
                if (timeFilter === 'incorrect') return row.status === 'incorrect';
                if (timeFilter === 'unattempted') return row.status === 'unattempted';
                if (timeFilter === 'slow') return row.time > 45;
                return true;
              })
              .map(row => {
                const maxTimeRef = Math.max(90, ...timeMetrics.questionRows.map(r => r.time));
                const widthPercent = Math.min(100, Math.max(8, (row.time / maxTimeRef) * 100));

                let barColor = "bg-slate-300";
                let statusBadge = (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    Skipped
                  </span>
                );

                if (row.status === 'correct') {
                  barColor = "bg-emerald-500";
                  statusBadge = (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Correct
                    </span>
                  );
                } else if (row.status === 'incorrect') {
                  barColor = "bg-rose-500";
                  statusBadge = (
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-2.5 h-2.5" /> Incorrect
                    </span>
                  );
                }

                return (
                  <div key={row.index} className="p-3 hover:bg-slate-50/80 transition-colors flex items-center gap-3 text-xs">
                    <span className="font-mono font-bold text-slate-700 w-8 shrink-0">
                      Q.{row.index}
                    </span>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {cleanOptionText(row.question.question)}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {statusBadge}
                          <span className="font-mono font-black text-slate-800 text-[11px] w-10 text-right">
                            {row.time}s
                          </span>
                        </div>
                      </div>

                      {/* Visual Time Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Action triggers: Restart, Return to Dashboard, PDF export */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-blue-100">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-base md:text-lg flex items-center justify-center md:justify-start gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" /> Export Question Paper with Solutions
          </h4>
          <p className="text-xs text-white/80 leading-relaxed max-w-xl">
            Get a beautifully structured PDF document containing the original exam questions, correct options, and detailed pedagogical explanations. Perfect for self-revision or sharing in study groups.
          </p>
        </div>

        <button
          onClick={handlePdfDownloadClick}
          disabled={pdfGenerating}
          className="bg-white hover:bg-slate-100 active:bg-slate-200 text-blue-700 font-bold py-3.5 px-6 rounded-2xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
        >
          {pdfGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              Generating PDF...
            </>
          ) : pdfSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              Downloaded Successfully!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Solution PDF (Free)
            </>
          )}
        </button>
      </div>

      {/* Performance Insights layout directly */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-8 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-100"
          >
            <RefreshCw className="w-4 h-4" /> Re-attempt Mock Test
          </button>
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto border border-slate-200 hover:bg-slate-50 font-semibold py-3.5 px-8 rounded-2xl text-xs transition-all text-slate-700 cursor-pointer text-center bg-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
