import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  User, 
  KeyRound, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Ticket, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import { ReportedQuestionRecord } from '../types';
import { cleanOptionText } from '../lib/formatText';
import { 
  createAdminActivationCode, 
  seedDefaultReactivationCodesInDb, 
  PassPlanType 
} from '../lib/passSystem';
import { 
  subscribeToAllActivationCodes, 
  revokeActivationCodeInDb, 
  FirestoreActivationCode 
} from '../lib/firebase';

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
  const [activeTab, setActiveTab] = useState<'reports' | 'codes'>('reports');

  // Reported Questions Tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');

  // Reactivation Code Generator Tab state
  const [customCode, setCustomCode] = useState('AK007850');
  const [useAutoCode, setUseAutoCode] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PassPlanType>('lifetime_99');
  const [maxUses, setMaxUses] = useState<number>(5);
  const [hoursValid, setHoursValid] = useState<number>(0); // 0 = No expiry
  const [isGenerating, setIsGenerating] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Firestore Activation Codes state
  const [activationCodes, setActivationCodes] = useState<FirestoreActivationCode[]>([]);
  const [codeSearchTerm, setCodeSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Subscribe to real-time activation codes when modal opens or tab switches
  useEffect(() => {
    if (!isOpen) return;

    // Run initial seed check for default codes (AK007850 & AK007851) silently in background
    seedDefaultReactivationCodesInDb().then((res) => {
      if (res.seeded && res.seeded.length > 0) {
        setSeedNotice(`Auto-provisioned default codes in Firestore: ${res.seeded.join(', ')}`);
      }
    }).catch(() => {});

    const unsubscribe = subscribeToAllActivationCodes((codes) => {
      setActivationCodes(codes);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, activeTab]);

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

  // Filtered Codes
  const filteredCodes = activationCodes.filter(c => {
    if (!codeSearchTerm.trim()) return true;
    const term = codeSearchTerm.toLowerCase();
    return (
      (c.code || '').toLowerCase().includes(term) ||
      (c.targetCandidate || '').toLowerCase().includes(term) ||
      (c.plan || '').toLowerCase().includes(term) ||
      (c.status || '').toLowerCase().includes(term)
    );
  });

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setFormFeedback(null);

    const res = await createAdminActivationCode({
      customCode: useAutoCode ? undefined : customCode,
      plan: selectedPlan,
      maxUses: Math.max(1, maxUses),
      hoursValid: hoursValid > 0 ? hoursValid : undefined,
      targetCandidate: targetCandidate.trim() || undefined
    });

    setIsGenerating(false);
    if (res.success) {
      setFormFeedback({ text: res.message, isError: false });
      if (!useAutoCode) {
        setCustomCode('');
      }
      setTargetCandidate('');
    } else {
      setFormFeedback({ text: res.message || 'Failed to generate code.', isError: true });
    }
  };

  const handleManualSeed = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    const res = await seedDefaultReactivationCodesInDb();
    setIsSeeding(false);
    if (res.success) {
      if (res.seeded.length > 0) {
        setSeedNotice(`Successfully provisioned official reactivation codes in Firestore: ${res.seeded.join(', ')}`);
      } else {
        setSeedNotice('Official reactivation codes (AK007850 & AK007851 - 5 Uses Each) are already active in Firestore.');
      }
    } else {
      setSeedNotice('Unable to connect to Firestore database.');
    }
    setTimeout(() => setSeedNotice(null), 6000);
  };

  const handleRevokeCode = async (codeStr: string) => {
    if (!window.confirm(`Are you sure you want to revoke code "${codeStr}"? Users will no longer be able to use it.`)) return;
    await revokeActivationCodeInDb(codeStr);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Question & Pass Admin Control Center
                </h2>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Audit Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Manage flagged question reports &amp; generate secure one-time pass reactivation codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Reported Question Audit ({validReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'codes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Reactivation Code Generator ({activationCodes.length})</span>
          </button>
        </div>

        {/* TAB 1: REPORTED QUESTIONS AUDIT */}
        {activeTab === 'reports' && (
          <>
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
                  {validReports.length > 0 && (
                    <button
                      onClick={onClearAllReports}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ml-1"
                      title="Clear all reported records"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  )}
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
          </>
        )}

        {/* TAB 2: REACTIVATION CODE GENERATOR */}
        {activeTab === 'codes' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Official Seed Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500 shrink-0" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Official Pass Reactivation Codes
                  </h3>
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    AK007850 &amp; AK007851 (5 Uses Each)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  These codes enable candidates who lost subscription access to reactivate their Lifetime VIP Pass up to 5 times.
                </p>
                {seedNotice && (
                  <p className="text-xs text-emerald-600 font-bold animate-fadeIn pt-1">
                    ✓ {seedNotice}
                  </p>
                )}
              </div>

              <button
                onClick={handleManualSeed}
                disabled={isSeeding}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>Sync Official Codes in Firestore</span>
              </button>
            </div>

            {/* Code Generator Form Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>Generate One-Time / Multi-Use Activation Code</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={useAutoCode}
                    onChange={(e) => setUseAutoCode(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Auto-Generate Random Code</span>
                </label>
              </div>

              <form onSubmit={handleGenerateCode} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  
                  {/* Code String Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Code String
                    </label>
                    <input
                      type="text"
                      disabled={useAutoCode}
                      value={useAutoCode ? '[Auto Generated]' : customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AK007850, RESTORE99"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-hidden focus:border-amber-500 disabled:opacity-50 uppercase"
                    />
                  </div>

                  {/* Plan Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Pass Plan
                    </label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value as PassPlanType)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="lifetime_99">Lifetime VIP Pass (₹99 - All Mocks Forever)</option>
                      <option value="standard_49">3 Months Pass (₹49 - 90 Days)</option>
                      <option value="monthly_19">1 Month Pass (₹19 - 30 Days)</option>
                    </select>
                  </div>

                  {/* Max Redemption Limit */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Reactivation Limit (Uses)
                    </label>
                    <select
                      value={maxUses}
                      onChange={(e) => setMaxUses(parseInt(e.target.value, 10))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                    >
                      <option value={1}>1 Use (One-Time Single Redemption)</option>
                      <option value={5}>5 Uses (Reactivation Code Limit)</option>
                      <option value={10}>10 Uses (Multi-User Recovery)</option>
                      <option value={50}>50 Uses (Promo Distribution)</option>
                      <option value={100}>100 Uses (Batch Promo)</option>
                    </select>
                  </div>

                  {/* Target Candidate / Note */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Candidate Details / Admin Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={targetCandidate}
                      onChange={(e) => setTargetCandidate(e.target.value)}
                      placeholder="Candidate Name, Phone Number, or Reason for reactivation..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {/* Expiry Hours */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Validity Period
                    </label>
                    <select
                      value={hoursValid}
                      onChange={(e) => setHoursValid(parseInt(e.target.value, 10))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                    >
                      <option value={0}>Never Expires (Permanent)</option>
                      <option value={24}>Valid for 24 Hours</option>
                      <option value={72}>Valid for 3 Days (72 Hours)</option>
                      <option value={168}>Valid for 7 Days</option>
                      <option value={720}>Valid for 30 Days</option>
                    </select>
                  </div>
                </div>

                {formFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    formFeedback.isError 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {formFeedback.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span>{formFeedback.text}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isGenerating || (!useAutoCode && !customCode.trim())}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating & Saving...' : 'Generate & Save to Firestore'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Firestore Live Codes Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-amber-500" />
                    <span>Live Activation &amp; Reactivation Codes in Database</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time list of all codes stored in Firestore
                  </p>
                </div>

                {/* Code Search Input */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter codes..."
                    value={codeSearchTerm}
                    onChange={(e) => setCodeSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {filteredCodes.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  No activation codes found matching your search. Generate your first code above or click "Sync Official Codes in Firestore".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredCodes.map((item) => {
                    const isOfficialCode = item.code === 'AK007850' || item.code === 'AK007851';
                    const isFullyUsed = item.usedCount >= item.maxUses || item.status === 'used';
                    const isExpired = item.expiresAt ? Date.now() > item.expiresAt : false;
                    const isRevoked = item.status === 'revoked';

                    return (
                      <div
                        key={item.code}
                        className={`bg-white dark:bg-slate-800 border-2 rounded-2xl p-4 space-y-2.5 transition-all shadow-xs relative ${
                          isOfficialCode 
                            ? 'border-amber-400 dark:border-amber-600/80 bg-amber-50/20 dark:bg-amber-950/20'
                            : isRevoked 
                            ? 'border-rose-200 dark:border-rose-900/40 opacity-60'
                            : isFullyUsed || isExpired
                            ? 'border-slate-200 dark:border-slate-700 opacity-75'
                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                              {item.code}
                            </span>
                            
                            {isOfficialCode && (
                              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                                Official 5-Use Code
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyCode(item.code)}
                              className="bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 p-1.5 rounded-lg transition-all cursor-pointer"
                              title="Copy code to clipboard"
                            >
                              {copiedCode === item.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {!isRevoked && (
                              <button
                                onClick={() => handleRevokeCode(item.code)}
                                className="bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-500 text-rose-600 hover:text-white p-1.5 rounded-lg transition-all cursor-pointer border border-rose-200 dark:border-rose-900/60"
                                title="Revoke this code"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status & Usage Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500 dark:text-slate-400">
                              Usage: <strong className="text-slate-800 dark:text-slate-200">{item.usedCount} / {item.maxUses} Uses</strong>
                            </span>
                            
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isRevoked 
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : isExpired
                                ? 'bg-slate-100 text-slate-600 border border-slate-300'
                                : isFullyUsed
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {isRevoked ? 'Revoked' : isExpired ? 'Expired' : isFullyUsed ? 'Limit Reached' : 'Active'}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isRevoked 
                                  ? 'bg-rose-500' 
                                  : isFullyUsed 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.round((item.usedCount / Math.max(1, item.maxUses)) * 100))}%` }}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <div>
                            <strong>Plan:</strong> {item.plan === 'lifetime_99' ? 'Lifetime VIP Pass (₹99)' : item.plan === 'standard_49' ? '3 Months Pass (₹49)' : '1 Month Pass (₹19)'}
                          </div>
                          {item.targetCandidate && (
                            <div><strong>Note:</strong> {item.targetCandidate}</div>
                          )}
                          <div>
                            <strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()} {item.createdBy ? `by ${item.createdBy}` : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>Password Protected Question &amp; Pass Admin Portal • BytePrep</span>
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
