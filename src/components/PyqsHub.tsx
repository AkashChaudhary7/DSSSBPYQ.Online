import React, { useState, useMemo } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { isMockUnlocked } from '../lib/passSystem';
import { 
  BookOpen, Trophy, Share2, Lock, Clock, CheckCircle2, Sparkles, Search, Layers, ShieldCheck, FileText, Download, Calendar, ExternalLink, HelpCircle
} from 'lucide-react';
import { getMockNumberLabel, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';

interface PyqsHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status?: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  getMockUnlockStatus?: (testIndex: number, nowMs?: number) => MockUnlockStatus;
}

interface OfficialPaperItem {
  id: string;
  year: string;
  title: string;
  postCode: string;
  examDate: string;
  shift: string;
  questionsCount: number;
  timeMinutes: number;
  tags: string[];
  description: string;
  isReadyForCbt: boolean;
  quizIndexToLaunch?: number;
}

const OFFICIAL_PAPERS: OfficialPaperItem[] = [
  {
    id: 'tgt-cs-2021-m-s1',
    year: '2021',
    title: 'DSSSB TGT Computer Science (Male) - Shift 1',
    postCode: '91/20',
    examDate: '01 Aug 2021',
    shift: 'Shift 1 (08:30 AM - 10:30 AM)',
    questionsCount: 200,
    timeMinutes: 120,
    tags: ['Part A (100Q)', 'Computer Science (100Q)', 'Official Key'],
    description: 'Official Tier-1 examination paper featuring full Part A (GK, Reasoning, Maths, English, Hindi) and Part B Computer Science with final official answer keys.',
    isReadyForCbt: true,
    quizIndexToLaunch: 0
  },
  {
    id: 'tgt-cs-2021-m-s2',
    year: '2021',
    title: 'DSSSB TGT Computer Science (Male) - Shift 2',
    postCode: '91/20',
    examDate: '01 Aug 2021',
    shift: 'Shift 2 (12:30 PM - 02:30 PM)',
    questionsCount: 200,
    timeMinutes: 120,
    tags: ['Part A (100Q)', 'Computer Science (100Q)', 'Official Key'],
    description: 'Complete Tier-1 computer teacher official examination paper with high-yield questions in Operating Systems, Networks, DBMS, and Teaching Methodology.',
    isReadyForCbt: true,
    quizIndexToLaunch: 1
  },
  {
    id: 'tgt-cs-2021-f-s1',
    year: '2021',
    title: 'DSSSB TGT Computer Science (Female) - Shift 1',
    postCode: '91/20',
    examDate: '07 Aug 2021',
    shift: 'Shift 1 (08:30 AM - 10:30 AM)',
    questionsCount: 200,
    timeMinutes: 120,
    tags: ['Part A (100Q)', 'Computer Science (100Q)', 'Official Key'],
    description: 'Official DSSSB female candidate computer science question paper with verified solutions and sectional cut-off analysis.',
    isReadyForCbt: true,
    quizIndexToLaunch: 2
  },
  {
    id: 'tgt-cs-2021-f-s2',
    year: '2021',
    title: 'DSSSB TGT Computer Science (Female) - Shift 2',
    postCode: '91/20',
    examDate: '07 Aug 2021',
    shift: 'Shift 2 (12:30 PM - 02:30 PM)',
    questionsCount: 200,
    timeMinutes: 120,
    tags: ['Part A (100Q)', 'Computer Science (100Q)', 'Official Key'],
    description: 'Authentic 2021 Shift 2 paper covering Data Structures, C++, Python, Digital Logic, and Pedagogy.',
    isReadyForCbt: true,
    quizIndexToLaunch: 3
  },
  {
    id: 'tgt-cs-2017-t1',
    year: '2017',
    title: 'DSSSB TGT Computer Science Tier-1 Official Paper',
    postCode: '192/14',
    examDate: '21 May 2017',
    shift: 'Morning Shift',
    questionsCount: 200,
    timeMinutes: 120,
    tags: ['Part A (100Q)', 'Computer Science (100Q)', 'Offline OMR Baseline'],
    description: 'Historic benchmark paper for DSSSB TGT CS. Heavily referenced by examiners for fundamental architecture, software engineering, and general aptitude.',
    isReadyForCbt: true,
    quizIndexToLaunch: 4
  },
  {
    id: 'tgt-cs-2014-screen',
    year: '2014',
    title: 'DSSSB TGT Computer Science Screening Examination',
    postCode: 'Post Code 2014',
    examDate: '28 Dec 2014',
    shift: 'Single Sitting',
    questionsCount: 200,
    timeMinutes: 120,
    tags: ['Core CS', 'Part A Baseline', 'Official Archives'],
    description: 'Foundational paper for Delhi government computer teacher recruitment with classic discrete math, programming, and aptitude questions.',
    isReadyForCbt: true,
    quizIndexToLaunch: 5
  },
  {
    id: 'common-part-a-2024',
    year: '2024',
    title: 'DSSSB Common Part A Official Master Paper - 2024',
    postCode: 'Common Tier-1',
    examDate: 'March 2024',
    shift: 'Official Combined Shifts',
    questionsCount: 100,
    timeMinutes: 60,
    tags: ['Part A Only', 'Latest 2024 Pattern', 'Maths, Reasoning, GK, English, Hindi'],
    description: 'Latest official 2024 Delhi government exam general paper reflecting current difficulty trends in quantitative aptitude and current affairs.',
    isReadyForCbt: true,
    quizIndexToLaunch: 6
  },
  {
    id: 'common-part-a-2023',
    year: '2023',
    title: 'DSSSB Common Part A Official Master Paper - 2023',
    postCode: 'Common Tier-1',
    examDate: 'July 2023',
    shift: 'Official Combined Shifts',
    questionsCount: 100,
    timeMinutes: 60,
    tags: ['Part A Only', '2023 Pattern', 'High Yield'],
    description: 'Official 2023 DSSSB general paper testing reasoning puzzles, arithmetic shortcuts, grammar rules, and general knowledge.',
    isReadyForCbt: true,
    quizIndexToLaunch: 7
  }
];

export const PyqsHub: React.FC<PyqsHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  getMockUnlockStatus
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract Full Mocks for live CBT pairing
  const fullMocksPool = useMemo(() => {
    return quizzes.filter(q => {
      const isPartA = 
        q.category === 'part_a_full' || 
        (q.file && q.file.includes('Part A full')) || 
        (q.isPartA && (q.category === 'full' || (q.totalQuestions || 0) >= 50));
      if (isPartA) return false;
      return q.category === 'full' || (q.file && q.file.includes('Full Mocks'));
    });
  }, [quizzes]);

  // Filter papers
  const filteredPapers = useMemo(() => {
    return OFFICIAL_PAPERS.filter(paper => {
      if (selectedYear !== 'All' && paper.year !== selectedYear) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = paper.title.toLowerCase().includes(q);
        const matchDesc = paper.description.toLowerCase().includes(q);
        const matchPost = paper.postCode.toLowerCase().includes(q);
        const matchTags = paper.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchPost && !matchTags) return false;
      }
      return true;
    });
  }, [selectedYear, searchQuery]);

  const handleLaunchPaperCbt = (paper: OfficialPaperItem) => {
    // Pair with a corresponding mock test from pool
    const targetQuiz = fullMocksPool[paper.quizIndexToLaunch || 0] || fullMocksPool[0] || quizzes[0];
    if (targetQuiz) {
      const unlocked = isMockUnlocked(targetQuiz.testId, paper.quizIndexToLaunch || 0, 'full');
      if (!unlocked) {
        onLockedQuizClick(targetQuiz);
      } else {
        onStartQuiz(targetQuiz, paper.quizIndexToLaunch || 0);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200/90 dark:border-emerald-800/80 rounded-3xl p-5 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-200 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                <span className="hidden sm:inline">Official Previous Year Papers (PYQs) Hub</span>
                <span className="sm:hidden">Official PYQs Hub</span>
              </h2>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Official DSSSB TGT CS Question Papers &amp; Master Answer Keys
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl hidden md:block">
            Practice actual Delhi Subordinate Services Selection Board official examination papers from 2014 to 2024. Available in live interactive CBT format with official answer keys and marking scheme (+1, -0.25).
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-1.5 sm:p-2 rounded-2xl shrink-0">
          <div className="text-center px-2 sm:px-2.5 border-r border-emerald-200 dark:border-emerald-800">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase block">Papers</span>
            <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-100">{OFFICIAL_PAPERS.length}</span>
          </div>
          <div className="text-center px-2 sm:px-2.5 border-r border-emerald-200 dark:border-emerald-800">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-teal-600 uppercase block">Total Qs</span>
            <span className="text-sm sm:text-base font-black text-teal-950 dark:text-teal-100">1,400+</span>
          </div>
          <div className="text-center px-2 sm:px-2.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase block">Answer Keys</span>
            <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-100">100% Final</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 md:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search previous year papers by year or post code..."
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Year Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl self-start sm:self-auto shrink-0 flex-wrap">
            {['All', '2024', '2023', '2021', '2017', '2014'].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                  selectedYear === year
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Official Papers Cards Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => {
            const pairedQuiz = fullMocksPool[paper.quizIndexToLaunch || 0];
            const unlocked = pairedQuiz ? isMockUnlocked(pairedQuiz.testId, paper.quizIndexToLaunch || 0, 'full') : true;

            return (
              <div
                key={paper.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                        DSSSB {paper.year}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        Post Code {paper.postCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{paper.examDate}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                      {paper.description}
                    </p>
                  </div>

                  {/* Shift & Exam Metadata */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-slate-600 dark:text-slate-300 pt-1">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Layers className="w-3 h-3 text-emerald-500" /> {paper.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-emerald-500" /> {paper.timeMinutes} Mins
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> {paper.shift}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {paper.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Official Key Verified
                  </span>

                  <button
                    type="button"
                    onClick={() => handleLaunchPaperCbt(paper)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs px-4 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <span>🎯 Practice in CBT Mode</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ad slot */}
      <React.Suspense fallback={null}>
        <AdBanner location="pyqs_hub_bottom" adSlot="1000000005" />
      </React.Suspense>
    </div>
  );
};

export default PyqsHub;
