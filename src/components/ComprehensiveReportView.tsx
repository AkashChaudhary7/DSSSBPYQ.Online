import React, { useState, useMemo, useRef } from 'react';
import { 
  Printer, Download, ArrowLeft, Award, Target, CheckCircle2, 
  AlertTriangle, TrendingUp, Calendar, Clock, BookOpen, ShieldCheck, 
  Sparkles, Share2, FileText, Check, ChevronRight, Zap
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';
import { UserProfile } from '../lib/userProfile';
import { Attempt, Question, Bookmark } from '../types';
import { generateComprehensiveReport, ComprehensiveReportData } from '../lib/comprehensiveReportEngine';

interface ComprehensiveReportViewProps {
  profile: UserProfile;
  attempts: Attempt[];
  bookmarks: Bookmark[];
  missedQuestions: Question[];
  onBack: () => void;
  onNavigateToQuiz?: (subjectSlug?: string) => void;
}

export default function ComprehensiveReportView({
  profile,
  attempts,
  bookmarks,
  missedQuestions,
  onBack,
  onNavigateToQuiz
}: ComprehensiveReportViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'page1' | 'page2' | 'page3' | 'page4'>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const reportPrintRef = useRef<HTMLDivElement>(null);

  const reportData: ComprehensiveReportData = useMemo(() => {
    return generateComprehensiveReport(profile, attempts, bookmarks, missedQuestions);
  }, [profile, attempts, bookmarks, missedQuestions]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportPrintRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Select all printable pages inside container
      const pageElements = reportPrintRef.current.querySelectorAll<HTMLElement>('.pdf-report-page');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const safeName = (reportData.candidateName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`DSSSB_TGT_CS_Diagnostic_Report_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generating multi-page PDF:', err);
      // Fallback to native print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareSummary = () => {
    const text = `📊 *DSSSB TGT/PGT CS Diagnostic Report*\n👤 *Candidate:* ${reportData.candidateName}\n🎯 *Target Exam:* ${reportData.targetExam}\n🏆 *Projected CBT Score:* ${reportData.projectedCbtScore}/200 (${reportData.scoreConfidenceRange})\n📈 *Accuracy:* ${reportData.overallAccuracy}%\n✅ *Strong Areas:* ${reportData.strongSubjects.map(s => s.subjectName).slice(0, 3).join(', ') || 'N/A'}\n⚠️ *Weak Areas Identified:* ${reportData.weakSubjects.map(s => s.subjectName).slice(0, 3).join(', ') || 'None'}\n\nGenerated on BytePrep (https://dsssbpyq.online)`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 px-3 sm:px-6 transition-colors duration-200">
      
      {/* Top Action & Navigation Bar (Hidden in Print) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Personalized Diagnostic & Study Plan Report</span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                Multi-Page PDF
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprehensive performance diagnostic tailored for <strong className="text-slate-800 dark:text-slate-200">{reportData.candidateName}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={handleShareSummary}
            className="flex-1 md:flex-none px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            {copySuccess ? 'Summary Copied!' : 'Share Summary'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Compiling Multi-Page PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Screen Tab Switcher (Hidden in Print) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs print:hidden">
        {[
          { id: 'all', label: '📖 Complete Report (All 4 Pages)' },
          { id: 'page1', label: '📄 Page 1: CBT Scorecard' },
          { id: 'page2', label: '📄 Page 2: Weak & Strong Topics' },
          { id: 'page3', label: '📄 Page 3: 30-Day Master Plan' },
          { id: 'page4', label: '📄 Page 4: CS Module Hacks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Multi-Page Report Container */}
      <div ref={reportPrintRef} className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:m-0 print:p-0">

        {/* ========================================================================= */}
        {/* PAGE 1: EXECUTIVE DIAGNOSTIC SUMMARY & CBT SCORECARD                      */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'page1') && (
          <div className="pdf-report-page bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:p-8 print:rounded-none print:break-after-page print:min-h-[1050px]">
            
            {/* Top Header Banner */}
            <div className="border-b-2 border-blue-600 pb-5 mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Glass3dIcon type="trophy" size="sm" />
                  </div>
                  <span className="text-[11px] font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
                    BytePrep : CS (DSSSBpyq.Online)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  DSSSB Computer Science CBT Diagnostic Dossier
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Official Performance Evaluation & Strategic Preparation Blueprint
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-black">
                  Page 1 of 4
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Generated: {reportData.generatedDate}</p>
              </div>
            </div>

            {/* Candidate Identity Meta Grid */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{reportData.candidateName}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Candidate ID</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{reportData.profileId}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Target Examination</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{reportData.targetExam}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Readiness Index</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{reportData.readinessPercentage}% Ready</span>
              </div>
            </div>

            {/* Score Prediction & Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              
              {/* Projected CBT Score */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Projected CBT Score</span>
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div className="my-2">
                  <div className="text-3xl font-black">{reportData.projectedCbtScore} <span className="text-sm font-normal text-blue-200">/ 200</span></div>
                  <p className="text-[11px] text-blue-100 mt-0.5">Estimated Range: <strong>{reportData.scoreConfidenceRange} Marks</strong></p>
                </div>
                <div className="pt-2 border-t border-white/20 text-[10px] text-blue-100 flex justify-between">
                  <span>Part A: <strong>{reportData.partAScoreEst}/100</strong></span>
                  <span>Part B: <strong>{reportData.partBScoreEst}/100</strong></span>
                </div>
              </div>

              {/* Accuracy & Efficiency */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accuracy & Speed</span>
                  <Target className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="my-2">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{reportData.overallAccuracy}%</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {reportData.overallAccuracy >= 75 ? '🟢 Optimal scoring zone' : reportData.overallAccuracy >= 55 ? '🟡 Needs -0.25 error control' : '🔴 High error rate detected'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[10px] text-slate-500 flex justify-between">
                  <span>Mocks Done: <strong>{reportData.totalMocksTaken}</strong></span>
                  <span>Total Qs: <strong>{reportData.totalQuestionsSolved}</strong></span>
                </div>
              </div>

              {/* Negative Marking Penalty Loss */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Negative Penalty</span>
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="my-2">
                  <div className="text-3xl font-black text-rose-600 dark:text-rose-400">-{reportData.totalNegativeMarks} <span className="text-xs font-bold text-slate-400">Marks</span></div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Lost across {reportData.totalIncorrect} incorrect answers
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 text-[10px] text-slate-500 flex justify-between">
                  <span>Correct: <strong className="text-emerald-600">{reportData.totalCorrect}</strong></span>
                  <span>Net Marks: <strong className="text-slate-800 dark:text-slate-200">{reportData.totalNetScore}</strong></span>
                </div>
              </div>

            </div>

            {/* Performance Trajectory & Executive Observations */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Executive Diagnostic Observations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 space-y-1.5">
                  <h4 className="text-xs font-black text-blue-900 dark:text-blue-300">Part A (General Ability - 100 Marks)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Estimated performance is at <strong>{reportData.partAScoreEst}/100</strong>. Scoring above 75+ in Part A provides a commanding buffer for qualifying the overall DSSSB merit list. Focus on General Intelligence & Hindi Vyakaran for near-full marks.
                  </p>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 space-y-1.5">
                  <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300">Part B (CS & Pedagogy - 100 Marks)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Estimated technical score is at <strong>{reportData.partBScoreEst}/100</strong>. Core modules like DBMS, Networks, and Operating Systems carry 50+ marks. Strict 40% qualifying marks (30% for SC/ST) in Part B is mandatory by DSSSB rules.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                <div className="p-1 bg-amber-100 dark:bg-amber-900 rounded-lg text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Key Strategic Takeaway for {reportData.candidateName}:</strong> Your accuracy of {reportData.overallAccuracy}% indicates that reducing negative marks from random guessing will instantly raise your projected score by <strong>+8 to +14 marks</strong>. Follow the Phase 1 action plan on Page 3.
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>BytePrep Diagnostic Engine • dsssbpyq.online</span>
              <span>Candidate: {reportData.candidateName} • DSSSB TGT/PGT CS</span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: GRANULAR SUBJECT STRENGTH & WEAKNESS ANALYSIS                     */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'page2') && (
          <div className="pdf-report-page bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:p-8 print:rounded-none print:break-after-page print:min-h-[1050px]">
            
            {/* Page Header */}
            <div className="border-b-2 border-indigo-600 pb-5 mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                  Diagnostic Breakdown • Page 2 of 4
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Subject-Wise Strength & Weakness Matrix
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Detailed analysis of candidate mastery across all 13 DSSSB modules
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-black">
                  Candidate: {reportData.candidateName}
                </span>
              </div>
            </div>

            {/* 3 Categories Summary Pill */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-center">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">Strong Areas (≥70%)</span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-200">{reportData.strongSubjects.length} Subjects</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-center">
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider block">Moderate (48-69%)</span>
                <span className="text-xl font-black text-amber-800 dark:text-amber-200">{reportData.moderateSubjects.length} Subjects</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-center">
                <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider block">Critical Weak (&lt;48%)</span>
                <span className="text-xl font-black text-rose-800 dark:text-rose-200">{reportData.weakSubjects.length} Subjects</span>
              </div>
            </div>

            {/* Granular Subject Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-6 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Subject / Module</th>
                    <th className="p-3">Section</th>
                    <th className="p-3 text-center">Accuracy</th>
                    <th className="p-3 text-center">Correct / Wrong</th>
                    <th className="p-3">Status & Action Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {reportData.allSubjects.map((subj) => (
                    <tr key={subj.subjectName} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        {subj.subjectName}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Key: {subj.highYieldTopics.slice(0, 2).join(', ')}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          subj.category === 'Part A' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          subj.category === 'Part B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {subj.category}
                        </span>
                      </td>
                      <td className="p-3 text-center font-black">
                        <span className={`${
                          subj.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                          subj.accuracy >= 48 ? 'text-amber-600 dark:text-amber-400' :
                          'text-rose-600 dark:text-rose-400'
                        }`}>
                          {subj.accuracy}%
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-[11px]">
                        <span className="text-emerald-600 font-bold">{subj.correctCount}</span> / <span className="text-rose-600 font-bold">{subj.incorrectCount}</span>
                      </td>
                      <td className="p-3 text-[11px] leading-snug">
                        <span className={`inline-block font-black text-[10px] uppercase px-1.5 py-0.2 rounded-sm mr-1.5 ${
                          subj.status === 'strong' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          subj.status === 'moderate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {subj.status}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">{subj.recommendedAction}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Highlighted Remediation Box */}
            {reportData.weakSubjects.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Immediate Attention Required
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  The lowest scoring modules for {reportData.candidateName} are <strong>{reportData.weakSubjects.map(w => w.subjectName).join(', ')}</strong>. Do not start full 200-question timed mocks without completing the targeted 10-day foundation repair module for these subjects.
                </p>
              </div>
            )}

            {/* Page Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>BytePrep Diagnostic Engine • dsssbpyq.online</span>
              <span>Candidate: {reportData.candidateName} • DSSSB TGT/PGT CS</span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: PERSONALIZED 30-DAY MASTER STRATEGIC STUDY PLAN                   */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'page3') && (
          <div className="pdf-report-page bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:p-8 print:rounded-none print:break-after-page print:min-h-[1050px]">
            
            {/* Page Header */}
            <div className="border-b-2 border-emerald-600 pb-5 mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                  Strategic Roadmap • Page 3 of 4
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Personalized 30-Day DSSSB TGT CS Master Plan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Custom-tailored 3-Phase strategy calibrated for {reportData.candidateName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-black">
                  Target: 140+ Marks
                </span>
              </div>
            </div>

            {/* 3 Phases Detailed Roadmap */}
            <div className="space-y-4 mb-6">
              
              {/* Phase 1 */}
              <div className="bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[10px]">Phase 1</span>
                    <span>{reportData.personalizedPlan.phase1.days}: Foundation Repair</span>
                  </h3>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">Target: Eliminate Blunders</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {reportData.personalizedPlan.phase1.focus}
                </p>
                <ul className="space-y-1.5 pt-1">
                  {reportData.personalizedPlan.phase1.tasks.map((task, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-rose-500 font-black shrink-0">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-[10px]">Phase 2</span>
                    <span>{reportData.personalizedPlan.phase2.days}: Speed & -0.25 Shield</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Target: 80%+ Accuracy</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {reportData.personalizedPlan.phase2.focus}
                </p>
                <ul className="space-y-1.5 pt-1">
                  {reportData.personalizedPlan.phase2.tasks.map((task, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 font-black shrink-0">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px]">Phase 3</span>
                    <span>{reportData.personalizedPlan.phase3.days}: 200Q CBT Simulation</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Target: Exam Readiness</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {reportData.personalizedPlan.phase3.focus}
                </p>
                <ul className="space-y-1.5 pt-1">
                  {reportData.personalizedPlan.phase3.tasks.map((task, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 font-black shrink-0">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Daily Recommended 6-Hour Timetable */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> Recommended Daily Timetable for {reportData.candidateName}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reportData.personalizedPlan.dailySchedule.map((slot, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-start gap-3">
                    <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                      {slot.time}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{slot.slot} ({slot.subject})</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{slot.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Page Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>BytePrep Diagnostic Engine • dsssbpyq.online</span>
              <span>Candidate: {reportData.candidateName} • DSSSB TGT/PGT CS</span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGE 4: HIGH-YIELD TOPIC MATRIX & EXAMINER SCORING HACKS                  */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'page4') && (
          <div className="pdf-report-page bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:p-8 print:rounded-none print:min-h-[1050px]">
            
            {/* Page Header */}
            <div className="border-b-2 border-purple-600 pb-5 mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-purple-600 dark:text-purple-400">
                  Revision Matrix • Page 4 of 4
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  High-Yield Revision Matrix & Examiner Hacks
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Weightage analysis and proven score-multiplying techniques for DSSSB CBT
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-black">
                  Final Summary
                </span>
              </div>
            </div>

            {/* Part B: 7 Core Technical Modules Weightage */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" /> Part B: High-Yield Computer Science & Pedagogy Matrix (100 Marks)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reportData.highYieldCsChecklist.map((mod, idx) => (
                  <div key={idx} className="p-3 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-purple-900 dark:text-purple-300">{mod.module}</span>
                      <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 text-[10px] font-black rounded-md">
                        {mod.weightage}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      <strong>Focus:</strong> {mod.keyFocus}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Part A: 5 Sectional Hacks */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Part A: Sectional Speed Hacks (100 Marks)
              </h3>

              <div className="space-y-2">
                {reportData.partAFormulaHacks.map((item, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-3">
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-black shrink-0">
                      {item.weightage}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.section}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.hack}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Negative Marking & Exam Hall Strategy */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Official DSSSB CBT Golden Rules for {reportData.candidateName}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white block">1. Section Lock Protocol:</strong>
                  DSSSB CBT sections lock once submitted. You cannot return to Part A after entering Part B. Budget exactly 45 mins for Part A (9 mins per section).
                </div>
                <div>
                  <strong className="text-white block">2. -0.25 Negative Marking Rule:</strong>
                  Every 4 wrong answers cancel out 1 correct answer (+1 vs -0.25). Never guess when eliminating 0 options.
                </div>
              </div>
            </div>

            {/* Signoff / Certification Footer */}
            <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                  BytePrep Academic Mentorship Board
                </p>
                <p className="text-[10px] text-slate-400">
                  Verified DSSSB TGT & PGT Computer Science Curriculum Guidelines
                </p>
              </div>
              <div className="text-right">
                <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black inline-block">
                  ✓ Analysis Certified for {reportData.candidateName}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
