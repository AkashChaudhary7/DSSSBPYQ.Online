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
  Zap
} from 'lucide-react';

// ALL DSSSB EXAMS DATA
import { DSSSB_EXAMS, ExamInfo, SyllabusSection, SyllabusItem } from '../data/dsssbExams';
import AdBanner from './AdBanner';
import { VirtualizedTopicGrid, VirtualizedTopicList } from './VirtualizedTopicGrid';

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
  onNavigateToView?: (view: 'part-a-view' | 'part-b-view' | 'adaptive-path' | 'dashboard' | 'syllabus', topicContext?: string) => void;
  onSelectExamSlug?: (slug: string | null) => void;
  onShareAchievement?: () => void;
}

export default function SyllabusTracker({ 
  initialExamSlug, 
  onNavigateToView,
  onSelectExamSlug,
  onShareAchievement
}: SyllabusTrackerProps) {
  const [selectedExamSlug, setSelectedExamSlug] = useState<string | null>(initialExamSlug || null);
  const [searchExamQuery, setSearchExamQuery] = useState('');

  // Keep internal state synchronized if prop changes
  useEffect(() => {
    if (initialExamSlug !== undefined) {
      setSelectedExamSlug(initialExamSlug);
    }
  }, [initialExamSlug]);

  // Current Exam Object
  const currentExam = useMemo(() => {
    if (!selectedExamSlug) return null;
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
    // Update window history URL bar gracefully
    if (typeof window !== 'undefined') {
      const targetPath = slug ? `/syllabus/${slug}` : '/syllabus';
      window.history.pushState({ activeView: 'syllabus', examSlug: slug }, '', targetPath);
    }
  };

  // Toggle individual item
  const toggleItem = (id: string) => {
    setCheckedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  // Filtered topics for active exam
  const filteredSections = useMemo(() => {
    if (!currentExam) return [];

    return currentExam.sections.map(sec => {
      // Check section filter category
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

  // Share summary handler with robust clipboard fallback
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
        }).catch(() => fallbackCopyTextToClipboard(text));
      } else {
        fallbackCopyTextToClipboard(text);
      }
    } catch (_) {
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  // Filtered Exams for Selection Hub
  const filteredExamsList = useMemo(() => {
    return DSSSB_EXAMS.filter(exam => {
      const q = searchExamQuery.toLowerCase().trim();
      return q === '' || 
        exam.title.toLowerCase().includes(q) ||
        exam.postCode.toLowerCase().includes(q) ||
        exam.department.toLowerCase().includes(q) ||
        exam.overview.toLowerCase().includes(q);
    });
  }, [searchExamQuery]);

  // SCENARIO 1: EXAM SELECTION HUB PAGE (WHEN NO SPECIFIC EXAM IS OPEN)
  if (!selectedExamSlug || !currentExam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
        {/* Main Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 text-center md:text-left max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> DSSSB Official Exam Portal
              </span>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[11px] font-semibold px-3 py-1 rounded-md">
                2026 Updated Pattern
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              <span className="hidden sm:inline">DSSSB Exam <span className="text-amber-400">Syllabus Tracker Hub</span></span>
              <span className="sm:hidden"><span className="text-amber-400">Syllabus Tracker</span></span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Select your specific Delhi Subordinate Services Selection Board (DSSSB) recruitment exam to view detailed subject-wise topic checklists, official weightages, and real-time progress tracking.
            </p>
          </div>
        </div>

        {/* Search & Exam Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Search DSSSB Exam or Post Code (e.g. TGT Computer Science, 804/24, LDC)..."
              value={searchExamQuery}
              onChange={(e) => setSearchExamQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 shrink-0">
            Showing <span className="text-indigo-600 font-extrabold">{filteredExamsList.length}</span> Official DSSSB Syllabus Trackers
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExamsList.map((exam) => (
            <div 
              key={exam.slug}
              onClick={() => handleExamClick(exam.slug)}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                {/* Header Banner */}
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-slate-900 text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    {exam.postCode}
                  </span>

                  {exam.badge && (
                    <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-1 rounded-lg">
                      {exam.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {exam.department}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {exam.overview}
                </p>

                {/* Exam Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Marks</p>
                      <p className="text-xs font-black text-slate-800">{exam.totalMarks.split(' ')[0]} Marks</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Duration</p>
                      <p className="text-xs font-black text-slate-800">{exam.duration.split(' ')[0]} Mins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <span>View Full Syllabus Checklist</span>
                <span className="text-sm">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Guidance Section */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 rounded-3xl p-6 sm:p-8 border border-blue-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Why use the DSSSBPYQ.Online Syllabus Tracker?</h3>
              <p className="text-xs text-slate-600">
                DSSSB examinations enforce strict negative marking (0.25 marks penalty) and mandatory section-wise qualifying criteria. Tracking every module systematically prevents last-minute preparation gaps.
              </p>
            </div>
          </div>
        </div>

        <AdBanner location="syllabus_tracker_landing_bottom" />
      </div>
    );
  }

  // SCENARIO 2: DETAILED SPECIFIC EXAM SYLLABUS TRACKER VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => handleExamClick(null)}
          className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold px-4 py-2.5 rounded-2xl text-xs border border-slate-200 shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          <span>Back to All DSSSB Exams</span>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Selected Exam:</span>
          <span className="bg-slate-900 text-amber-400 font-black text-xs px-3 py-1 rounded-xl">
            {currentExam.title}
          </span>
        </div>
      </div>

      {/* Main Exam Header */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40 ${currentExam.bgGradient}`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> {currentExam.postCode}
              </span>
              <span className="bg-white/20 text-white border border-white/20 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                {currentExam.totalMarks} | {currentExam.duration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {currentExam.title} <span className="text-amber-400">Syllabus Tracker</span>
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {currentExam.overview}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between shrink-0 min-w-[260px] space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Completion Progress
              </span>
              <span className="text-2xl font-black text-amber-400">{overallProgressPercent}%</span>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-3.5 p-0.5 border border-slate-700/50 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>{completedCount} of {totalItemsCount} Topics Checked</span>
              <button 
                onClick={handleReset}
                className="text-rose-300 hover:text-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset Progress"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder={`Search ${currentExam.title} topics...`}
              value={searchTopicQuery}
              onChange={(e) => setSearchTopicQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={onShareAchievement || handleCopySummary}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedNotification ? 'Copied Progress!' : 'Share Achievement Card'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Checklist</span>
            </button>
          </div>
        </div>

        {/* Category & Weightage Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Sections (Part A + B)
          </button>

          <button
            onClick={() => setSelectedCategory('Part A')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'Part A' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
            }`}
          >
            Part A Only (General Paper)
          </button>

          <button
            onClick={() => setSelectedCategory('Part B')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'Part B' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60'
            }`}
          >
            Part B Only (Subject Domain)
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {currentExam.sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setSelectedCategory(sec.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === sec.id 
                  ? 'bg-slate-800 text-amber-300 shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {sec.title}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {['All', 'Core', 'High', 'Medium'].map(imp => (
            <button
              key={imp}
              onClick={() => setImportanceFilter(imp)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                importanceFilter === imp 
                  ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {imp === 'All' ? 'All Priority' : `${imp} Weightage`}
            </button>
          ))}
        </div>
      </div>

      {/* 32 DOE Computer Science Modules Circular Progress Grid */}
      {currentExam.sections.some(s => s.id === 'part_b_doe_cs') && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-2 border-indigo-500/40 rounded-3xl p-5 md:p-6 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/50 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  DOE 2026 Prescribed
                </span>
                <span className="text-xs text-indigo-200 font-bold">32 Modules Progress Dashboard</span>
              </div>
              <h2 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <span>32 Computer Science Modules Progress Rings</span>
              </h2>
            </div>

            <div className="flex items-center gap-3 bg-indigo-900/60 border border-indigo-700/60 px-3 py-1.5 rounded-2xl shrink-0">
              <CircularProgressRing 
                percentage={
                  Math.round(
                    (currentExam.sections.find(s => s.id === 'part_b_doe_cs')?.items.filter(i => !!checkedIds[i.id]).length || 0) / 32 * 100
                  )
                } 
                size={36} 
                strokeWidth={3.5} 
              />
              <div className="text-left">
                <p className="text-[10px] text-indigo-300 font-bold uppercase">CS Coverage</p>
                <p className="text-xs font-black text-amber-300">
                  {currentExam.sections.find(s => s.id === 'part_b_doe_cs')?.items.filter(i => !!checkedIds[i.id]).length || 0} / 32 Done
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Interactive virtualized progress rings for each of the 32 Computer Science syllabus modules. Tap any module ring to toggle completion or jump to details.
          </p>

          <VirtualizedTopicGrid 
            items={currentExam.sections.find(s => s.id === 'part_b_doe_cs')?.items || []}
            checkedIds={checkedIds}
            onToggle={toggleItem}
          />
        </div>
      )}

      {/* Accordion Sections & Checklists */}
      <div className="space-y-6">
        {filteredSections.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <ListTodo className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">No topics found matching filter</h3>
            <button 
              onClick={() => {
                setSearchTopicQuery('');
                setSelectedCategory('All');
                setImportanceFilter('All');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          filteredSections.map(section => {
            const isCollapsed = !!collapsedSections[section.id];
            const secCompleted = section.items.filter(i => !!checkedIds[i.id]).length;
            const secTotal = section.items.length;
            const isSecDone = secCompleted === secTotal;
            const secPercent = secTotal > 0 ? Math.round((secCompleted / secTotal) * 100) : 0;

            return (
              <div 
                key={section.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSectionCollapse(section.id)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                    >
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>

                    {/* Section Circular Progress Ring */}
                    <CircularProgressRing 
                      percentage={secPercent} 
                      size={36} 
                      strokeWidth={3.5} 
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                          {section.category}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          ({secCompleted}/{secTotal} Done • {secPercent}%)
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {!isSecDone ? (
                      <button
                        onClick={() => toggleAllInSection(section.items, true)}
                        className="text-[11px] font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Section Done
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleAllInSection(section.items, false)}
                        className="text-[11px] font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Unmark Section
                      </button>
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <VirtualizedTopicList 
                    items={section.items}
                    checkedIds={checkedIds}
                    onToggle={toggleItem}
                    onNavigateToView={onNavigateToView}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <AdBanner location="syllabus_tracker_detail_bottom" />
    </div>
  );
}
