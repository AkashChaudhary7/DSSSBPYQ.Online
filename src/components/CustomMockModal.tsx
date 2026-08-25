import React, { useState } from 'react';
import { X, Sparkles, Sliders, Clock, HelpCircle, BookOpen, Check, Play, Shuffle, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { Quiz, Question } from '../types';
import { loadActiveQuizQuestions } from '../lib/quizLoader';

interface CustomMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  allQuizzes: Quiz[];
  onStartCustomQuiz: (quiz: Quiz) => void;
}

export interface CustomSubjectOption {
  id: string;
  label: string;
  category: 'cs' | 'part_a' | 'all';
  keywords: string[];
  icon: string;
}

const SUBJECT_OPTIONS: CustomSubjectOption[] = [
  { id: 'all', label: 'All Subjects Combined (Full Mix)', category: 'all', keywords: [], icon: '⚡' },
  { id: 'cs_all', label: 'Computer Science (All Domain Topics)', category: 'cs', keywords: ['computer', 'tgt cs', 'part_b', 'dbms', 'operating system', 'network'], icon: '💻' },
  { id: 'dbms', label: 'DBMS & Database Management', category: 'cs', keywords: ['dbms', 'sql', 'database', 'normalization', 'er model'], icon: '🗄️' },
  { id: 'os', label: 'Operating Systems & Concurrency', category: 'cs', keywords: ['operating system', 'os', 'process', 'paging', 'deadlock', 'scheduling'], icon: '⚙️' },
  { id: 'cn', label: 'Computer Networks & Security', category: 'cs', keywords: ['network', 'cn', 'ip address', 'tcp', 'osi', 'subnet'], icon: '🌐' },
  { id: 'programming', label: 'Programming (Python & C++)', category: 'cs', keywords: ['python', 'c++', 'programming', 'oop', 'code'], icon: '🐍' },
  { id: 'ds', label: 'Data Structures & Algorithms', category: 'cs', keywords: ['data structure', 'algorithm', 'stack', 'tree', 'graph', 'sorting'], icon: '🌳' },
  { id: 'digital_logic', label: 'Digital Electronics & Logic Gates', category: 'cs', keywords: ['digital', 'logic', 'gate', 'boolean', 'multiplexer'], icon: '🔌' },
  { id: 'pedagogy', label: 'Teaching Methodology & CS Pedagogy', category: 'cs', keywords: ['pedagogy', 'teaching', 'methodology', 'education'], icon: '🎓' },
  { id: 'english', label: 'General English & Grammar', category: 'part_a', keywords: ['english', 'comprehension', 'synonym', 'grammar'], icon: '🇬🇧' },
  { id: 'hindi', label: 'General Hindi & Vyakaran (सामान्य हिंदी)', category: 'part_a', keywords: ['hindi', 'व्याकरण', 'भाषा', 'मुहावरे'], icon: '🇮🇳' },
  { id: 'maths', label: 'Quantitative Aptitude & Numerical Ability', category: 'part_a', keywords: ['math', 'arithmetic', 'numerical', 'percentage', 'ratio'], icon: '📐' },
  { id: 'reasoning', label: 'General Intelligence & Reasoning', category: 'part_a', keywords: ['reasoning', 'analogy', 'series', 'coding', 'intelligence'], icon: '🧠' },
  { id: 'ga', label: 'General Awareness & Current Affairs', category: 'part_a', keywords: ['awareness', 'general', 'current affairs', 'gk', 'history'], icon: '🌍' },
];

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50, 100];
const TIME_LIMIT_OPTIONS = [
  { value: 0, label: 'Auto (1 min/Q)' },
  { value: 10, label: '10 Mins' },
  { value: 15, label: '15 Mins' },
  { value: 20, label: '20 Mins' },
  { value: 30, label: '30 Mins' },
  { value: 60, label: '60 Mins' }
];

export default function CustomMockModal({
  isOpen,
  onClose,
  allQuizzes,
  onStartCustomQuiz
}: CustomMockModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [selectedTimeMinutes, setSelectedTimeMinutes] = useState<number>(0); // 0 = Auto
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedSubject = SUBJECT_OPTIONS.find(s => s.id === selectedSubjectId) || SUBJECT_OPTIONS[0];

  const handleGenerateAndStart = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);

      let matchingQuizzes: Quiz[] = [];

      if (selectedSubject.id === 'all') {
        matchingQuizzes = [...allQuizzes];
      } else if (selectedSubject.category === 'cs') {
        matchingQuizzes = allQuizzes.filter(q => 
          q.category === 'part_b' || 
          selectedSubject.keywords.some(kw => 
            (q.subject || '').toLowerCase().includes(kw) ||
            (q.topic || '').toLowerCase().includes(kw) ||
            (q.title || '').toLowerCase().includes(kw)
          )
        );
      } else if (selectedSubject.category === 'part_a') {
        matchingQuizzes = allQuizzes.filter(q => 
          q.category === 'part_a' || 
          selectedSubject.keywords.some(kw => 
            (q.subject || '').toLowerCase().includes(kw) ||
            (q.topic || '').toLowerCase().includes(kw) ||
            (q.title || '').toLowerCase().includes(kw)
          )
        );
      }

      if (matchingQuizzes.length === 0) {
        matchingQuizzes = [...allQuizzes];
      }

      // Shuffle candidate quizzes to get diverse random questions
      const shuffledQuizzes = [...matchingQuizzes].sort(() => Math.random() - 0.5);
      const candidatesToScan = shuffledQuizzes.slice(0, 15);

      const collectedQuestions: Question[] = [];
      const seenQuestionTexts = new Set<string>();

      for (const quizMeta of candidatesToScan) {
        if (collectedQuestions.length >= questionCount * 2) break;
        try {
          const fullQuiz = await loadActiveQuizQuestions(quizMeta);
          if (fullQuiz && fullQuiz.questions && fullQuiz.questions.length > 0) {
            for (const q of fullQuiz.questions) {
              if (!q || !q.question) continue;
              const qTextNorm = q.question.trim().toLowerCase();
              if (seenQuestionTexts.has(qTextNorm)) continue;

              // Filter question by subject keywords if applicable
              if (selectedSubject.id !== 'all' && selectedSubject.keywords.length > 0) {
                const qCombined = `${q.section || ''} ${q.question} ${quizMeta.subject || ''} ${quizMeta.topic || ''}`.toLowerCase();
                const matchesKeyword = selectedSubject.keywords.some(kw => qCombined.includes(kw));
                if (matchesKeyword) {
                  seenQuestionTexts.add(qTextNorm);
                  collectedQuestions.push(q);
                }
              } else {
                seenQuestionTexts.add(qTextNorm);
                collectedQuestions.push(q);
              }

              if (collectedQuestions.length >= questionCount * 2.5) break;
            }
          }
        } catch (_) {}
      }

      // Fallback: if keyword filtering produced too few questions, fill from candidate quizzes
      if (collectedQuestions.length < Math.min(questionCount, 5)) {
        for (const quizMeta of candidatesToScan) {
          if (collectedQuestions.length >= questionCount) break;
          try {
            const fullQuiz = await loadActiveQuizQuestions(quizMeta);
            if (fullQuiz?.questions) {
              for (const q of fullQuiz.questions) {
                if (!q || !q.question) continue;
                const qTextNorm = q.question.trim().toLowerCase();
                if (!seenQuestionTexts.has(qTextNorm)) {
                  seenQuestionTexts.add(qTextNorm);
                  collectedQuestions.push(q);
                }
                if (collectedQuestions.length >= questionCount) break;
              }
            }
          } catch (_) {}
        }
      }

      if (collectedQuestions.length === 0) {
        setErrorMsg('Unable to load questions for the selected subject. Please pick another subject or select All Combined.');
        setIsGenerating(false);
        return;
      }

      // Shuffle collected questions randomly
      const finalQuestionsPool = [...collectedQuestions].sort(() => Math.random() - 0.5);
      const finalSelectedQuestions = finalQuestionsPool.slice(0, questionCount).map((q, idx) => ({
        ...q,
        id: idx + 1,
        section: q.section || selectedSubject.label
      }));

      // Calculate time limit
      const calculatedTimeMinutes = selectedTimeMinutes > 0 
        ? selectedTimeMinutes 
        : Math.max(5, Math.ceil(finalSelectedQuestions.length * 1.0));

      const customQuiz: Quiz = {
        testId: `custom_${selectedSubject.id}_${Date.now()}`,
        title: `Custom Practice: ${selectedSubject.label}`,
        totalTimeMinutes: calculatedTimeMinutes,
        markingScheme: { correct: 1, negative: 0.25 },
        questions: finalSelectedQuestions,
        category: selectedSubject.category === 'part_a' ? 'part_a' : 'part_b',
        subject: selectedSubject.label,
        topic: selectedSubject.label,
        qCount: finalSelectedQuestions.length,
        testType: 'mock'
      };

      onStartCustomQuiz(customQuiz);
      onClose();
    } catch (err) {
      console.error('Failed to create custom mock:', err);
      setErrorMsg('An unexpected error occurred while building the custom mock. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Custom Practice Mock Builder
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  QUICK MOCK
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                Pick subject, customize questions &amp; time, and start practicing instantly!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Subject / Topic Picker */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                1. Select Subject / Topic
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Sourced randomly</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-2xl scrollbar-thin">
              {SUBJECT_OPTIONS.map(subj => {
                const isSelected = selectedSubjectId === subj.id;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base shrink-0">{subj.icon}</span>
                    <span className="truncate flex-1">{subj.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Question Count Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              2. Number of Questions
            </label>
            <div className="grid grid-cols-5 gap-2">
              {QUESTION_COUNT_OPTIONS.map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border text-center ${
                    questionCount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>

          {/* 3. Time Limit Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              3. Set Timer Limit
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TIME_LIMIT_OPTIONS.map(tOpt => (
                <button
                  key={tOpt.value}
                  type="button"
                  onClick={() => setSelectedTimeMinutes(tOpt.value)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border text-center ${
                    selectedTimeMinutes === tOpt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Summary Badge */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-semibold">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>{questionCount} Questions</strong> from <strong>{selectedSubject.label}</strong>
              </span>
            </div>
            <span className="px-2 py-0.5 bg-indigo-200/70 dark:bg-indigo-900 rounded-md font-bold text-[11px]">
              ⏱️ {selectedTimeMinutes > 0 ? `${selectedTimeMinutes} Mins` : `~${questionCount} Mins`}
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerateAndStart}
            disabled={isGenerating}
            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-75"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gathering Questions...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Practice Test Now</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
