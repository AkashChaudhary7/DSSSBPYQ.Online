import React, { useMemo } from 'react';
import { Attempt, Quiz } from '../types';
import { PART_A_SECTIONS, DSSSB_EXAMS } from '../data/dsssbExams';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Zap, 
  Award,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  ArrowUpRight
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';
import { CircularProgressRing } from './SyllabusTracker';

interface SyllabusStatsPredictorProps {
  completedSyllabusIds: Set<string>;
  pastAttempts: Attempt[];
  quizzes: Quiz[];
  onOpenSyllabusTracker?: () => void;
  onStartRecommendedQuiz?: (subjectOrTopic: string) => void;
}

interface SubjectPerformanceStat {
  id: string;
  name: string;
  category: 'Part A' | 'Part B';
  totalTopics: number;
  completedTopics: number;
  completionRate: number; // 0 - 100
  attemptCount: number;
  avgAccuracy: number; // 0 - 100
  weightMarks: number; // Total max marks in actual exam
  predictedScore: number; // out of weightMarks
  status: 'Mastered' | 'On Track' | 'Needs Practice' | 'Not Started';
}

export const SyllabusStatsPredictor: React.FC<SyllabusStatsPredictorProps> = ({
  completedSyllabusIds,
  pastAttempts,
  quizzes,
  onOpenSyllabusTracker,
  onStartRecommendedQuiz
}) => {
  // 1. Calculate stats per subject
  const subjectStats: SubjectPerformanceStat[] = useMemo(() => {
    const tgtExam = DSSSB_EXAMS.find(e => e.slug === 'tgt-computer-science') || DSSSB_EXAMS[0];

    // Build subject definition list
    const subjectsMeta = [
      { id: 'part_a_math', name: 'Arithmetical Ability (Maths)', category: 'Part A' as const, weightMarks: 20, matchTerms: ['math', 'arithmetic', 'quant', 'numerical'] },
      { id: 'part_a_reasoning', name: 'Reasoning & Intelligence', category: 'Part A' as const, weightMarks: 20, matchTerms: ['reasoning', 'intelligence', 'logical'] },
      { id: 'part_a_gk', name: 'General Awareness & Delhi GK', category: 'Part A' as const, weightMarks: 20, matchTerms: ['gk', 'general awareness', 'polity', 'delhi'] },
      { id: 'part_a_english', name: 'General English Language', category: 'Part A' as const, weightMarks: 20, matchTerms: ['english', 'comprehension', 'grammar'] },
      { id: 'part_a_hindi', name: 'General Hindi Language', category: 'Part A' as const, weightMarks: 20, matchTerms: ['hindi', 'हिंदी', 'vyakaran'] },
      { id: 'part_b_doe_cs', name: 'Computer Science (32 Modules)', category: 'Part B' as const, weightMarks: 80, matchTerms: ['computer', 'cs', 'os', 'dbms', 'cn', 'dsa', 'coa', 'programming'] },
      { id: 'part_b_pedagogy', name: 'Teaching Methodology / CDP', category: 'Part B' as const, weightMarks: 20, matchTerms: ['teaching methodology', 'pedagogy', 'cdp'] }
    ];

    return subjectsMeta.map(subj => {
      // Find all syllabus items for this section in the exam data
      const section = tgtExam.sections.find(s => s.id === subj.id);
      const totalTopics = section ? section.items.length : 1;
      const completedTopics = section 
        ? section.items.filter(item => completedSyllabusIds?.has ? completedSyllabusIds.has(item.id) : false).length 
        : 0;
      const completionRate = Math.round((completedTopics / Math.max(1, totalTopics)) * 100);

      // Find attempts relevant to this subject
      const relevantAttempts = pastAttempts.filter(att => {
        const titleLower = (att.quizTitle || '').toLowerCase();
        const testIdLower = (att.testId || '').toLowerCase();
        return subj.matchTerms.some(term => titleLower.includes(term) || testIdLower.includes(term));
      });

      let avgAccuracy = 0;
      if (relevantAttempts.length > 0) {
        const totalPct = relevantAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
        avgAccuracy = Math.round(totalPct / relevantAttempts.length);
      } else {
        // Fallback accuracy baseline if user hasn't attempted yet, influenced by completion rate
        avgAccuracy = completionRate > 0 ? Math.min(80, Math.round(35 + completionRate * 0.45)) : 0;
      }

      // Predicted Score formula:
      // Combines mock accuracy (60% weight) and syllabus completion (40% weight)
      // When accuracy is available, blended = (avgAccuracy * 0.65 + completionRate * 0.35)
      const blendedSkillFactor = relevantAttempts.length > 0
        ? (avgAccuracy * 0.70 + completionRate * 0.30) / 100
        : (completionRate > 0 ? (completionRate * 0.75) / 100 : 0.20); // Baseline baseline
      
      const predictedScore = Math.min(subj.weightMarks, Math.round(blendedSkillFactor * subj.weightMarks * 10) / 10);

      let status: SubjectPerformanceStat['status'] = 'Not Started';
      if (completionRate >= 80 && avgAccuracy >= 75) status = 'Mastered';
      else if (completionRate >= 40 || avgAccuracy >= 60) status = 'On Track';
      else if (completedTopics > 0 || relevantAttempts.length > 0) status = 'Needs Practice';

      return {
        id: subj.id,
        name: subj.name,
        category: subj.category,
        totalTopics,
        completedTopics,
        completionRate,
        attemptCount: relevantAttempts.length,
        avgAccuracy,
        weightMarks: subj.weightMarks,
        predictedScore,
        status
      };
    });
  }, [completedSyllabusIds, pastAttempts]);

  // Overall Exam Prediction Calculations (Out of 200)
  const partAStats = subjectStats.filter(s => s.category === 'Part A');
  const partBStats = subjectStats.filter(s => s.category === 'Part B');

  const partAPredicted = Math.round(partAStats.reduce((sum, s) => sum + s.predictedScore, 0));
  const partBPredicted = Math.round(partBStats.reduce((sum, s) => sum + s.predictedScore, 0));
  const totalPredictedScore = partAPredicted + partBPredicted;
  const totalMarks = 200;
  const predictedPercentage = Math.round((totalPredictedScore / totalMarks) * 100);

  // Overall Syllabus Completion
  const totalSyllabusTopics = subjectStats.reduce((sum, s) => sum + s.totalTopics, 0);
  const totalCompletedTopics = subjectStats.reduce((sum, s) => sum + s.completedTopics, 0);
  const overallSyllabusPercentage = Math.round((totalCompletedTopics / Math.max(1, totalSyllabusTopics)) * 100);

  // Readiness Band
  const getReadinessLevel = (score: number) => {
    if (score >= 145) return { label: 'Top Rank / Safe Selection Zone (145+)', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300', advice: 'Outstanding! Maintain your daily revision and focus on time management in 100-mark full tests.' };
    if (score >= 120) return { label: 'Competitive Zone (120 - 144)', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300', advice: 'Very solid preparation. Push your high-weightage CS topics and Reasoning to touch 140+.' };
    if (score >= 90) return { label: 'Qualifying Benchmark (90 - 119)', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300', advice: 'You are near qualifying cutoff (40% Part A & Part B). Accelerate syllabus coverage to ensure safe selection.' };
    return { label: 'Preparation Building Phase (<90)', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300', advice: 'Start checking off foundational syllabus topics and practice chapter-wise tests to build exam momentum.' };
  };

  const readiness = getReadinessLevel(totalPredictedScore);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6">
      {/* Header Banner with 3D Glossy Icon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <Glass3dIcon type="target" size="lg" className="shrink-0" />
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Syllabus Coverage &amp; Predictive Exam Score
            </h3>
          </div>
        </div>
      </div>

      {/* Main Stats Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Predicted Score */}
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-2xl p-3 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 opacity-15">
            <Trophy className="w-20 h-20 sm:w-28 sm:h-28" />
          </div>
          <div>
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-80 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Predicted Score
            </div>
            <div className="flex items-baseline gap-1 mt-1 sm:mt-2">
              <span className="text-2xl sm:text-4xl font-black tracking-tight">{totalPredictedScore}</span>
              <span className="text-xs sm:text-sm font-bold opacity-80">/ 200M</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-xs">
            <span className="opacity-90 font-medium">{predictedPercentage}%</span>
            <span className="font-extrabold bg-white/20 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px]">
              {totalPredictedScore >= 120 ? 'Competitive' : 'Preparing'}
            </span>
          </div>
        </div>

        {/* Card 2: Part A General Predicted */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Part A (General)
            </div>
            <div className="flex items-baseline gap-1 mt-1 sm:mt-2">
              <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">{partAPredicted}</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">/ 100M</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 sm:h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, (partAPredicted / 100) * 100)}%` }} 
              />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 flex justify-between">
            <span>5 Sections</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">{partAPredicted}%</span>
          </div>
        </div>

        {/* Card 3: Part B Computer Science Predicted */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Part B (CS)
            </div>
            <div className="flex items-baseline gap-1 mt-1 sm:mt-2">
              <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">{partBPredicted}</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500">/ 100M</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 sm:h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, (partBPredicted / 100) * 100)}%` }} 
              />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 flex justify-between">
            <span>CS &amp; Pedagogy</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{partBPredicted}%</span>
          </div>
        </div>

        {/* Card 4: Overall Syllabus Coverage */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Syllabus
              </div>
              <div className="flex items-baseline gap-1 mt-1 sm:mt-2">
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">{overallSyllabusPercentage}%</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">Done</span>
              </div>
            </div>
            <CircularProgressRing percentage={overallSyllabusPercentage} size={36} strokeWidth={3.5} activeColor="#10b981" />
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 flex justify-between">
            <span>{totalCompletedTopics}/{totalSyllabusTopics}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">+{totalCompletedTopics * 10}🪙</span>
          </div>
        </div>
      </div>

      {/* Readiness Band Banner */}
      <div className={`p-4 rounded-2xl border ${readiness.badgeBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-2xs shrink-0">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-xs font-black tracking-tight">{readiness.label}</div>
            <p className="text-xs opacity-90 font-medium mt-0.5">{readiness.advice}</p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Granular Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-500" /> Subject-Wise Syllabus Mastery &amp; Score Insights
          </h4>
          <span className="text-[11px] font-bold text-slate-500">
            {subjectStats.length} Subjects Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {subjectStats.map((subj) => (
            <div 
              key={subj.id}
              className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      subj.category === 'Part A' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {subj.category}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {subj.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {subj.completedTopics} of {subj.totalTopics} Topics Finished ({subj.completionRate}%)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {subj.predictedScore} <span className="text-[10px] text-slate-400 font-bold">/ {subj.weightMarks} M</span>
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    subj.status === 'Mastered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    subj.status === 'On Track' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    subj.status === 'Needs Practice' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {subj.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Syllabus Coverage</span>
                  <span>{subj.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${subj.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              {onStartRecommendedQuiz && (
                <button
                  onClick={() => onStartRecommendedQuiz(subj.name)}
                  className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Practice {subj.name.split(' ')[0]} Mocks</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
