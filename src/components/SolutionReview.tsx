import React, { useState } from 'react';
import { Quiz, Question, Bookmark } from '../types';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Star, CheckCircle2, XCircle, 
  BookOpen, Layout, HelpCircle, Award, Check, X, AlertTriangle, Send
} from 'lucide-react';
import StepByStepExplanation from './StepByStepExplanation';
import { FormattedText, cleanOptionText, hasOptionPrefix, getDisplayOptionText } from '../lib/formatText';

interface SolutionReviewProps {
  quiz: Quiz;
  userAnswers: Record<number, number>;
  savedBookmarks: Bookmark[];
  onToggleGlobalBookmark: (question: Question) => void;
  onReportQuestion?: (reportRecord: any) => void;
  onBack: () => void;
}

export default function SolutionReview({
  quiz,
  userAnswers,
  savedBookmarks,
  onToggleGlobalBookmark,
  onReportQuestion,
  onBack,
}: SolutionReviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect Option / Answer Key');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccessToast, setReportSuccessToast] = useState(false);

  const currentQuestion = (quiz?.questions || [])[currentIdx] || (quiz?.questions || [])[0];
  const totalQuestions = (quiz?.questions || []).length;

  const isQuestionBookmarked = (qId: number) => {
    return savedBookmarks.some(b => b.quizId === quiz.testId && b.question?.id === qId);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    const reportRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quizId: quiz.testId,
      quizTitle: quiz.title,
      questionId: currentQuestion.id,
      questionText: currentQuestion.question || (currentQuestion as any).title || 'Question text unavailable',
      reason: reportReason,
      details: reportDetails,
      timestamp: new Date().toISOString(),
      status: 'pending',
      question: currentQuestion
    };

    if (onReportQuestion) {
      onReportQuestion(reportRecord);
    }

    setShowReportModal(false);
    setReportDetails('');
    setReportSuccessToast(true);
    setTimeout(() => setReportSuccessToast(false), 3000);
  };

  // Helper to determine question state: correct, incorrect, unattempted
  const getQuestionState = (idx: number) => {
    const q = (quiz?.questions || [])[idx];
    if (!q) return 'unattempted';
    const ans = userAnswers[q.id];
    if (ans === undefined) return 'unattempted';
    return ans === q.answer ? 'correct' : 'incorrect';
  };

  // Statistics
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">No Solutions Available</h3>
        <p className="text-xs text-slate-500 max-w-sm">There are no questions in this test to review.</p>
        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative" id="solution-review-root">
      {/* Top sticky header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            id="back-to-results-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight line-clamp-1">{quiz.title}</h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Question Review • {currentIdx + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="text-emerald-600">{correctCount} Correct</span>
            <span>•</span>
            <span className="text-rose-600">{incorrectCount} Incorrect</span>
            <span>•</span>
            <span className="text-slate-500">{unattemptedCount} Unattempted</span>
          </div>
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
            id="toggle-palette-btn"
          >
            {isPaletteOpen ? 'Close Grid' : 'Question Grid'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Main interactive area */}
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6 pb-28">
          
          {/* Section tag */}
          <div className="bg-slate-100 border border-slate-200/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-bold tracking-wider uppercase">{currentQuestion.section}</span>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
              getQuestionState(currentIdx) === 'correct' ? 'bg-emerald-100 text-emerald-800' :
              getQuestionState(currentIdx) === 'incorrect' ? 'bg-rose-100 text-rose-800' :
              'bg-slate-200 text-slate-700'
            }`}>
              {getQuestionState(currentIdx) === 'correct' ? 'Correct' :
               getQuestionState(currentIdx) === 'incorrect' ? 'Incorrect' :
               'Unattempted'}
            </span>
          </div>

          {/* Question Display Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden" id="review-question-card">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-bold bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  Q{currentIdx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Report Question Error"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline">Report Question</span>
                  </button>
                  <button
                    onClick={() => onToggleGlobalBookmark(currentQuestion)}
                    className={`p-2 rounded-xl border transition-all ${
                      isQuestionBookmarked(currentQuestion.id)
                        ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                    id="star-bookmark-btn"
                  >
                    <Star className={`w-4 h-4 ${isQuestionBookmarked(currentQuestion.id) ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                <FormattedText text={currentQuestion.question} />
              </div>
            </div>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isCorrect = currentQuestion.answer === idx;
                const userSelected = userAnswers[currentQuestion.id] === idx;

                let optStyle = "bg-white border-slate-200 text-slate-700";
                
                if (isCorrect) {
                  optStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-bold";
                } else if (userSelected) {
                  optStyle = "bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400";
                } else {
                  optStyle = "bg-slate-50/40 border-slate-200 text-slate-500";
                }

                return (
                  <div
                    key={idx}
                    className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm font-semibold flex items-center justify-between gap-4 ${optStyle}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {!hasOptionPrefix(option) && (
                        <span className={`w-6 h-6 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isCorrect 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : userSelected
                              ? 'bg-rose-500 border-rose-500 text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                      )}
                      <FormattedText text={cleanOptionText(option)} asParagraph={false} />
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isCorrect && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Correct</span>
                      )}
                      {userSelected && !isCorrect && (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Your Selection</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Focus Mode Explanation card (Big and Bold text) */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm" id="focus-explanation-panel">
              <div className="flex items-center gap-2 text-indigo-800">
                <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Pedagogical Analysis & Solution Guide</span>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-600 font-bold">
                  Correct Answer is Option {String.fromCharCode(65 + currentQuestion.answer)}: <span className="text-emerald-700 font-extrabold">{cleanOptionText(currentQuestion.options[currentQuestion.answer])}</span>
                </p>
                <div className="pt-2 border-t border-indigo-100">
                  <StepByStepExplanation explanation={currentQuestion.explanation} />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Collapsible Question Palette Side Panel */}
        <aside className={`fixed lg:static top-[57px] right-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-xl lg:shadow-none z-40 transition-transform duration-300 transform ${
          isPaletteOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'
        } p-6 flex flex-col justify-between`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Question Review Palette</h4>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {totalQuestions} Questions
              </span>
            </div>

            {/* Color coding keys */}
            <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-500 uppercase pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>Incorrect</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span>
                <span>Unsaved</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
              {(quiz?.questions || []).map((_, idx) => {
                const state = getQuestionState(idx);
                let btnStyle = "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200";

                if (state === 'correct') {
                  btnStyle = "bg-emerald-500 border-emerald-500 text-white font-bold";
                } else if (state === 'incorrect') {
                  btnStyle = "bg-rose-500 border-rose-500 text-white font-bold";
                } else {
                  btnStyle = "bg-slate-300 border-slate-300 text-slate-700 font-medium";
                }

                // Add accent ring to current question
                if (currentIdx === idx) {
                  btnStyle += " ring-4 ring-indigo-300 ring-offset-1";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      if (window.innerWidth < 1024) {
                        setIsPaletteOpen(false);
                      }
                    }}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={onBack}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100"
              id="exit-review-sidebar-btn"
            >
              Exit Review
            </button>
          </div>
        </aside>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-4 py-3.5 flex items-center justify-between z-30 max-w-4xl mx-auto rounded-t-3xl shadow-lg">
        <button
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
          >
            Back to Report
          </button>
        </div>

        <button
          onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
          disabled={currentIdx === totalQuestions - 1}
          className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Report Success Toast */}
      {reportSuccessToast && (
        <div className="fixed top-20 right-4 z-[70] bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Question reported successfully! Thank you for helping improve quality.</span>
        </div>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-extrabold text-slate-800 text-sm">Report Error in Question #{currentQuestion.id}</h4>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Incorrect Option / Answer Key">Incorrect Option / Answer Key</option>
                  <option value="Typo or Grammatical Error">Typo or Grammatical Error in Question</option>
                  <option value="Formatting / Symbols Missing">Formatting or Math Symbols Missing</option>
                  <option value="Out of Syllabus">Out of Syllabus for DSSSB Exam</option>
                  <option value="Other">Other / General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Details (Optional)</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why you think this question or answer is wrong..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-full border border-slate-200 hover:bg-slate-50 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-red-100 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
