import React, { useState, useEffect } from 'react';
import { Quiz, Attempt } from '../types';
import { MockUnlockStatus } from '../lib/unlockSystem';
import { 
  Laptop, BookOpen, ChevronRight, Lock, Clock, Share2, ListTodo, Sparkles, CheckCircle2, ArrowRight, Tag 
} from 'lucide-react';
import { TgtCsCategoryIcon } from './CategoryIcons';
import { getMockNumberLabel, getQuestionCount, getTopicBadge, countMocksByTopic, getDifficultyTag } from '../lib/quizDisplayHelpers';
import AdBanner from './AdBanner';

interface TgtCsHubProps {
  quizzes: Quiz[];
  pastAttempts: Attempt[];
  nowTick: number;
  onStartQuiz: (quiz: Quiz, testIndex?: number) => void;
  onLockedQuizClick: (quiz: Quiz, status: MockUnlockStatus) => void;
  onShareQuiz: (quiz: Quiz, e: React.MouseEvent) => void;
  onOpenSyllabusTracker: () => void;
  getMockUnlockStatus: (testIndex: number, nowMs?: number) => MockUnlockStatus;
  initialActiveTab?: string;
  initialCsTopicFilter?: string;
}

export const TgtCsHub: React.FC<TgtCsHubProps> = ({
  quizzes,
  pastAttempts,
  nowTick,
  onStartQuiz,
  onLockedQuizClick,
  onShareQuiz,
  onOpenSyllabusTracker,
  getMockUnlockStatus,
  initialCsTopicFilter = 'All Topics'
}) => {
  const [csTopicFilter, setCsTopicFilter] = useState<string>(initialCsTopicFilter);
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(50);

  React.useEffect(() => {
    if (initialCsTopicFilter) {
      setCsTopicFilter(initialCsTopicFilter);
    }
  }, [initialCsTopicFilter]);

  // Base list of Part B CS quizzes with topic/subject filter (excluding Pedagogy)
  const csQuizzes = quizzes.filter(q => {
    if (q.testType === 'pyp') return false;
    const lowerSub = (q.subject || '').toLowerCase();
    const lowerTopic = (q.topic || '').toLowerCase();
    const lowerTitle = (q.title || '').toLowerCase();
    const lowerFile = (q.file || '').toLowerCase();

    // Exclude pedagogy from CS hub
    if (lowerSub.includes('teaching methodology') || lowerTopic.includes('teaching methodology') || lowerSub.includes('pedagogy')) {
      return false;
    }

    if (q.category !== 'part_b' && !lowerFile.includes('computer') && !lowerTopic.includes('computer')) return false;

    if (csTopicFilter === 'All Topics') return true;
    const filterLower = csTopicFilter.toLowerCase();
    
    if (lowerTopic.includes(filterLower) || lowerSub.includes(filterLower) || lowerTitle.includes(filterLower) || lowerFile.includes(filterLower)) {
      return true;
    }

    // Flexible aliases for CS topics
    if ((csTopicFilter.includes('Network') || csTopicFilter.includes('Networks') || csTopicFilter === 'CN') && (lowerTopic.includes('network') || lowerFile.includes('network') || lowerTitle.includes('network') || lowerTopic.includes('cn') || lowerFile.includes('/cn/'))) {
      return true;
    }
    if ((csTopicFilter.includes('Programming') || csTopicFilter.includes('Data Structure') || csTopicFilter.includes('C++')) && (lowerTopic.includes('data structure') || lowerTopic.includes('programming') || lowerTopic.includes('c++') || lowerFile.includes('programming') || lowerTitle.includes('c++') || lowerTitle.includes('data structure') || lowerFile.includes('data_structures'))) {
      return true;
    }
    if ((csTopicFilter.includes('Operating System') || csTopicFilter === 'OS') && (lowerTopic.includes('operating') || lowerTopic.includes('os') || lowerFile.includes('operating systems'))) {
      return true;
    }
    if ((csTopicFilter.includes('DBMS') || csTopicFilter.includes('Database')) && (lowerTopic.includes('dbms') || lowerTopic.includes('database') || lowerTopic.includes('sql') || lowerFile.includes('dbms'))) {
      return true;
    }
    return false;
  });

  // Apply Practice Status Filter
  const filterByStatus = (list: Quiz[]) => {
    return list.filter(q => {
      const isAttempted = pastAttempts.some(a => a.testId === q.testId);
      if (statusFilter === 'attempted') return isAttempted;
      if (statusFilter === 'unattempted') return !isAttempted;
      return true;
    });
  };

  const displayedCsQuizzes = filterByStatus(csQuizzes);

  const csAttemptedCount = csQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length;

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Decorative Gradient Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Laptop className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">BytePrep Computer Science</span>
              <span className="sm:hidden">BytePrep CS</span>
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              32 DOE CS Topics
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TgtCsCategoryIcon size={40} className="w-10 h-10 shrink-0 shadow-sm rounded-xl" />
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              <span className="hidden sm:inline">Computer Science Practice Hub</span>
              <span className="sm:hidden">Computer Science</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl hidden md:block">
            Master 32 Computer Science Modules: Operating Systems, DBMS, Networks, Data Structures &amp; C++, Python, Web Technologies, Software Engineering, Digital Electronics, and Computer Architecture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Stats Box */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50 border border-indigo-100 p-1.5 sm:p-2 rounded-2xl shrink-0">
            <div className="text-center px-2 sm:px-2.5 border-r border-indigo-200">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 uppercase block">Total</span>
              <span className="text-sm sm:text-base font-black text-indigo-950">{csQuizzes.length}</span>
            </div>
            <div className="text-center px-2 sm:px-2.5 border-r border-indigo-200">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-600 uppercase block">Attempted</span>
              <span className="text-sm sm:text-base font-black text-emerald-950">{csAttemptedCount}</span>
            </div>
            <div className="text-center px-2 sm:px-2.5">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-700 uppercase block">Unattempted</span>
              <span className="text-sm sm:text-base font-black text-amber-950">{Math.max(0, csQuizzes.length - csAttemptedCount)}</span>
            </div>
          </div>

          <button
            onClick={onOpenSyllabusTracker}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-200"
          >
            <ListTodo className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">CS 32 Modules Tracker</span>
            <span className="sm:hidden">Tracker</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </button>
        </div>
      </div>

      {/* CS Topic & Status Filter Bar */}
      <div className="flex flex-col gap-3 md:gap-4 border-b border-slate-200 pb-3 md:pb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-1.5 md:p-3">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filter Status:</span>
          </span>
          <div className="flex flex-wrap gap-1 md:gap-1.5">
            {[
              { id: 'all', label: `All (${csQuizzes.length})` },
              { id: 'attempted', label: `Attempted (${csQuizzes.filter(q => pastAttempts.some(a => a.testId === q.testId)).length})` },
              { id: 'unattempted', label: `Unattempted (${csQuizzes.filter(q => !pastAttempts.some(a => a.testId === q.testId)).length})` }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => {
                  setStatusFilter(status.id as any);
                  setVisibleCount(50);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] md:text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === status.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* CS Topic Filter Pills & 32 DOE Topic Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider hidden sm:block">
              Filter Computer Science Topic
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Select Module:</span>
              <select
                value={csTopicFilter}
                onChange={(e) => {
                  setCsTopicFilter(e.target.value);
                  setVisibleCount(50);
                }}
                className="bg-white border border-indigo-200 text-indigo-950 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer max-w-[220px] sm:max-w-[280px]"
              >
                <option value="All Topics">All 32 Computer Science Modules</option>
                <option value="Computer Networks">🌐 Computer Networks ({countMocksByTopic(quizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp'), 'Computer Networks')})</option>
                <option value="Operating System">💻 Operating Systems ({countMocksByTopic(quizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp'), 'Operating System')})</option>
                <option value="DBMS">🗄️ Database Management System (DBMS)</option>
                <option value="Programming in C, C++ & Data Structures">⚡ Programming in C/C++ & Data Structures</option>
                <option value="Software Engineering">📐 Software Engineering</option>
                <option value="Digital Electronics">🔌 Digital Electronics</option>
                <option value="Computer Architecture">🏛️ Computer Architecture</option>
                <option value="Design and Analysis of Algorithms (DAA)">🧮 Design & Analysis of Algorithms (DAA)</option>
                <option value="Fundamentals of Information Technology">🖥️ Fundamentals of IT</option>
                <option value="Computer Network Security">🔒 Computer Network Security</option>
                <option value="Java Programming and Website Design">☕ Java & Web Design</option>
                <option value="Front End Designed Tools">🎨 Front End Design Tools</option>
                <option value="Mathematics - I, II, III, IV">📐 Mathematics - I, II, III, IV</option>
                <option value="Linux Environment">🐧 Linux Environment</option>
                <option value="E-Commerce">🛒 E-Commerce</option>
                <option value="Mobile Computing">📱 Mobile Computing</option>
                <option value="Computer Graphics & Multimedia Applications">🖼️ Computer Graphics & Multimedia</option>
                <option value="Internet Programming">🌐 Internet Programming</option>
                <option value=".NET Programming">⚙️ .NET Programming</option>
                <option value="Management Information System (MIS)">📊 Management Information System (MIS)</option>
                <option value="Business Economics">📈 Business Economics</option>
                <option value="Business Communication, Organization & Management">💼 Business Communication</option>
                <option value="Basis of Physics">⚡ Basis of Physics</option>
                <option value="Financial Accounting">🧾 Financial Accounting</option>
                <option value="Foundation Course in English">📚 English Foundation</option>
                <option value="Statistical Techniques">📉 Statistical Techniques</option>
                <option value="TCP / Protocols">📡 TCP / Protocols</option>
                <option value="Interpolation">🔢 Interpolation</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {[
              { id: 'All Topics', full: 'All Topics', short: 'All' },
              { id: 'Computer Networks', full: 'Computer Networks', short: 'Networks' },
              { id: 'Operating System', full: 'Operating Systems', short: 'OS' },
              { id: 'DBMS', full: 'DBMS', short: 'DBMS' },
              { id: 'Software Engineering', full: 'Software Engineering', short: 'Software Eng.' },
              { id: 'Programming in C, C++ & Data Structures', full: 'C/C++ & Data Structures', short: 'DS & C++' },
              { id: 'Digital Electronics', full: 'Digital Electronics', short: 'Digital Elec.' },
              { id: 'Computer Architecture', full: 'Computer Architecture', short: 'Architecture' }
            ].map(topicObj => {
              const count = countMocksByTopic(
                quizzes.filter(q => q.category === 'part_b' && q.testType !== 'pyp'), 
                topicObj.id
              );
              return (
                <button
                  key={topicObj.id}
                  onClick={() => {
                    setCsTopicFilter(topicObj.id);
                    setVisibleCount(50);
                  }}
                  className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    csTopicFilter === topicObj.id
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span className="sm:hidden">{topicObj.short} ({count})</span>
                  <span className="hidden sm:inline">{topicObj.full} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiz List Rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {displayedCsQuizzes.length === 0 && (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
            No Computer Science mock tests found for the selected topic filter.
          </div>
        )}

        {displayedCsQuizzes.slice(0, visibleCount).map((quiz, index) => {
          const unlockStatus = getMockUnlockStatus(index, nowTick);
          const quizAttempts = pastAttempts.filter(a => a.testId === quiz.testId);
          const isAttempted = quizAttempts.length > 0;
          const mockLabel = getMockNumberLabel(quiz, index);
          const topicBadge = getTopicBadge(quiz);
          const qCount = getQuestionCount(quiz);

          return (
            <div 
              key={quiz.testId} 
              className="bg-white border-2 border-slate-200/90 hover:border-indigo-500 rounded-2xl p-4 md:p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md group relative"
            >
              {(() => {
                const diffTag = getDifficultyTag(index);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none pb-0.5">
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-2xs">
                        {mockLabel}
                      </span>
                      <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                        📌 {topicBadge}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border shrink-0 whitespace-nowrap ${diffTag.bg} ${diffTag.text} ${diffTag.border}`}>
                        <span>{diffTag.icon}</span> {diffTag.label}
                      </span>
                      {isAttempted && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase shrink-0 whitespace-nowrap">
                          ✅ Attempted ({quizAttempts.length}x)
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-slate-900 leading-snug text-center py-2 border-y border-slate-100/80 my-1">{quiz.title}</h3>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 w-full shrink-0">
                <button
                  onClick={(e) => onShareQuiz(quiz, e)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1"
                  title="Share Direct Link"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                </button>
                {unlockStatus.isUnlocked ? (
                  <button
                    onClick={() => onStartQuiz(quiz, index)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-center"
                  >
                    {isAttempted ? "Reattempt Test" : "Start Test"}
                  </button>
                ) : (
                  <button
                    onClick={() => onLockedQuizClick(quiz, unlockStatus)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-center"
                  >
                    Unlock Test
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayedCsQuizzes.length > visibleCount && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 25)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              ⚡ Load More CS Mock Tests ({displayedCsQuizzes.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      <AdBanner location="tgt_cs_hub_bottom" />
    </div>
  );
};

export default TgtCsHub;
