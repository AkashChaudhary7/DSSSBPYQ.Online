import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Quiz, Question, Bookmark } from '../types';
import { Clock, ArrowLeft, ChevronLeft, ChevronRight, Star, AlertTriangle, Eye, RefreshCw, Send, CheckCircle2, XCircle, Lock, ShieldCheck, User, Info, Maximize2, Minimize2, Share2, Zap, Hourglass } from 'lucide-react';
import StepByStepExplanation from './StepByStepExplanation';
import { FormattedText, cleanOptionText, hasOptionPrefix, getDisplayOptionText, StandardizedQuestionView } from '../lib/formatText';
import { getQuestionSourceTrace } from '../lib/sourceTrace';

interface QuizInterfaceProps {
  quiz: Quiz;
  mode: 'exam' | 'practice';
  durationMinutes: number; // Configurable override
  onBack: () => void;
  onSubmit: (answers: Record<number, number>, timeSpentSeconds: number, bookmarks: Record<number, boolean>, questionTimeSpent?: Record<number, number>) => void;
  savedBookmarks: Bookmark[];
  onToggleGlobalBookmark: (question: Question) => void;
  onReportQuestion?: (reportRecord: any) => void;
  initialSessionState?: {
    currentIdx?: number;
    userAnswers?: Record<number, number>;
    visitedQuestions?: Record<number, boolean>;
    localBookmarks?: Record<number, boolean>;
    secondsLeft?: number;
    activeSectionIdx?: number;
    submittedSections?: Record<number, boolean>;
    questionTimeSpent?: Record<number, number>;
  } | null;
  onDiscardSession?: () => void;
}

export default function QuizInterface({
  quiz,
  mode,
  durationMinutes,
  onBack,
  onSubmit,
  savedBookmarks,
  onToggleGlobalBookmark,
  onReportQuestion,
  initialSessionState,
  onDiscardSession,
}: QuizInterfaceProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(() => initialSessionState?.currentIdx ?? 0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>(() => initialSessionState?.userAnswers ?? {});
  const [localBookmarks, setLocalBookmarks] = useState<Record<number, boolean>>(() => initialSessionState?.localBookmarks ?? {});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>(() => initialSessionState?.visitedQuestions ?? {});
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>(() => initialSessionState?.questionTimeSpent ?? {});
  const [secondsLeft, setSecondsLeft] = useState<number>(() => initialSessionState?.secondsLeft ?? (durationMinutes * 60));
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const triggerHaptic = (pattern: number | number[] = 12) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // DSSSB Section-Based Lock Submission states
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(() => initialSessionState?.activeSectionIdx ?? 0);
  const [submittedSections, setSubmittedSections] = useState<Record<number, boolean>>(() => initialSessionState?.submittedSections ?? {});
  const [showSectionSubmitModal, setShowSectionSubmitModal] = useState(false);

  // Question Reporting states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect Option / Answer Key');
  const [reportDetails, setReportDetails] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  // Retrieve Candidate Name dynamically
  const candidateName = useMemo(() => {
    return localStorage.getItem('dsssb_username') || 'John Smith';
  }, []);

  // Extract unique sections and their question indices
  const sectionsList = useMemo(() => {
    const map = new Map<string, number[]>();
    (quiz?.questions || []).forEach((q, idx) => {
      const secName = q?.section || 'General Section';
      if (!map.has(secName)) {
        map.set(secName, []);
      }
      map.get(secName)!.push(idx);
    });
    return Array.from(map.entries()).map(([name, indices]) => ({
      name,
      indices
    }));
  }, [quiz?.questions]);

  const isSectionBasedMode = mode === 'exam' && sectionsList.length > 1;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trace = getQuestionSourceTrace(quiz.testId, quiz.title, currentQuestion.id);
    const reportRecord = {
      id: `report_${Date.now()}_${currentQuestion.id}`,
      questionId: currentQuestion.id,
      quizId: quiz.testId,
      quizTitle: quiz.title,
      question: currentQuestion,
      reason: reportReason,
      details: reportDetails,
      reportedAt: new Date().toISOString(),
      reportedBy: candidateName,
      trace
    };

    if (onReportQuestion) {
      onReportQuestion(reportRecord);
    }

    setToastMessage({
      title: "Question Flagged & Moved to Review!",
      desc: `Question ID #${currentQuestion.id} has been moved to the Wrong Questions list and queued in the Admin Audit Panel.`
    });
    setShowReportModal(false);
    setReportDetails('');
    
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize bookmarks
  useEffect(() => {
    const bMap: Record<number, boolean> = { ...(initialSessionState?.localBookmarks || {}) };
    savedBookmarks.forEach(b => {
      if (b && b.question && b.question.id !== undefined && b.quizId === quiz.testId) {
        bMap[b.question.id] = true;
      }
    });
    setLocalBookmarks(bMap);
  }, [savedBookmarks, quiz.testId]);

  const currentQuestion = (quiz?.questions || [])[currentIdx] || (quiz?.questions || [])[0];

  // Handle countdown timer & live per-question timing
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (mode === 'exam') {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
      }

      // Track elapsed seconds on the currently viewed question
      if (currentQuestion && currentQuestion.id !== undefined) {
        setQuestionTimeSpent(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1
        }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, currentQuestion?.id]);

  // Auto-persist active quiz session to localStorage whenever state changes
  useEffect(() => {
    if (!quiz || !quiz.testId) return;
    const sessionData = {
      quiz,
      mode,
      durationMinutes,
      currentIdx,
      userAnswers,
      visitedQuestions,
      localBookmarks,
      secondsLeft,
      activeSectionIdx,
      submittedSections,
      questionTimeSpent,
      lastUpdated: Date.now()
    };
    try {
      localStorage.setItem('dsssb_active_quiz_session', JSON.stringify(sessionData));
    } catch (_e) {
      // ignore storage errors
    }
  }, [quiz, mode, durationMinutes, currentIdx, userAnswers, visitedQuestions, localBookmarks, secondsLeft, activeSectionIdx, submittedSections, questionTimeSpent]);

  // Auto-register visit on mount or index change
  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
    }
  }, [currentIdx, currentQuestion?.id]);

  // Current Active Section info
  const activeSectionObj = sectionsList[activeSectionIdx] || sectionsList[0];
  const activeSectionIndices = activeSectionObj ? activeSectionObj.indices : [];

  const handleForceSubmit = () => {
    try {
      localStorage.removeItem('dsssb_active_quiz_session');
    } catch (_) {}
    const totalTimeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    onSubmit(userAnswers, Math.min(totalTimeSpent, durationMinutes * 60), localBookmarks, questionTimeSpent);
  };

  const handleSaveAndNext = () => {
    if (isSectionBasedMode) {
      const currentSecPos = activeSectionIndices.indexOf(currentIdx);
      if (currentSecPos >= 0 && currentSecPos < activeSectionIndices.length - 1) {
        setCurrentIdx(activeSectionIndices[currentSecPos + 1]);
      } else {
        // Last question in this section - prompt lock submission
        setShowSectionSubmitModal(true);
      }
    } else {
      if (currentIdx < (quiz?.questions || []).length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setShowSubmitWarning(true);
      }
    }
  };

  const isCurrentBookmarked = !!currentQuestion && (
    !!localBookmarks[currentQuestion.id] || savedBookmarks.some(b => 
      b && b.question && (
        (b.quizId === quiz.testId && b.question.id === currentQuestion.id) ||
        (b.question.question === currentQuestion.question)
      )
    )
  );

  const toggleBookmark = () => {
    const willBookmark = !isCurrentBookmarked;
    setLocalBookmarks(prev => {
      const copy = { ...prev };
      if (willBookmark) {
        copy[currentQuestion.id] = true;
      } else {
        delete copy[currentQuestion.id];
      }
      return copy;
    });
    onToggleGlobalBookmark(currentQuestion);
    triggerHaptic(15);
    setToastMessage(willBookmark ? "Question Bookmarked!" : "Bookmark Removed!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleMarkForReviewAndNext = () => {
    setLocalBookmarks(prev => ({
      ...prev,
      [currentQuestion.id]: true
    }));
    onToggleGlobalBookmark(currentQuestion);
    handleSaveAndNext();
  };

  const handleClearResponse = () => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
    setLocalBookmarks(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check state of question for palette coloring based on real CBT rules
  const getQuestionCbtState = (idx: number) => {
    const q = (quiz?.questions || [])[idx];
    if (!q) return 'not_visited';
    const isAnswered = userAnswers[q.id] !== undefined;
    const isMarked = localBookmarks[q.id] === true;
    const isVisited = visitedQuestions[q.id] === true;

    if (isAnswered && isMarked) return 'answered_marked'; // Answered & Marked for Review
    if (isMarked) return 'marked';                        // Marked for Review (Unanswered)
    if (isAnswered) return 'answered';                    // Answered
    if (isVisited) return 'not_answered';                  // Visited but Not Answered
    return 'not_visited';                                 // Not Visited
  };

  // State Counts for the entire test or active section
  const stats = useMemo(() => {
    const targetIndices = isSectionBasedMode ? activeSectionIndices : Array.from({ length: (quiz?.questions || []).length }, (_, i) => i);
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    targetIndices.forEach(idx => {
      const state = getQuestionCbtState(idx);
      if (state === 'answered_marked') answeredMarked++;
      else if (state === 'marked') marked++;
      else if (state === 'answered') answered++;
      else if (state === 'not_answered') notAnswered++;
      else notVisited++;
    });

    return { answered, notAnswered, marked, answeredMarked, notVisited };
  }, [userAnswers, localBookmarks, visitedQuestions, activeSectionIndices, isSectionBasedMode, quiz?.questions]);

  // DSSSB Section Lock Submit Handler
  const handleConfirmSectionSubmit = () => {
    setSubmittedSections(prev => ({ ...prev, [activeSectionIdx]: true }));
    setShowSectionSubmitModal(false);

    if (activeSectionIdx < sectionsList.length - 1) {
      const nextSecIdx = activeSectionIdx + 1;
      setActiveSectionIdx(nextSecIdx);
      const firstQOfNextSec = sectionsList[nextSecIdx].indices[0];
      setCurrentIdx(firstQOfNextSec);
    } else {
      // Final section submitted
      handleForceSubmit();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">No Questions Available</h3>
        <p className="text-xs text-slate-500 max-w-sm">There are no valid questions available for this test or topic.</p>
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
    <div className="fixed inset-0 z-[70] bg-[#f4f7f9] flex flex-col overflow-hidden select-none font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] max-w-md bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-slideDown flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-xs text-white">{toastMessage.title}</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* CBT TOP EXAM TITLE BAR */}
      <div className="bg-[#1e1e1e] text-white px-3 py-1.5 md:px-4 md:py-2 flex items-center justify-between text-xs font-semibold select-none shadow-md shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => setShowExitWarning(true)}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[9px] md:text-[10px] font-bold text-white uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3 md:w-3.5 md:h-3.5" /> Exit
          </button>
          <span className="text-[#ffff00] font-bold text-xs md:text-sm font-mono truncate">
            {quiz.title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const categoryToTabMap: Record<string, string> = {
                'part_a': 'part-a',
                'part_b': 'part-b',
                'full_mock': 'full-mocks',
                'booster': 'booster',
              };
              const tabParam = categoryToTabMap[quiz.category] || 'tgt-cs';
              const shareUrl = `${window.location.origin}/?tab=${tabParam}&testId=${encodeURIComponent(quiz.testId)}`;
              
              if (navigator.share) {
                navigator.share({
                  title: `Mock Test: ${quiz.title}`,
                  text: `🎯 Practice "${quiz.title}" (${quiz.questions?.length || 20} Qs) on BytePrep : CS!`,
                  url: shareUrl,
                }).catch(() => {
                  navigator.clipboard.writeText(shareUrl);
                  setToastMessage({ title: 'Link Copied', desc: '🔗 Direct mock test link copied to clipboard!' });
                  setTimeout(() => setToastMessage(null), 3500);
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
                setToastMessage({ title: 'Link Copied', desc: '🔗 Direct mock test link copied to clipboard!' });
                setTimeout(() => setToastMessage(null), 3500);
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 md:px-3 md:py-1 rounded text-[9px] md:text-[10px] uppercase flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            title="Share direct link to this mock test"
          >
            <Share2 className="w-3 h-3" /> <span className="hidden sm:inline">Share Link</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[9px] md:text-[10px] uppercase flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            title={isFullscreen ? "Exit Full Screen" : "Go Full Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 md:px-3 md:py-1 rounded text-[9px] md:text-[10px] uppercase flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Info className="w-3 h-3" /> <span className="hidden sm:inline">Instructions</span><span className="inline sm:hidden">Info</span>
          </button>
        </div>
      </div>

      {/* SECTIONS TABS NAVIGATION BAR */}
      <div className="bg-[#f1f1f1] border-b border-[#dddddd] py-0.5 md:py-1 px-3 md:px-4 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shadow-xs shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {sectionsList.map((sec, idx) => {
            const isSubmitted = submittedSections[idx] === true;
            const isActive = idx === activeSectionIdx;

            let tabStyle = "bg-[#e0e0e0] text-[#333333] hover:bg-[#d5d5d5]";
            if (isSubmitted) {
              tabStyle = "bg-[#2ca02c]/20 text-[#2ca02c] border-[#2ca02c]/30 font-bold cursor-not-allowed";
            } else if (isActive) {
              tabStyle = "bg-[#003366] text-white font-black shadow-sm border-[#002244]";
            }

            return (
              <button
                key={idx}
                disabled={isSectionBasedMode && idx !== activeSectionIdx}
                onClick={() => {
                  if (!isSectionBasedMode) {
                    setActiveSectionIdx(idx);
                    setCurrentIdx(sec.indices[0]);
                  }
                }}
                className={`relative flex items-center gap-1 px-2.5 py-1 md:px-4 md:py-2 rounded-t-lg border border-b-0 text-[10px] md:text-[11px] uppercase tracking-wide whitespace-nowrap transition-all font-semibold ${tabStyle}`}
              >
                <span>{sec.name}</span>
                <Info className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-60" />
                {isActive && (
                  <div className="absolute -bottom-[5px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#003366] hidden md:block" />
                )}
              </button>
            );
          })}
        </div>

        {/* TIME COUNTDOWN TIMER */}
        {mode === 'exam' && (
          <div className="flex items-center gap-1 md:gap-1.5 text-slate-800 text-xs md:text-sm font-black font-mono px-2 py-0.5 md:px-3 md:py-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
            <span className="text-slate-500 font-bold text-[10px] md:text-xs">Time Left:</span>
            <span className="text-red-600 animate-pulse">{formatTime(secondsLeft)}</span>
          </div>
        )}
      </div>

      {/* ACTIVE SUB-SECTION ROW */}
      <div className="bg-[#e2e8f0] px-3 py-1 md:px-6 md:py-1.5 flex items-center justify-between border-b border-slate-300 shrink-0">
        <div className="flex items-center min-w-0">
          <span className="text-[9px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest mr-2 shrink-0">Section:</span>
          <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-wide bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded truncate">
            {sectionsList[activeSectionIdx]?.name || 'General Mental Ability'}
          </span>
        </div>

        {/* Mobile Palette Button */}
        <button
          onClick={() => setShowMobilePalette(true)}
          className="lg:hidden flex items-center gap-1.5 bg-[#003366] hover:bg-[#002244] text-white font-extrabold text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Palette</span>
        </button>
      </div>

      {/* TWO-COLUMN CBT CORE WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: QUESTION AREA (75% WIDTH) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-white border-r border-[#dddddd]">
          
          {/* Question Meta Header Info & Live Pacing Widget */}
          <div className="bg-[#fcf8e3] text-[#8a6d3b] border-b border-[#faebcc] px-3 py-1.5 md:px-6 md:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] md:text-[11px] font-bold">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="uppercase tracking-wider">Type: Multiple Choice Question (MCQ)</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-700">Correct: <span className="underline">+1.0</span></span>
              <span className="text-red-700">Negative: <span className="underline">-0.25</span></span>
            </div>
            
            {/* Live Per-Question Timer & Pace Indicator */}
            {(() => {
              const currentQSeconds = questionTimeSpent[currentQuestion.id] || 0;
              const targetSecondsPerQ = Math.max(30, Math.round((durationMinutes * 60) / ((quiz.questions || []).length || 20)));
              const isIdeal = currentQSeconds <= targetSecondsPerQ;
              const isModerate = currentQSeconds <= targetSecondsPerQ * 1.6;

              return (
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] md:text-[11px] font-mono font-bold transition-all shadow-2xs ${
                  isIdeal
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isModerate
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                }`}>
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Q. Time: {Math.floor(currentQSeconds / 60)}:{(currentQSeconds % 60).toString().padStart(2, '0')}</span>
                  <span className="hidden sm:inline font-sans text-[9px] font-bold opacity-80">
                    ({isIdeal ? '⚡ Fast / Ideal' : isModerate ? '🎯 Normal Pace' : '⏳ Overtime'})
                  </span>
                </div>
              );
            })()}
          </div>

          {/* VIEW IN LANGUAGE SELECTOR BAR & BOOKMARK ACTION */}
          <div className="bg-[#4a90e2]/10 border-b border-[#4a90e2]/20 px-3 py-1.5 md:px-6 md:py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-red-600 hover:text-red-700 text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-colors px-2 py-1 rounded border border-red-200 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" /> Report
              </button>

              <button
                type="button"
                onClick={toggleBookmark}
                className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border transition-colors cursor-pointer ${
                  isCurrentBookmarked
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-amber-300'
                }`}
                title={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark this Question"}
                aria-label={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark this Question"}
              >
                <Star className={`w-3 h-3 ${isCurrentBookmarked ? 'fill-amber-400 text-amber-500' : 'text-slate-500'}`} />
                <span>{isCurrentBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs font-bold text-slate-600">View in:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi')}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] md:text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>

          {/* SCROLLABLE QUESTION TEXT & OPTIONS AREA */}
          <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6">
            
            {/* Question Title Header */}
            <div className="border-b border-slate-200 pb-2 md:pb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#003366] text-white text-[11px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Question {isSectionBasedMode ? activeSectionIndices.indexOf(currentIdx) + 1 : currentIdx + 1}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  of {isSectionBasedMode ? activeSectionIndices.length : (quiz?.questions || []).length}
                </span>
              </div>
              {currentQuestion.section && (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentQuestion.section}
                </span>
              )}
            </div>

            {/* Question Text Body (Standardized Testbook CBT Layout) */}
            <StandardizedQuestionView 
              question={
                language === 'Hindi' 
                  ? `[प्रश्न] ${currentQuestion.question}\n(कृपया ध्यान दें: हिंदी अनुवाद बीटा में है। अपनी सुविधानुसार अंग्रेजी माध्यम भी देखें।)` 
                  : currentQuestion.question
              }
              language={language}
            />

            {/* Options Render (Clean Testbook-style Stack) */}
            <div className="space-y-2.5 pt-2 max-w-3xl">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[currentQuestion.id] === idx;
                const isCorrect = currentQuestion.answer === idx;
                const isRevealed = revealedSolutions[currentQuestion.id] === true;

                let cardStyle = "border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 bg-white text-slate-800";
                let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";

                if (isSelected) {
                  cardStyle = "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500/30";
                  badgeStyle = "bg-blue-600 text-white border-blue-600 shadow-sm";
                }

                if (mode === 'practice' && isRevealed) {
                  if (isCorrect) {
                    cardStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/30";
                    badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                  } else if (isSelected) {
                    cardStyle = "border-rose-500 bg-rose-50/70 text-rose-950 ring-1 ring-rose-500/30";
                    badgeStyle = "bg-rose-600 text-white border-rose-600";
                  } else {
                    cardStyle = "border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed text-slate-500";
                    badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                  }
                }

                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 md:gap-3.5 p-3 md:p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none shadow-2xs ${cardStyle}`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      checked={isSelected}
                      disabled={mode === 'practice' && isRevealed}
                      onChange={() => {
                        const updatedAnswers = { ...userAnswers, [currentQuestion.id]: idx };
                        setUserAnswers(updatedAnswers);
                        if (mode === 'practice') {
                          setRevealedSolutions(prev => ({ ...prev, [currentQuestion.id]: true }));
                        }
                      }}
                      className="hidden"
                    />

                    {/* Option Letter Indicator */}
                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg border font-black text-xs flex items-center justify-center shrink-0 mt-0.5 transition-all uppercase ${badgeStyle}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>

                    {/* Option Text Content */}
                    <div className="flex-1 min-w-0 pt-0.5 text-xs md:text-sm font-medium leading-relaxed break-words">
                      <FormattedText text={cleanOptionText(option)} asParagraph={false} />
                    </div>

                    {mode === 'practice' && isRevealed && (
                      <div className="ml-auto shrink-0 mt-0.5">
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                      </div>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Practice Mode Solution Overlay */}
            {mode === 'practice' && revealedSolutions[currentQuestion.id] && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6 animate-fadeIn space-y-3 max-w-3xl">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <Eye className="w-4 h-4" />
                  <span className="font-bold text-xs tracking-wide">Detailed Solution</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Correct Answer: <strong className="text-emerald-700">{cleanOptionText(currentQuestion.options[currentQuestion.answer])}</strong>
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <StepByStepExplanation explanation={currentQuestion.explanation} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CANDIDATE INFO & PALETTE (25% WIDTH - Hidden on mobile, shown on larger screens) */}
        <div className="hidden lg:flex lg:w-80 bg-slate-50 border-l border-[#dddddd] flex-col justify-between overflow-y-auto shrink-0">
          
          <div className="divide-y divide-slate-200">
            {/* 1. Candidate Bio Block */}
            <div className="p-4 flex items-center gap-3.5 bg-white">
              {/* Custom SVG Candidate Photo Silhouette */}
              <div className="w-16 h-16 rounded-lg border border-slate-300 bg-[#e6f2ff] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                <svg className="w-12 h-12 text-[#99ccff]" fill="currentColor" viewBox="0 0 24 24">
                  {/* Standard silhouette head */}
                  <circle cx="12" cy="8" r="4" />
                  {/* Suit and Tie */}
                  <path d="M12 14c-3.5 0-6.5 2-7.5 5h15c-1-3-4-5-7.5-5zm-1 3.5l1 1 1-1v-2.5h-2v2.5z" />
                </svg>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Candidate</span>
                <h4 className="font-extrabold text-xs text-slate-800 truncate">{candidateName}</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-bold text-slate-500 font-mono">ID: 2026-EXAM</span>
                </div>
              </div>
            </div>

            {/* 2. Classic Response Legend / State Counter (Extremely iconic shape drawing!) */}
            <div className="p-4 bg-white space-y-3">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block pb-1 border-b border-slate-100">Response Status</span>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                {/* Answered - Green Pentagon */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 flex items-center justify-center text-white text-[11px] font-black bg-[#2ca02c] shadow-xs shrink-0"
                    style={{ clipPath: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)' }}
                  >
                    {stats.answered}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Answered</span>
                </div>

                {/* Not Answered - Orange Hexagon */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 flex items-center justify-center text-white text-[11px] font-black bg-[#d62728] shadow-xs shrink-0"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}
                  >
                    {stats.notAnswered}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Not Ans.</span>
                </div>

                {/* Not Visited - Gray Square */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center text-[#333] text-[11px] font-black bg-[#eee] border border-slate-300 rounded shrink-0">
                    {stats.notVisited}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Not Visited</span>
                </div>

                {/* Marked for Review - Purple Circle */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black bg-[#5f2d87] shrink-0">
                    {stats.marked}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Mark Review</span>
                </div>

                {/* Answered & Marked for Review - Purple with green badge */}
                <div className="flex items-center gap-2 col-span-2 border-t border-slate-100 pt-2 mt-1">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black bg-[#5f2d87]">
                      {stats.answeredMarked}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#2ca02c] border border-white flex items-center justify-center text-white text-[9px] font-black shadow">
                      ✓
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase leading-tight">Ans. & Marked (evaluated)</span>
                </div>
              </div>
            </div>

            {/* 3. Choose a Question Header & Palettes Grid */}
            <div className="bg-[#337ab7] text-white py-1.5 px-4 font-bold text-xs uppercase tracking-wider">
              Choose a Question:
            </div>

            {/* Grid display area */}
            <div className="p-4 bg-white flex-1 max-h-[320px] overflow-y-auto min-h-[160px]">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-2">
                {sectionsList[activeSectionIdx]?.name || 'Questions List'}
              </span>

              <div className="grid grid-cols-5 gap-2.5">
                {activeSectionIndices.map((qIdx, relativeIdx) => {
                  const state = getQuestionCbtState(qIdx);
                  const isCurrent = currentIdx === qIdx;
                  const label = relativeIdx + 1;

                  let shapeNode = null;

                  if (state === 'answered') {
                    shapeNode = (
                      <div 
                        className={`w-9 h-9 flex items-center justify-center text-white text-xs font-black bg-[#2ca02c] cursor-pointer transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                        style={{ clipPath: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)' }}
                        onClick={() => setCurrentIdx(qIdx)}
                      >
                        {label}
                      </div>
                    );
                  } else if (state === 'not_answered') {
                    shapeNode = (
                      <div 
                        className={`w-9 h-9 flex items-center justify-center text-white text-xs font-black bg-[#d62728] cursor-pointer transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}
                        onClick={() => setCurrentIdx(qIdx)}
                      >
                        {label}
                      </div>
                    );
                  } else if (state === 'marked') {
                    shapeNode = (
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black bg-[#5f2d87] cursor-pointer transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                        onClick={() => setCurrentIdx(qIdx)}
                      >
                        {label}
                      </div>
                    );
                  } else if (state === 'answered_marked') {
                    shapeNode = (
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => setCurrentIdx(qIdx)}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black bg-[#5f2d87] transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}>
                          {label}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#2ca02c] border border-white flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
                          ✓
                        </div>
                      </div>
                    );
                  } else {
                    // Not Visited
                    shapeNode = (
                      <div 
                        className={`w-9 h-9 flex items-center justify-center text-[#333] text-xs font-black bg-[#eee] border border-slate-300 rounded cursor-pointer hover:bg-slate-200 transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                        onClick={() => setCurrentIdx(qIdx)}
                      >
                        {label}
                      </div>
                    );
                  }

                  return (
                    <div key={qIdx} className="flex justify-center items-center">
                      {shapeNode}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Locked / Info Panel Footer in Sidebar */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 font-bold leading-normal">
            <span className="text-slate-700 uppercase tracking-widest block mb-1">Examination System</span>
            <span>Once lock-submitted, you cannot navigate back to locked sections under official examination rules.</span>
          </div>
        </div>
      </div>

      {/* MOBILE EXAM PALETTE SLIDE-OVER DRAWER */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobilePalette(false)}
          />
          
          {/* Slide-over panel container */}
          <div className="relative ml-auto flex h-full w-[290px] flex-col bg-white shadow-2xl animate-slideLeft">
            <div className="flex items-center justify-between bg-[#1e1e1e] text-white px-4 py-3 shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider">Exam Palette</span>
              <button 
                onClick={() => setShowMobilePalette(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
            
            {/* Main content of palette */}
            <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-slate-100">
              {/* Candidate Info */}
              <div className="p-4 flex items-center gap-3 bg-slate-50/50">
                <div className="w-12 h-12 rounded-lg border border-slate-300 bg-[#e6f2ff] flex items-center justify-center overflow-hidden shrink-0">
                  <svg className="w-8 h-8 text-[#99ccff]" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 14c-3.5 0-6.5 2-7.5 5h15c-1-3-4-5-7.5-5zm-1 3.5l1 1 1-1v-2.5h-2v2.5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Candidate</span>
                  <h4 className="font-extrabold text-xs text-slate-800 truncate">{candidateName}</h4>
                  <span className="text-[8px] font-bold text-slate-500 font-mono">ID: 2026-EXAM</span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="p-4 bg-white space-y-2.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block pb-1 border-b border-slate-100">Question Status</span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Answered */}
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-7 h-7 flex items-center justify-center text-white text-[10px] font-black bg-[#2ca02c] shrink-0"
                      style={{ clipPath: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)' }}
                    >
                      {stats.answered}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Ans</span>
                  </div>
                  {/* Not Answered */}
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-7 h-7 flex items-center justify-center text-white text-[10px] font-black bg-[#d62728] shrink-0"
                      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}
                    >
                      {stats.notAnswered}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Not Ans</span>
                  </div>
                  {/* Not Visited */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 flex items-center justify-center text-[#333] text-[10px] font-black bg-[#eee] border border-slate-300 rounded shrink-0">
                      {stats.notVisited}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Not Vis</span>
                  </div>
                  {/* Marked */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black bg-[#5f2d87] shrink-0">
                      {stats.marked}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Marked</span>
                  </div>
                </div>
              </div>

              {/* Grid palette */}
              <div className="bg-slate-50 flex-grow p-4 min-h-[200px]">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-2">
                  Select Question:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {activeSectionIndices.map((qIdx, relativeIdx) => {
                    const state = getQuestionCbtState(qIdx);
                    const isCurrent = currentIdx === qIdx;
                    const label = relativeIdx + 1;

                    let shapeNode = null;

                    if (state === 'answered') {
                      shapeNode = (
                        <div 
                          className={`w-8 h-8 flex items-center justify-center text-white text-xs font-black bg-[#2ca02c] cursor-pointer transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                          style={{ clipPath: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)' }}
                          onClick={() => {
                            setCurrentIdx(qIdx);
                            setShowMobilePalette(false);
                          }}
                        >
                          {label}
                        </div>
                      );
                    } else if (state === 'not_answered') {
                      shapeNode = (
                        <div 
                          className={`w-8 h-8 flex items-center justify-center text-white text-xs font-black bg-[#d62728] cursor-pointer transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%)' }}
                          onClick={() => {
                            setCurrentIdx(qIdx);
                            setShowMobilePalette(false);
                          }}
                        >
                          {label}
                        </div>
                      );
                    } else if (state === 'marked') {
                      shapeNode = (
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black bg-[#5f2d87] cursor-pointer transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                          onClick={() => {
                            setCurrentIdx(qIdx);
                            setShowMobilePalette(false);
                          }}
                        >
                          {label}
                        </div>
                      );
                    } else if (state === 'answered_marked') {
                      shapeNode = (
                        <div 
                          className="relative cursor-pointer"
                          onClick={() => {
                            setCurrentIdx(qIdx);
                            setShowMobilePalette(false);
                          }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black bg-[#5f2d87] transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}>
                            {label}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#2ca02c] border border-white flex items-center justify-center text-white text-[7px] font-bold shadow-sm">
                            ✓
                          </div>
                        </div>
                      );
                    } else {
                      shapeNode = (
                        <div 
                          className={`w-8 h-8 flex items-center justify-center text-[#333] text-xs font-black bg-[#eee] border border-slate-300 rounded cursor-pointer hover:bg-slate-200 transition-all ${isCurrent ? 'ring-2 ring-black ring-offset-1 scale-105' : ''}`}
                          onClick={() => {
                            setCurrentIdx(qIdx);
                            setShowMobilePalette(false);
                          }}
                        >
                          {label}
                        </div>
                      );
                    }

                    return (
                      <div key={qIdx} className="flex justify-center items-center">
                        {shapeNode}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS CONTROLS BAR (Stick to bottom of screen) */}
      <footer className="bg-slate-100 border-t border-slate-300 px-2.5 py-2 md:px-4 md:py-3 flex flex-row items-center justify-between gap-1 md:gap-3 z-30 shadow-md shrink-0 w-full select-none">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handleMarkForReviewAndNext}
            className="border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:bg-slate-50 font-black py-1.5 px-2 md:py-2 md:px-5 rounded-lg md:rounded text-[10px] md:text-[11px] uppercase transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="Mark for Review and Next"
          >
            <span className="hidden md:inline">Mark for Review &amp; Next</span>
            <span className="inline md:hidden">Review</span>
          </button>
          <button
            onClick={handleClearResponse}
            className="border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:bg-slate-50 font-black py-1.5 px-2 md:py-2 md:px-5 rounded-lg md:rounded text-[10px] md:text-[11px] uppercase transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title="Clear Response"
          >
            <span className="hidden md:inline">Clear Response</span>
            <span className="inline md:hidden">Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {mode === 'practice' && (
            <button
              onClick={() => {
                setRevealedSolutions(prev => ({
                  ...prev,
                  [currentQuestion.id]: !prev[currentQuestion.id]
                }));
              }}
              className="border-2 border-blue-400 hover:bg-blue-50 text-blue-700 font-black py-1.5 px-2 md:py-2 md:px-4 rounded-lg md:rounded text-[10px] md:text-[11px] uppercase transition-all flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
              title="View Solution"
            >
              <Eye className="w-3.5 h-3.5" /> 
              <span className="hidden md:inline">Solution</span>
              <span className="inline md:hidden">Sol</span>
            </button>
          )}

          <button
            onClick={handleSaveAndNext}
            className="bg-[#337ab7] hover:bg-[#286090] text-white font-black py-1.5 px-3 md:py-2.5 md:px-6 rounded-lg md:rounded text-[10px] md:text-[11px] uppercase transition-all shadow-sm cursor-pointer border border-[#2e6da4] whitespace-nowrap"
          >
            Save &amp; Next
          </button>

          {isSectionBasedMode ? (
            <button
              onClick={() => setShowSectionSubmitModal(true)}
              className="bg-[#5bc0de] hover:bg-[#31b0d5] text-slate-950 font-black py-1.5 px-3 md:py-2.5 md:px-6 rounded-lg md:rounded text-[10px] md:text-[11px] uppercase transition-all shadow-sm cursor-pointer border border-[#46b8da] whitespace-nowrap"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitWarning(true)}
              className="bg-[#269abc] hover:bg-[#31b0d5] text-white font-black py-1.5 px-3 md:py-2.5 md:px-6 rounded-lg md:rounded text-[10px] md:text-[11px] uppercase transition-all shadow-sm cursor-pointer border border-[#1b6d85] whitespace-nowrap"
            >
              Submit
            </button>
          )}
        </div>
      </footer>

      {/* GENERAL INSTRUCTIONS MODAL */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-scaleIn space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-[#003366] text-sm uppercase tracking-wider">Examination Instructions</h4>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-500 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">General Information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Total duration of the examination is set as per official paper pattern.</li>
                <li>The server clock will be set on the server, and the countdown timer on the top right displays time left.</li>
                <li>Every question carries 1.0 mark. Negative marking of 0.25 applies for wrong submissions.</li>
              </ul>

              <p className="font-bold text-slate-900">Navigating through Sections:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>According to examination regulations, once you submit a section (e.g. Mental Ability), it gets permanently locked.</li>
                <li>You cannot return to view or modify answers of a locked section under any circumstances.</li>
                <li>Ensure you have saved all desired answers before clicking "Submit Section".</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 px-5 rounded text-xs uppercase"
              >
                Close & Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DSSSB Section Lock Submit Confirmation Modal */}
      {showSectionSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h4 className="font-black text-slate-800 text-base">
                Submit Section: {sectionsList[activeSectionIdx]?.name}?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900">
                <strong>Online Exam Rules:</strong> Once you submit this section, it will be <strong>permanently locked</strong>. You will NOT be able to return to view or change answers in <em>{sectionsList[activeSectionIdx]?.name}</em>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Questions in this Section:</span>
                <span className="font-bold text-slate-800">{activeSectionIndices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Answered:</span>
                <span className="font-bold text-emerald-600">
                  {activeSectionIndices.filter(qIdx => (quiz?.questions || [])[qIdx] && userAnswers[(quiz?.questions || [])[qIdx].id] !== undefined).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Unattempted:</span>
                <span className="font-bold text-red-500">
                  {activeSectionIndices.filter(qIdx => (quiz?.questions || [])[qIdx] && userAnswers[(quiz?.questions || [])[qIdx].id] === undefined).length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSectionSubmitModal(false)}
                className="w-full border border-slate-200 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl text-xs transition-all text-slate-700 cursor-pointer"
              >
                Review Answers
              </button>
              <button
                onClick={handleConfirmSectionSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-100"
              >
                Lock & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                  <option value="Out of Syllabus">Out of Syllabus for DSSSB TGT CS</option>
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
                  <Send className="w-3.5 h-3.5" /> Send Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Exam Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-slate-800 text-base">Pause or Quit Mock Test?</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Your test progress (answers, time remaining, bookmarks) is saved automatically. You can resume this test anytime from your dashboard.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={onBack}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-200"
              >
                Save Progress & Go to Dashboard
              </button>
              <button
                onClick={() => {
                  if (onDiscardSession) {
                    onDiscardSession();
                  } else {
                    try { localStorage.removeItem('dsssb_active_quiz_session'); } catch (_) {}
                  }
                  onBack();
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer border border-red-200"
              >
                Discard Progress & Exit
              </button>
              <button
                onClick={() => setShowExitWarning(false)}
                className="w-full text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel & Continue Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleIn space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mx-auto">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-slate-800 text-base">Submit Entire Mock Test?</h4>
              <p className="text-xs text-slate-500 leading-normal">
                You have answered <strong>{Object.keys(userAnswers).length}</strong> out of <strong>{(quiz?.questions || []).length}</strong> questions. Are you ready to compile and view your performance analytics?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitWarning(false)}
                className="w-full border border-slate-200 hover:bg-slate-50 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all text-slate-700 cursor-pointer"
              >
                Keep Answering
              </button>
              <button
                onClick={handleForceSubmit}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-100"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
