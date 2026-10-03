import React, { useState, useMemo } from 'react';
import { Attempt } from '../types';
import { 
  Calendar, 
  RefreshCw, 
  HelpCircle, 
  Award, 
  Target, 
  Clock, 
  CheckSquare, 
  Square, 
  ArrowRightLeft, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  BarChart3 
} from 'lucide-react';

interface LeaderboardProps {
  attempts: Attempt[];
  onReattempt: (testId: string) => void;
  onClearHistory: () => void;
}

export default function Leaderboard({ attempts, onReattempt, onClearHistory }: LeaderboardProps) {
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Toggle selection of an attempt for comparison
  const toggleSelectForCompare = (id: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 2) {
        // Replace second item if already 2 selected
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };

  // Selected attempt objects
  const selectedAttempts = useMemo(() => {
    return selectedCompareIds
      .map(id => attempts.find(a => a.id === id))
      .filter(Boolean) as Attempt[];
  }, [selectedCompareIds, attempts]);

  const attempt1 = selectedAttempts[0] || null;
  const attempt2 = selectedAttempts[1] || null;

  // Format time in mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Local Attempt History logs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="space-y-0.5">
            <h2 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" /> Past Attempt Logs &amp; Score Comparison
            </h2>
            <p className="text-[11px] md:text-xs text-slate-500">
              Select any 2 past mock attempts from the list below to compare scores, accuracy, and timing side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {selectedCompareIds.length > 0 && (
              <button
                onClick={() => setSelectedCompareIds([])}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Clear Selection
              </button>
            )}

            {attempts.length > 0 && (
              <button 
                onClick={onClearHistory}
                className="text-[11px] md:text-xs text-red-500 hover:text-red-700 hover:underline font-extrabold transition-all cursor-pointer bg-red-50 hover:bg-red-100/60 px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl border border-red-100"
              >
                Clear Logs
              </button>
            )}
          </div>
        </div>

        {/* Selection Banner when 1 or 2 attempts are checked */}
        {selectedCompareIds.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white p-3.5 md:p-4 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-indigo-700/50 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-amber-400">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-white">
                  {selectedCompareIds.length === 1 
                    ? '1 Attempt Selected' 
                    : '2 Attempts Selected for Side-by-Side Comparison'}
                </p>
                <p className="text-[11px] text-indigo-200">
                  {selectedCompareIds.length === 1 
                    ? 'Select 1 more attempt from the list below to enable score comparison table.' 
                    : `${attempt1?.testTitle.substring(0, 20)}... vs ${attempt2?.testTitle.substring(0, 20)}...`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {selectedCompareIds.length === 2 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Compare 2 Scores Now</span>
                </button>
              )}
            </div>
          </div>
        )}

        {attempts.length === 0 ? (
          <div className="h-36 md:h-56 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 md:p-6 text-center">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2 md:mb-3">
              <HelpCircle className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <p className="text-xs md:text-sm font-extrabold text-slate-700">No Attempts Logged Yet</p>
            <p className="text-[11px] md:text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              Take any mock test or practice topic to view persistent performance insights and compare score logs here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 max-h-[420px] md:max-h-[550px] overflow-y-auto pr-1">
            {attempts.map((attempt) => {
              if (!attempt || !attempt.id) return null;
              const isSelected = selectedCompareIds.includes(attempt.id);

              return (
                <div 
                  key={attempt.id} 
                  className={`border rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-5 transition-all select-none ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-400 shadow-sm ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Select for Compare Checkbox & Meta */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectForCompare(attempt.id)}
                      className={`mt-1 shrink-0 p-1 rounded-lg transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                      }`}
                      title={isSelected ? 'Unselect attempt' : 'Select for comparison'}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span className={`text-[8px] md:text-[9px] font-extrabold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-wider ${
                          attempt.mode === 'exam' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {attempt.mode === 'exam' ? 'Exam Mode' : 'Practice Run'}
                        </span>

                        <span className="text-[9px] md:text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md">
                          #{attempt.testId.substring(0, 8)}
                        </span>

                        {isSelected && (
                          <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Compare Selected
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-xs md:text-sm text-slate-800 leading-tight">
                          {attempt.testTitle}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] md:text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500" />
                            Time: {formatTime(attempt.timeSpentSeconds)}
                          </span>
                          <span className="hidden sm:inline text-slate-400">•</span>
                          <span>
                            Date: {new Date(attempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-5 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                    <div className="grid grid-cols-2 gap-2 md:gap-4 text-right pr-1">
                      <div className="space-y-0.5 border-r border-slate-100 pr-2 md:pr-4">
                        <span className="text-[8px] md:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Score</span>
                        <span className="text-xs md:text-sm font-black text-slate-800 flex items-center justify-end gap-0.5">
                          <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          {attempt.score.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[8px] md:text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Accuracy</span>
                        <span className="text-xs md:text-sm font-black text-slate-800 flex items-center justify-end gap-0.5">
                          <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {attempt.accuracy}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleSelectForCompare(attempt.id)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-slate-50 hover:bg-slate-100 text-indigo-600 border-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected' : '+ Compare'}
                      </button>

                      <button
                        onClick={() => onReattempt(attempt.testId)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl p-2 md:p-2.5 border border-indigo-100 transition-all flex items-center justify-center cursor-pointer group shrink-0"
                        title="Start Re-attempt Practice"
                      >
                        <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-180 transition-all duration-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Table Modal */}
      {showModal && attempt1 && attempt2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-indigo-800/40 shrink-0">
              <div className="space-y-1">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                  Side-by-Side Analytics
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>Mock Attempt Score Comparison</span>
                </h3>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Comparison Table */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Insight Delta Summary Bar */}
              {(() => {
                const scoreDiff = attempt2.score - attempt1.score;
                const accuracyDiff = attempt2.accuracy - attempt1.accuracy;
                return (
                  <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl text-white font-extrabold shrink-0 ${
                        scoreDiff >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}>
                        {scoreDiff >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">
                          {scoreDiff >= 0 
                            ? `Score Improved by +${scoreDiff.toFixed(2)} Marks!` 
                            : `Score dropped by ${Math.abs(scoreDiff).toFixed(2)} Marks`}
                        </p>
                        <p className="text-slate-600 text-xs">
                          {accuracyDiff >= 0 
                            ? `Accuracy increased by +${accuracyDiff.toFixed(1)}% between Attempt 1 and Attempt 2.` 
                            : `Accuracy reduced by ${Math.abs(accuracyDiff).toFixed(1)}%. Review incorrect questions.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-mono font-black text-slate-800">
                        Δ Score: {scoreDiff >= 0 ? `+${scoreDiff.toFixed(2)}` : scoreDiff.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Main Comparison Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3 sm:p-4 w-1/3">Performance Metric</th>
                      <th className="p-3 sm:p-4 w-1/3 bg-blue-50/60 border-l border-slate-200 text-blue-900">
                        Attempt A (Earlier)
                      </th>
                      <th className="p-3 sm:p-4 w-1/3 bg-purple-50/60 border-l border-slate-200 text-purple-900">
                        Attempt B (Later)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {/* Test Title */}
                    <tr>
                      <td className="p-3 sm:p-4 font-bold text-slate-600">Test Title</td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-slate-900 bg-blue-50/20">
                        {attempt1.testTitle}
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-slate-900 bg-purple-50/20">
                        {attempt2.testTitle}
                      </td>
                    </tr>

                    {/* Mode & Date */}
                    <tr>
                      <td className="p-3 sm:p-4 font-bold text-slate-600">Mode &amp; Date</td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 bg-blue-50/20">
                        <div className="space-y-0.5">
                          <span className="bg-slate-200 text-slate-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            {attempt1.mode}
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium mt-1">
                            {new Date(attempt1.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 bg-purple-50/20">
                        <div className="space-y-0.5">
                          <span className="bg-slate-200 text-slate-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            {attempt2.mode}
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium mt-1">
                            {new Date(attempt2.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </td>
                    </tr>

                    {/* Total Score */}
                    <tr>
                      <td className="p-3 sm:p-4 font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Total Score</span>
                      </td>
                      <td className={`p-3 sm:p-4 border-l border-slate-100 font-black text-sm bg-blue-50/20 ${
                        attempt1.score >= attempt2.score ? 'text-emerald-600 font-extrabold' : 'text-slate-800'
                      }`}>
                        {attempt1.score.toFixed(2)} Marks
                      </td>
                      <td className={`p-3 sm:p-4 border-l border-slate-100 font-black text-sm bg-purple-50/20 ${
                        attempt2.score >= attempt1.score ? 'text-emerald-600 font-extrabold' : 'text-slate-800'
                      }`}>
                        {attempt2.score.toFixed(2)} Marks
                      </td>
                    </tr>

                    {/* Accuracy */}
                    <tr>
                      <td className="p-3 sm:p-4 font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span>Accuracy Rate</span>
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-slate-900 bg-blue-50/20">
                        {attempt1.accuracy}%
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-slate-900 bg-purple-50/20">
                        {attempt2.accuracy}%
                      </td>
                    </tr>

                    {/* Correct Answers */}
                    <tr>
                      <td className="p-3 sm:p-4 font-bold text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct Answers</span>
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-emerald-700 bg-blue-50/20">
                        {attempt1.correctCount}
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-emerald-700 bg-purple-50/20">
                        {attempt2.correctCount}
                      </td>
                    </tr>

                    {/* Incorrect Answers */}
                    <tr>
                      <td className="p-3 sm:p-4 font-bold text-slate-600 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect Answers</span>
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-rose-600 bg-blue-50/20">
                        {attempt1.incorrectCount}
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-black text-rose-600 bg-purple-50/20">
                        {attempt2.incorrectCount}
                      </td>
                    </tr>

                    {/* Unattempted */}
                    <tr>
                      <td className="p-3 sm:p-4 font-bold text-slate-600">Unattempted / Skipped</td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-bold text-slate-600 bg-blue-50/20">
                        {attempt1.unattemptedCount}
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-bold text-slate-600 bg-purple-50/20">
                        {attempt2.unattemptedCount}
                      </td>
                    </tr>

                    {/* Time Spent */}
                    <tr>
                      <td className="p-3 sm:p-4 font-bold text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Time Spent</span>
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-bold text-slate-800 bg-blue-50/20">
                        {formatTime(attempt1.timeSpentSeconds)}
                      </td>
                      <td className="p-3 sm:p-4 border-l border-slate-100 font-bold text-slate-800 bg-purple-50/20">
                        {formatTime(attempt2.timeSpentSeconds)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedCompareIds([])}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl transition-colors"
              >
                Reset Selection
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
