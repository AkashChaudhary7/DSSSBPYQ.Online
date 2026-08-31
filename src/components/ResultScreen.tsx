import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Quiz, Question, Bookmark } from '../types';
import { Trophy, RefreshCw, Star, CheckCircle, XCircle, Share2, Download, AlertCircle, ArrowLeft, Heart, Check, BookOpen, Send, Clock, Zap, Hourglass, BarChart3, TrendingUp, AlertTriangle, Filter, Layers, ArrowUpDown, SlidersHorizontal, Coins, Lock, Sparkles } from 'lucide-react';
import { generateQuizPdf } from '../lib/pdfGenerator';
import { trackQuizComplete, trackPageView, trackPdfDownload } from '../lib/analytics';
import { cleanOptionText } from '../lib/formatText';
import { getUserCoins, QUIZ_ATTEMPT_REWARD, DAILY_QUIZ_REWARD } from '../lib/rewardsSystem';

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
  onOpenTimeAnalytics?: () => void;
  questionTimeSpent?: Record<number, number>;
  isReattempt?: boolean;
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
  onOpenTimeAnalytics,
  questionTimeSpent = {},
  isReattempt = false,
}: ResultScreenProps) {
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

        {/* BytePrep Coin Reward & High Accuracy Bonus Card */}
        {(() => {
          if (isReattempt) {
            return (
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        Reattempt Test Completed
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        🪙 Balance: {getUserCoins()} Coins
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Points &amp; coins are awarded on your 1st attempt only. Great practice effort!
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" /> 100 🪙 unlocks any CBT Mock
                  </div>
                </div>
              </div>
            );
          }

          const isDaily = quiz.testId?.startsWith('daily_quiz_') || quiz.testId?.startsWith('booster_') || quiz.subject === 'Daily Quiz' || quiz.topic === 'Daily Challenge';
          const baseEarned = isDaily ? DAILY_QUIZ_REWARD : QUIZ_ATTEMPT_REWARD;
          let bonusEarned = 0;
          let bonusTag = '';
          if (accuracy >= 90) {
            bonusEarned = 10;
            bonusTag = 'Ranker Mastery Bonus (≥90% Accuracy)';
          } else if (accuracy >= 80) {
            bonusEarned = 7;
            bonusTag = 'High Accuracy Bonus (≥80% Accuracy)';
          } else if (accuracy >= 70) {
            bonusEarned = 5;
            bonusTag = 'Great Accuracy Bonus (≥70% Accuracy)';
          } else if (accuracy >= 50) {
            bonusEarned = 3;
            bonusTag = 'Good Accuracy Bonus (≥50% Accuracy)';
          }
          const totalEarned = baseEarned + bonusEarned;

          return (
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-orange-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      +{totalEarned} BytePrep Coins Awarded!
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      🪙 Total Balance: {getUserCoins()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    +{baseEarned} Base Attempt {bonusEarned > 0 ? `+ ${bonusEarned} ${bonusTag}` : '(Score ≥70% on next test for bonus coins)'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 100 🪙 unlocks any CBT Mock Test
                </div>
              </div>
            </div>
          );
        })()}

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
        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-center gap-3" data-no-export="true">
          <button
            onClick={onOpenSolutionReview}
            className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100 hover:scale-[1.01]"
            id="open-solution-review-primary-btn"
          >
            <BookOpen className="w-5 h-5 text-white" />
            Open Interactive Solutions & Explanation Review
          </button>
          
          {onOpenTimeAnalytics && (
            <button
              onClick={onOpenTimeAnalytics}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-100 hover:scale-[1.01]"
              id="open-time-analytics-primary-btn"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Advance Analytics (Time & Speed Deep Dive)</span>
            </button>
          )}
        </div>
      </div>

      {/* Action triggers: Restart, Return to Dashboard, PDF export */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-blue-100">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-base md:text-lg flex items-center justify-center md:justify-start gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" /> Export Question Paper with Solutions
          </h4>
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
