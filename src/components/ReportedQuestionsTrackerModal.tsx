import React, { useState } from 'react';
import { X, ShieldAlert, Trash2, CheckCircle, AlertTriangle, Search, Filter, BookOpen, Clock, User, Sparkles } from 'lucide-react';
import { ReportedQuestionRecord } from '../types';
import { cleanOptionText } from '../lib/formatText';

interface ReportedQuestionsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedQuestions: ReportedQuestionRecord[];
  onDismissReport: (reportId: string) => void;
  onClearAllReports: () => void;
}

export const ReportedQuestionsTrackerModal: React.FC<ReportedQuestionsTrackerModalProps> = ({
  isOpen,
  onClose,
  reportedQuestions,
  onDismissReport,
  onClearAllReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');

  if (!isOpen) return null;

  const validReports = reportedQuestions.filter(r => r && r.id && r.question);

  const filteredReports = validReports.filter(report => {
    const qText = (report.question?.question || '').toLowerCase();
    const qTitle = (report.quizTitle || '').toLowerCase();
    const reason = (report.reason || '').toLowerCase();
    const details = (report.details || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = !search || qText.includes(search) || qTitle.includes(search) || reason.includes(search) || details.includes(search);
    const matchesReason = selectedReasonFilter === 'all' || reason.includes(selectedReasonFilter.toLowerCase());

    return matchesSearch && matchesReason;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Reported Question Tracker
                </h2>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {validReports.length} {validReports.length === 1 ? 'question report' : 'question reports'} pending review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {validReports.length > 0 && (
              <button
                onClick={onClearAllReports}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Clear all reported records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All Reports</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        {validReports.length > 0 && (
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search report text, test title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {['all', 'Incorrect Answer', 'Typo', 'Unclear Explanation'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedReasonFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedReasonFilter === filterKey
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {filterKey === 'all' ? 'All Reasons' : filterKey}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredReports.length === 0 ? (
            <div className="h-64 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                {validReports.length === 0 ? 'No Reported Questions Pending' : 'No Reports Match Your Search'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                {validReports.length === 0
                  ? 'Great job! All user flag feedback has been resolved or no errors have been reported yet.'
                  : 'Try clearing your search query or selecting "All Reasons" to view all records.'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const q = report.question;
              if (!q) return null;

              return (
                <div
                  key={report.id}
                  className="bg-white dark:bg-slate-800/80 border-2 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all relative"
                >
                  {/* Top Meta info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                        ⚠️ {report.reason || 'Flagged Question'}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-500" /> {report.quizTitle || 'Mock Test'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(report.reportedAt).toLocaleString()}
                      </span>
                      {report.reportedBy && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> By: {report.reportedBy}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onDismissReport(report.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Mark report as resolved & remove from tracker"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve &amp; Remove</span>
                    </button>
                  </div>

                  {/* Reporter Note / Comment */}
                  {report.details && (
                    <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                      <strong>User Remark:</strong> "{report.details}"
                    </div>
                  )}

                  {/* Question Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                      Question ID #{q.id || report.questionId} • Section: {q.section || 'General'}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt, oIdx) => {
                      const isCorrect = q.answer === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs font-semibold ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                          {cleanOptionText(opt)}
                          {isCorrect && (
                            <span className="float-right bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution Explanation */}
                  <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-3 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/80 dark:border-slate-800">
                    <strong className="text-blue-600 dark:text-blue-400">Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>Password Protected Admin Portal • BytePrep</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
