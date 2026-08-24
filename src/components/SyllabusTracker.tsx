import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Download, 
  Share2, 
  Filter, 
  Cpu, 
  GraduationCap, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  BarChart3,
  ListTodo,
  ArrowLeft,
  Users,
  ShieldCheck,
  Check,
  Building,
  Target,
  Clock,
  Zap,
  Coins
} from 'lucide-react';

// ALL DSSSB EXAMS DATA (Strictly TGT CS and PGT CS)
import { DSSSB_EXAMS, ExamInfo, SyllabusSection, SyllabusItem } from '../data/dsssbExams';
import { rewardSyllabusTopicCompletion } from '../lib/rewardsSystem';
import { SyllabusStatsPredictor } from './SyllabusStatsPredictor';
import { Attempt, Quiz } from '../types';
import AdBanner from './AdBanner';

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  activeColor?: string;
  className?: string;
}

export function CircularProgressRing({ 
  percentage, 
  size = 32, 
  strokeWidth = 3,
  showText = true,
  activeColor,
  className = ''
}: CircularProgressRingProps) {
  const radius = Math.max(1, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  let strokeColor = activeColor || '#6366f1'; // indigo-500
  if (percentage === 100) strokeColor = '#10b981'; // emerald-500
  else if (percentage > 0 && !activeColor) strokeColor = '#3b82f6'; // blue-500

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          className="dark:stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showText && (
        <span className={`absolute text-[9px] font-black tracking-tighter ${
          percentage === 100 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : percentage > 0 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-400 dark:text-slate-500'
        }`}>
          {percentage === 100 ? '✓' : `${Math.round(percentage)}%`}
        </span>
      )}
    </div>
  );
}

interface SyllabusTrackerProps {
  initialExamSlug?: string | null;
  quizzes?: Quiz[];
  pastAttempts?: Attempt[];
  onNavigateToView?: (view: 'part-a-view' | 'part-b-view' | 'adaptive-path' | 'dashboard' | 'syllabus', topicContext?: string) => void;
  onSelectExamSlug?: (slug: string | null) => void;
  onShareAchievement?: () => void;
  onSelectSubject?: (subjectId: string) => void;
}

export default function SyllabusTracker({ 
  initialExamSlug, 
  quizzes = [],
  pastAttempts = [],
  onNavigateToView,
  onSelectExamSlug,
  onShareAchievement,
  onSelectSubject
}: SyllabusTrackerProps) {
  const [selectedExamSlug, setSelectedExamSlug] = useState<string | null>(initialExamSlug || 'tgt-computer-science');
  const [searchExamQuery, setSearchExamQuery] = useState('');
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Keep internal state synchronized if prop changes
  useEffect(() => {
    if (initialExamSlug !== undefined && initialExamSlug !== null) {
      setSelectedExamSlug(initialExamSlug);
    }
  }, [initialExamSlug]);

  // Current Exam Object
  const currentExam = useMemo(() => {
    if (!selectedExamSlug) return DSSSB_EXAMS[0];
    return DSSSB_EXAMS.find(e => e.slug === selectedExamSlug) || DSSSB_EXAMS[0];
  }, [selectedExamSlug]);

  // Local storage key for checked items per exam
  const storageKey = useMemo(() => {
    return currentExam ? `dsssb_syllabus_${currentExam.slug}_checked_v1` : 'dsssb_syllabus_general_v1';
  }, [currentExam]);

  // Load initial checked items from LocalStorage
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Re-load checked items when selected exam changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCheckedIds(saved ? JSON.parse(saved) : {});
    } catch (_) {
      setCheckedIds({});
    }
  }, [storageKey]);

  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [importanceFilter, setImportanceFilter] = useState<string>('All');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedIds));
    } catch (_) {}
  }, [checkedIds, storageKey]);

  // Handle switching selected exam
  const handleExamClick = (slug: string | null) => {
    setSelectedExamSlug(slug);
    if (onSelectExamSlug) {
      onSelectExamSlug(slug);
    }
    if (typeof window !== 'undefined') {
      const targetPath = slug ? `/syllabus/${slug}` : '/syllabus';
      window.history.pushState({ activeView: 'syllabus', examSlug: slug }, '', targetPath);
    }
  };

  // Toggle individual item + reward +10 coins on checking
  const toggleItem = (id: string, title: string) => {
    const isNowChecked = !checkedIds[id];
    setCheckedIds(prev => ({
      ...prev,
      [id]: isNowChecked
    }));

    if (isNowChecked) {
      const awarded = rewardSyllabusTopicCompletion(id, title);
      if (awarded) {
        setRewardToast(`+10 Coins Earned! 🪙 Mastered: ${title}`);
        setTimeout(() => setRewardToast(null), 3000);
      }
    }
  };

  // Toggle section collapse
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Bulk toggle
  const toggleAllInSection = (items: SyllabusItem[], targetStatus: boolean) => {
    setCheckedIds(prev => {
      const next = { ...prev };
      items.forEach(item => {
        next[item.id] = targetStatus;
        if (targetStatus) {
          rewardSyllabusTopicCompletion(item.id, item.title);
        }
      });
      return next;
    });
  };

  // Reset progress
  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset your checklist progress for ${currentExam?.title}?`)) {
      setCheckedIds({});
    }
  };

  // Calculate stats for selected exam
  const allExamItems = useMemo(() => {
    if (!currentExam) return [];
    return currentExam.sections.flatMap(sec => sec.items);
  }, [currentExam]);

  const totalItemsCount = allExamItems.length;

  const completedCount = useMemo(() => {
    return allExamItems.filter(item => !!checkedIds[item.id]).length;
  }, [allExamItems, checkedIds]);

  const overallProgressPercent = totalItemsCount > 0 
    ? Math.round((completedCount / totalItemsCount) * 100) 
    : 0;

  const completedSyllabusSet = useMemo(() => {
    return new Set(Object.keys(checkedIds).filter(k => checkedIds[k]));
  }, [checkedIds]);

  // Filtered topics for active exam
  const filteredSections = useMemo(() => {
    if (!currentExam) return [];

    return currentExam.sections.map(sec => {
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Part A' && sec.category !== 'Part A') return null;
        if (selectedCategory === 'Part B' && sec.category !== 'Part B') return null;
        if (selectedCategory !== 'Part A' && selectedCategory !== 'Part B' && sec.id !== selectedCategory && sec.category !== selectedCategory) return null;
      }

      const matchingItems = sec.items.filter(item => {
        const matchSearch = searchTopicQuery.trim() === '' || 
          item.title.toLowerCase().includes(searchTopicQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTopicQuery.toLowerCase())) ||
          (item.code && item.code.toLowerCase().includes(searchTopicQuery.toLowerCase()));

        const matchImportance = importanceFilter === 'All' || item.importance === importanceFilter;

        return matchSearch && matchImportance;
      });

      if (matchingItems.length === 0) return null;

      return {
        ...sec,
        items: matchingItems
      };
    }).filter(Boolean) as SyllabusSection[];
  }, [currentExam, searchTopicQuery, selectedCategory, importanceFilter]);

  // Share summary handler
  const handleCopySummary = () => {
    if (!currentExam) return;
    const text = `📊 *My ${currentExam.title} Syllabus Progress*\n` +
      `-------------------------------------------\n` +
      `📌 ${currentExam.postCode}\n` +
      `✅ Completed: ${completedCount} / ${totalItemsCount} Topics (${overallProgressPercent}%)\n` +
      `🎯 Department: ${currentExam.department}\n` +
      `📝 Pattern: ${currentExam.totalMarks} | ${currentExam.duration}\n\n` +
      `Track your official 2026 DSSSB syllabus free at: https://dsssbpyq.online/syllabus/${currentExam.slug}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 3000);
        });
      }
    } catch (_) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Toast Notification for Coin Reward */}
      {rewardToast && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{rewardToast}</span>
        </div>
      )}

      {/* Top Exam Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Syllabus Exam:</span>
          <div className="flex items-center gap-1.5">
            {DSSSB_EXAMS.map(exam => (
              <button
                key={exam.slug}
                onClick={() => handleExamClick(exam.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentExam.slug === exam.slug
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {exam.slug === 'tgt-computer-science' ? 'TGT CS (41/26)' : 'PGT CS (102/26)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            🪙 +10 Coins per Topic Completed
          </span>
        </div>
      </div>

      {/* SYLLABUS STATS & PREDICTIVE SCORE ENGINE */}
      <SyllabusStatsPredictor 
        completedSyllabusIds={completedSyllabusSet}
        pastAttempts={pastAttempts}
        quizzes={quizzes}
        onStartRecommendedQuiz={(subjName) => {
          if (onSelectSubject) {
            const lower = subjName.toLowerCase();
            if (lower.includes('math')) onSelectSubject('maths');
            else if (lower.includes('reason')) onSelectSubject('reasoning');
            else if (lower.includes('gk') || lower.includes('awareness')) onSelectSubject('gk');
            else if (lower.includes('english')) onSelectSubject('english');
            else if (lower.includes('hindi')) onSelectSubject('hindi');
            else onSelectSubject('os');
          }
        }}
      />
    </div>
  );
}
