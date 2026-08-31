import React, { useState } from 'react';
import { BookOpen, GraduationCap, Award, CheckCircle2, ShieldCheck, ChevronRight, FileText, Sparkles, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

export default function SeoBlogSection() {
  const [activeTab, setActiveTab] = useState<'dsssb' | 'kvs_nvs' | 'emrs_state' | 'syllabus_matrix'>('dsssb');

  return (
    <section className="w-full bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 font-sans" id="seo-knowledge-hub">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-xs font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Exam Preparation Hub
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-xs font-black rounded-lg uppercase tracking-wider">
                100% Free Resources
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 shrink-0" />
              <span>TGT &amp; PGT Computer Science Guide &amp; Exam Knowledge Base</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Complete exam pattern rules, eligibility criteria, expected vacancy updates, and syllabus mapping for DSSSB TGT/PGT CS, KVS, NVS, EMRS, and State Computer Teacher exams.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <a
              href="#syllabus"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Syllabus</span>
            </a>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('dsssb')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'dsssb'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <span>🏛️ DSSSB TGT/PGT CS Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('kvs_nvs')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'kvs_nvs'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <span>🏫 KVS &amp; NVS CS Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('emrs_state')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'emrs_state'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <span>🎯 EMRS &amp; State Teacher Exams</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus_matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'syllabus_matrix'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <span>⚡ BytePrep 100% Syllabus Matrix</span>
          </button>
        </div>

        {/* Tab 1: DSSSB TGT/PGT Computer Science */}
        {activeTab === 'dsssb' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>DSSSB TGT Computer Science (Post Code 39/21, 107/20) &amp; PGT Exam Guide</span>
                </h3>
                <p>
                  The <strong>Delhi Subordinate Services Selection Board (DSSSB)</strong> conducts competitive examinations for the recruitment of Trained Graduate Teachers (TGT) and Post Graduate Teachers (PGT) in Computer Science under the Directorate of Education (DoE) and NDMC schools in Delhi.
                </p>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Mandatory Qualifying Rules &amp; Marking Scheme
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    <li><strong>Total Questions &amp; Marks:</strong> 200 Questions (200 Marks) in 2 Hours (120 Minutes).</li>
                    <li><strong>Part A (100 Marks):</strong> 5 Sections of 20 marks each — General Awareness, General Intelligence &amp; Reasoning, Arithmetical &amp; Numerical Ability, Test of Hindi Language, and Test of English Language.</li>
                    <li><strong>Part B (100 Marks):</strong> Domain Subject Knowledge (Computer Science Theory, Practical Concepts, and Teaching Methodology/Pedagogy).</li>
                    <li><strong>Sectional Cut-off Rule:</strong> Candidates must score a minimum of <strong>40% in Part A and 40% in Part B separately</strong> (35% for OBC Delhi, 30% for SC/ST/PH).</li>
                    <li><strong>Negative Marking:</strong> Penalty of <strong>0.25 marks</strong> for every incorrect answer.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-white text-sm">Eligibility Criteria for DSSSB TGT CS</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    <li>BCA or B.Sc in Computer Science / Information Technology from a recognized university.</li>
                    <li>OR Graduation in any discipline with DOEACC &apos;A&apos; Level certification.</li>
                    <li>OR B.E. / B.Tech in Computer Science / Information Technology with minimum 50% aggregate marks.</li>
                    <li><strong>CTET Status:</strong> CTET (Central Teacher Eligibility Test) is <strong>NOT mandatory</strong> for DSSSB TGT Computer Science.</li>
                    <li><strong>Age Limit:</strong> Up to 30 years for general candidates (with relaxations of 3 years for OBC Delhi, 5 years for SC/ST, and 10 years for PwD).</li>
                  </ul>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="space-y-4">
                <div className="bg-indigo-950/60 border border-indigo-800/70 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-indigo-200 text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" /> Expected Vacancies (2026-2027)
                  </h4>
                  <p className="text-xs text-indigo-300/90 leading-relaxed">
                    Over <strong>550+ vacancies</strong> for TGT &amp; PGT Computer Science teachers are projected across Delhi government schools in upcoming DSSSB recruitment notifications.
                  </p>
                  <div className="pt-2 border-t border-indigo-800/60 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">TGT CS Expected:</span>
                      <strong className="text-emerald-400">400+ Posts</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">PGT CS Expected:</span>
                      <strong className="text-sky-400">150+ Posts</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">BytePrep Coverage Ratio</h4>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-emerald-400">100%</div>
                    <div className="text-xs text-slate-300 font-medium">
                      Matches official DSSSB syllabus across all 32 domain topics + Part A modules.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: KVS & NVS CS Blueprint */}
        {activeTab === 'kvs_nvs' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>KVS &amp; NVS PGT / TGT Computer Science Blueprint</span>
                </h3>
                <p>
                  <strong>Kendriya Vidyalaya Sangathan (KVS)</strong> and <strong>Navodaya Vidyalaya Samiti (NVS)</strong> conduct central recruitment for PGT Computer Science and Work Experience / Computer Literacy TGT posts across India.
                </p>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-sky-400 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> KVS PGT CS Exam Scheme (180 Questions / 180 Minutes)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-400 font-extrabold uppercase text-[10px]">
                          <th className="py-2 px-2">Part</th>
                          <th className="py-2 px-2">Section Topic</th>
                          <th className="py-2 px-2 text-right">Marks / Qs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr>
                          <td className="py-2 px-2 font-bold text-white">Part I</td>
                          <td className="py-2 px-2">Proficiency in Languages (General English 10, General Hindi 10)</td>
                          <td className="py-2 px-2 text-right font-bold text-sky-400">20 Marks</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 font-bold text-white">Part II</td>
                          <td className="py-2 px-2">General Awareness (10), Reasoning Ability (5), Computer Literacy (5)</td>
                          <td className="py-2 px-2 text-right font-bold text-sky-400">20 Marks</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 font-bold text-white">Part III</td>
                          <td className="py-2 px-2">Perspectives on Education &amp; Leadership (Pedagogy &amp; Educational Tech)</td>
                          <td className="py-2 px-2 text-right font-bold text-sky-400">40 Marks</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 font-bold text-white">Part IV</td>
                          <td className="py-2 px-2 font-bold text-emerald-400">Subject Specific Syllabus (Computer Science)</td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-400">100 Marks</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-white text-sm">Eligibility Qualifications</h4>
                  <p className="text-xs text-slate-300">
                    B.E. or B.Tech (Computer Science / IT) OR M.Sc (Computer Science) / MCA OR DOEACC &apos;B&apos; Level with Post Graduate degree with at least 50% marks in aggregate from a recognized university.
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-sky-950/60 border border-sky-800/70 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-sky-200 text-sm">KVS / NVS Syllabus Match</h4>
                  <p className="text-xs text-sky-300/90 leading-relaxed">
                    BytePrep&apos;s 3,000+ question bank fully covers Python 3.x, Computer Networks, SQL/DBMS, Data Structures, Digital Logic, and Educational Technology pedagogy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EMRS & State Teacher Exams */}
        {activeTab === 'emrs_state' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>EMRS, BPSC TRE 3.0/4.0 &amp; State Computer Teacher Recruitment</span>
                </h3>
                <p>
                  Prepare seamlessly for <strong>EMRS (Eklavya Model Residential Schools) PGT Computer Science</strong>, <strong>BPSC TRE 3.0 / 4.0 Bihar Computer Teacher</strong>, <strong>HTET Level 3 PGT CS</strong>, HP PGT, and UP Computer Teacher posts using BytePrep&apos;s universal question bank.
                </p>

                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-emerald-400 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Universal Computer Science Syllabus Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                      <strong className="text-indigo-300 block">1. Computer Systems &amp; Hardware</strong>
                      <p className="text-slate-400 text-[11px]">Logic Gates, Boolean Algebra, CPU Architecture, Memory Hierarchy, Bus Structure.</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                      <strong className="text-indigo-300 block">2. Data Structures &amp; Algorithms</strong>
                      <p className="text-slate-400 text-[11px]">Arrays, Stacks, Queues, Linked Lists, Trees, Graphs, Sorting &amp; Searching Complexities.</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                      <strong className="text-indigo-300 block">3. Operating Systems &amp; Linux</strong>
                      <p className="text-slate-400 text-[11px]">Process Management, Threads, Deadlocks, Paging, Virtual Memory, Shell Scripting.</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
                      <strong className="text-indigo-300 block">4. Database Management &amp; SQL</strong>
                      <p className="text-slate-400 text-[11px]">ER Diagrams, Relational Algebra, SQL Queries, Normalization 1NF-5NF, ACID Properties.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-emerald-950/60 border border-emerald-800/70 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-emerald-200 text-sm">State Exam Readiness</h4>
                  <p className="text-xs text-emerald-300/90 leading-relaxed">
                    Designed by top Computer Science subject experts to cover 100% syllabus requirements across all Indian state teacher exams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: BytePrep 100% Syllabus Matrix */}
        {activeTab === 'syllabus_matrix' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/50 border border-emerald-800/80 p-4 rounded-2xl">
                <div>
                  <h3 className="text-base font-black text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>BytePrep 100% Syllabus Coverage &amp; Topic Alignment Matrix</span>
                  </h3>
                  <p className="text-xs text-emerald-300/90 mt-1">
                    Every mock test and booster quiz directly maps to official DSSSB TGT/PGT CS, KVS, and NVS syllabus standards.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-black text-white">3,000+</div>
                  <div className="text-[10px] text-emerald-300 uppercase font-bold">Solved Questions</div>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="bg-slate-800/90 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-700">
                      <th className="py-3 px-4">Domain Topic Module</th>
                      <th className="py-3 px-4">Exam Coverage (DSSSB / KVS / NVS)</th>
                      <th className="py-3 px-4 text-center">Practice PYQ Qs</th>
                      <th className="py-3 px-4 text-right">BytePrep Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Operating Systems &amp; Concurrency</td>
                      <td className="py-2.5 px-4 text-slate-400">Process Scheduling, Deadlocks, Memory Management</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">280+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Database Management Systems &amp; SQL</td>
                      <td className="py-2.5 px-4 text-slate-400">ER Modeling, SQL Queries, Normalization, Transactions</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">320+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Data Structures &amp; Algorithms</td>
                      <td className="py-2.5 px-4 text-slate-400">Arrays, Stacks, Queues, Trees, Graphs, Sorting</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">350+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Computer Networks &amp; Security</td>
                      <td className="py-2.5 px-4 text-slate-400">OSI &amp; TCP/IP Model, Subnetting, Security Protocols</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">300+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Digital Logic &amp; Architecture</td>
                      <td className="py-2.5 px-4 text-slate-400">Logic Gates, Multiplexers, Counters, ALU Architecture</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">250+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Programming in Python 3.x &amp; C++</td>
                      <td className="py-2.5 px-4 text-slate-400">OOPs Concepts, Inheritance, Exception Handling, Functions</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">400+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Teaching Methodology &amp; CS Pedagogy</td>
                      <td className="py-2.5 px-4 text-slate-400">Computer Pedagogy, Lesson Planning, Classroom Tech</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">150+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-white">Part A General Ability (GK, Reasoning, Math, Eng, Hin)</td>
                      <td className="py-2.5 px-4 text-slate-400">Tier-1 General Section (100 Marks across 5 subjects)</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-200">1500+ Qs</td>
                      <td className="py-2.5 px-4 text-right"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded text-[10px]">100% Covered</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Popular Keywords Footer Tags */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-center md:text-left">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            POPULAR COMPUTER SCIENCE TEACHER EXAM SEARCHES &amp; TOPICS
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-[11px] text-slate-400">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">DSSSB TGT Computer Science PYQ</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">DSSSB PGT Computer Science Mock Test</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">KVS PGT CS Syllabus 2026</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">NVS TGT Computer Teacher Eligibility</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">EMRS PGT Computer Science Question Bank</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">DSSSB Post Code 39/21 107/20</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">Computer Pedagogy Notes PDF</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">DSSSB Part A General Ability Practice</span>
          </div>
        </div>

      </div>
    </section>
  );
}
