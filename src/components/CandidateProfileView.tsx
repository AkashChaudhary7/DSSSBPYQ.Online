import React, { useState, useEffect } from 'react';
import { 
  User, Copy, Check, Download, Upload, RefreshCw, Award, Target, 
  BookOpen, Star, AlertTriangle, ShieldCheck, Sparkles, FileJson, 
  Key, ArrowLeft, CheckCircle2, ChevronRight, Laptop, 
  Trash2, FileText, Zap, Trophy, Flame, BarChart3, Loader2, Share2
} from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';
import { 
  UserProfile, 
  AVATAR_OPTIONS, 
  TARGET_EXAM_OPTIONS, 
  saveUserProfile, 
  downloadProfileBackup, 
  generateSyncCode, 
  decodeSyncCode, 
  importUserDataPackage,
  computeProfileStats,
} from '../lib/userProfile';
import { Attempt, Bookmark, Question } from '../types';
import { getUserCoins } from '../lib/rewardsSystem';
import { downloadComprehensiveDiagnosticPdf } from '../lib/pdfReportGenerator';

interface CandidateProfileViewProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
  attempts: Attempt[];
  bookmarks: Bookmark[];
  missedQuestions: Question[];
  questionPerformance: Record<string, any>;
  onDataImported: (restoredData: any) => void;
  onClearAllData: () => void;
  onBack: () => void;
  onNavigateToView?: (view: any) => void;
  onShareAchievement?: () => void;
}

export default function CandidateProfileView({
  profile,
  onProfileUpdate,
  attempts,
  bookmarks,
  missedQuestions,
  questionPerformance,
  onDataImported,
  onClearAllData,
  onBack,
  onNavigateToView,
  onShareAchievement
}: CandidateProfileViewProps) {
  // Profile Form States
  const [usernameInput, setUsernameInput] = useState(profile.username || 'Candidate');
  const [targetExamInput, setTargetExamInput] = useState(profile.targetExam || TARGET_EXAM_OPTIONS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || 'avatar_1');
  const [bioInput, setBioInput] = useState(profile.bio || '');

  // UI Toast & Feedback States
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [userCoins] = useState<number>(getUserCoins);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState<string | null>(null);

  // Sync / Import States
  const [syncCodeInput, setSyncCodeInput] = useState<string>('');
  const [importMergeMode, setImportMergeMode] = useState<'merge' | 'overwrite'>('merge');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setUsernameInput(profile.username || 'Candidate');
    setTargetExamInput(profile.targetExam || TARGET_EXAM_OPTIONS[0]);
    setSelectedAvatar(profile.avatar || 'avatar_1');
    setBioInput(profile.bio || '');
  }, [profile]);

  const stats = computeProfileStats(attempts, bookmarks, missedQuestions, questionPerformance);
  const currentAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const updated = saveUserProfile({
      ...profile,
      username: usernameInput.trim(),
      targetExam: targetExamInput,
      avatar: selectedAvatar,
      bio: bioInput.trim()
    });

    onProfileUpdate(updated);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleDownloadPdfReport = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfProgressText('Compiling candidate score data...');
      await downloadComprehensiveDiagnosticPdf(
        profile,
        attempts,
        bookmarks,
        missedQuestions,
        (progress) => setPdfProgressText(progress)
      );
      setPdfProgressText('PDF Downloaded successfully!');
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgressText(null);
      }, 2000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setIsGeneratingPdf(false);
      setPdfProgressText('Failed to generate PDF. Please retry.');
      setTimeout(() => setPdfProgressText(null), 3000);
    }
  };

  const handleExportBackup = () => {
    downloadProfileBackup(profile);
  };

  const handleApplySyncCode = () => {
    if (!syncCodeInput.trim()) {
      setImportStatus({ type: 'error', message: 'Please paste a valid sync code first.' });
      return;
    }

    try {
      const decodedPkg = decodeSyncCode(syncCodeInput);
      const result = importUserDataPackage(decodedPkg, importMergeMode);
      onDataImported(result);
      setImportStatus({
        type: 'success',
        message: `Sync successful! Restored ${result.pastAttempts.length} tests and profile data.`
      });
      setSyncCodeInput('');
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Failed to decode sync code. Please verify text.'
      });
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || !parsed.profile) {
          throw new Error("Invalid backup file structure.");
        }
        const result = importUserDataPackage(parsed, importMergeMode);
        onDataImported(result);
        setImportStatus({
          type: 'success',
          message: `Backup restored! Loaded ${result.pastAttempts.length} mock attempts.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: err.message || 'Failed to parse JSON backup file.'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-3 sm:px-6 transition-colors duration-200">
      
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Single Column Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-white dark:border-slate-800">
                  {currentAvatar.icon ? (
                    <span>{currentAvatar.icon}</span>
                  ) : (
                    <span>{usernameInput.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {profile.username || 'Candidate Profile'}
                  </h1>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded-md">
                    Candidate
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {profile.targetExam || 'DSSSB TGT Computer Science'}
                </p>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>ID: {profile.profileId}</span>
                  <button
                    onClick={() => handleCopy(profile.profileId, 'profileId')}
                    className="hover:text-indigo-600 cursor-pointer"
                    title="Copy Profile ID"
                  >
                    {copiedKey === 'profileId' ? <Check className="w-3 h-3 text-emerald-500 inline" /> : <Copy className="w-3 h-3 inline" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onShareAchievement && (
                <button
                  onClick={onShareAchievement}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Card</span>
                </button>
              )}
              <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5">
                <span>🪙</span>
                <span>{userCoins} Coins</span>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 1: PERFORMANCE OVERVIEW & DOWNLOAD FULL REPORT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Performance Overview</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-bold">
              Updated Live from CBT Practice
            </span>
          </div>

          {/* 3 Core Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            
            {/* Total Mocks */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Total Mocks
              </span>
              <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {attempts.length}
              </p>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">
                Tests completed
              </span>
            </div>

            {/* Questions Solved */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Questions Solved
              </span>
              <p className="text-xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {stats.totalQuestionsAnswered}
              </p>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">
                MCQs practiced
              </span>
            </div>

            {/* Avg Accuracy */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Avg Accuracy
              </span>
              <p className="text-xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.avgAccuracy}%
              </p>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block mt-0.5">
                Scoring rate
              </span>
            </div>

          </div>

          {/* Curiosity-Building Diagnostic Report Preview & Download Action Box */}
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Personalized 4-Page CBT Diagnostic Dossier Ready
                </div>
                
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Download Complete Candidate Diagnostic & Study Plan PDF
                </h3>

                <p className="text-xs text-indigo-100/80 leading-relaxed">
                  Includes your calculated projected CBT exam score out of 200, Part A & Part B qualification status, weak module breakdown, and personalized 30-day master timetable.
                </p>

                {/* Curiosity Teasers */}
                <div className="flex items-center gap-3 pt-1 text-[11px] text-indigo-200 font-semibold flex-wrap">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Executive Scorecard
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 13-Module Matrix
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 30-Day Master Timetable
                  </span>
                </div>
              </div>

              {/* Download Action */}
              <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end gap-2">
                <button
                  onClick={handleDownloadPdfReport}
                  disabled={isGeneratingPdf}
                  className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-900" />
                      <span>Download Full Report (PDF)</span>
                    </>
                  )}
                </button>

                {pdfProgressText && (
                  <span className="text-[10px] text-amber-200 font-bold text-center md:text-right animate-pulse">
                    {pdfProgressText}
                  </span>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* SECTION 2: EDIT PERSONAL DETAILS (INLINE SINGLE COLUMN) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Edit Personal Details</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-bold">
              Profile Customization
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name / Aspirant Alias
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g., Anjali Sharma, Rahul Verma"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Target Exam Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target DSSSB Examination
              </label>
              <select
                value={targetExamInput}
                onChange={(e) => setTargetExamInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {TARGET_EXAM_OPTIONS.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Choose Aspirant Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-3 rounded-xl border text-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === avatar.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-white shadow-xs scale-105'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{avatar.icon}</span>
                    <span className="text-[9px] font-bold text-slate-500 mt-1">{avatar.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bio Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Goal & Aspirant Notes
              </label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="e.g. Aiming for 145+ Marks in DSSSB TGT CS 2026! Daily 50 MCQs target."
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>

          </form>

        </div>

        {/* SECTION 3: CLOUD SYNC & DATA BACKUP (INLINE) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cross-Device Cloud Sync & Backup</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-bold">
              Zero Data Loss
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* One-Click Sync Code Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>One-Click Sync Code</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Transfer all your test history, scores & bookmarks to your laptop or phone instantly without logging in.
              </p>
              
              <button
                onClick={() => {
                  const code = generateSyncCode(profile);
                  handleCopy(code, 'syncCode');
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedKey === 'syncCode' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'syncCode' ? 'Sync Code Copied!' : 'Copy Device Sync Code'}</span>
              </button>
            </div>

            {/* Paste & Restore Sync Code */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Restore on This Device</span>
              </h3>
              <input
                type="text"
                value={syncCodeInput}
                onChange={(e) => setSyncCodeInput(e.target.value)}
                placeholder="Paste sync code here..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                onClick={handleApplySyncCode}
                className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Apply & Restore Data
              </button>
            </div>

          </div>

          {/* Import / Export JSON Files */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Backup</span>
              </button>

              <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>
            </div>

            {/* Clear All Data */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Profile Data</span>
            </button>
          </div>

          {importStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {importStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{importStatus.message}</span>
            </div>
          )}

        </div>

      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Reset All Practice Data?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will delete all your local mock attempts, bookmarks, and mistake logs. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
