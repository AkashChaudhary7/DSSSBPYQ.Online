import React, { useState, useEffect } from 'react';
import { 
  User, Copy, Check, Download, Upload, RefreshCw, Award, Target, 
  BookOpen, Star, AlertTriangle, ShieldCheck, Sparkles, FileJson, 
  Key, X, HelpCircle, CheckCircle2, ChevronRight, Laptop, ArrowRight, ShieldAlert,
  Trash2, FileText
} from 'lucide-react';
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
  UserProgressBackupPackage
} from '../lib/userProfile';
import { Attempt, Bookmark, Question } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
  attempts: Attempt[];
  bookmarks: Bookmark[];
  missedQuestions: Question[];
  questionPerformance: Record<string, any>;
  onDataImported: (restoredData: any) => void;
  onClearAllData: () => void;
  onShareAchievement?: () => void;
  onOpenFullProfile?: () => void;
  onOpenReport?: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
  attempts,
  bookmarks,
  missedQuestions,
  questionPerformance,
  onDataImported,
  onClearAllData,
  onShareAchievement,
  onOpenFullProfile,
  onOpenReport
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'sync' | 'badges'>('profile');

  // Profile Form States
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [targetExamInput, setTargetExamInput] = useState(profile.targetExam);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [bioInput, setBioInput] = useState(profile.bio || '');

  // UI Toast & Feedback States
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

  // Sync / Import States
  const [syncCodeInput, setSyncCodeInput] = useState<string>('');
  const [importMergeMode, setImportMergeMode] = useState<'merge' | 'overwrite'>('merge');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setUsernameInput(profile.username);
    setTargetExamInput(profile.targetExam);
    setSelectedAvatar(profile.avatar);
    setBioInput(profile.bio || '');
  }, [profile]);

  if (!isOpen) return null;

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

  const handleExportFile = () => {
    downloadProfileBackup(profile);
  };

  const handleCopySyncCode = () => {
    try {
      const code = generateSyncCode(profile);
      handleCopy(code, 'sync_code');
    } catch (err) {
      setImportStatus({ type: 'error', message: 'Failed to generate sync code. Please try downloading JSON file instead.' });
    }
  };

  const handleImportSyncCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncCodeInput.trim()) return;

    try {
      const pkg = decodeSyncCode(syncCodeInput.trim());
      const restored = importUserDataPackage(pkg, importMergeMode);
      onDataImported(restored);
      setImportStatus({
        type: 'success',
        message: `Successfully synced profile (${restored.profile.username}) with ${restored.pastAttempts.length} tests and ${restored.savedBookmarks.length} bookmarks!`
      });
      setSyncCodeInput('');
    } catch (err: any) {
      setImportStatus({ type: 'error', message: err.message || 'Invalid sync code format.' });
    }
  };

  const processImportJsonFile = async (file: File) => {
    try {
      const text = await file.text();
      let pkg: UserProgressBackupPackage;
      try {
        pkg = JSON.parse(text);
      } catch (e) {
        throw new Error('The file is not a valid JSON document.');
      }

      const restored = importUserDataPackage(pkg, importMergeMode);
      onDataImported(restored);
      setImportStatus({
        type: 'success',
        message: `Successfully restored profile (${restored.profile.username}) with ${restored.pastAttempts.length} attempts!`
      });
    } catch (err: any) {
      setImportStatus({ type: 'error', message: err.message || 'Failed to parse JSON backup file.' });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportJsonFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImportJsonFile(e.target.files[0]);
    }
  };

  const stats = computeProfileStats(attempts, bookmarks, missedQuestions, questionPerformance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 md:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${currentAvatar.bg} flex items-center justify-center text-2xl shadow-md border border-white/20 shrink-0`}>
              {currentAvatar.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-black tracking-tight display-font text-white">{profile.username}</h2>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Key className="w-3 h-3 text-indigo-400" />
                  {profile.profileId}
                </span>
              </div>
              <p className="text-xs text-slate-300/80 font-medium">{profile.targetExam}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
                title="Open Multi-Page PDF Diagnostic Report"
              >
                <FileText className="w-3.5 h-3.5" /> PDF Report
              </button>
            )}

            {onOpenFullProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullProfile();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Open Candidate Profile in Full Page"
              >
                <Laptop className="w-3.5 h-3.5" /> Full Page
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile &amp; Identity
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'sync'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            Cross-Device Data Sync
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'badges'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Stats &amp; Badges ({stats.earnedBadges.filter(b => b.unlocked).length})
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: PROFILE EDITING */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Profile Identifier Card */}
              <div className="bg-slate-900 text-white p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Browser Local Profile ID</span>
                  <p className="font-mono text-sm md:text-base font-black text-amber-300">{profile.profileId}</p>
                  <p className="text-[11px] text-slate-400">
                    Associated locally on this browser. Created on {new Date(profile.createdAt).toLocaleDateString()}.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  {onShareAchievement && (
                    <button
                      type="button"
                      onClick={onShareAchievement}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Share Card</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(profile.profileId, 'profile_id')}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey === 'profile_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-300" />}
                    <span>{copiedKey === 'profile_id' ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">Choose Avatar</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedAvatar === av.id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span className="text-2xl">{av.icon}</span>
                      <span className="text-[10px] font-extrabold text-slate-700 truncate w-full text-center">{av.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Input Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 block">Display Name</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    placeholder="Enter candidate name..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 block">Target Exam Goal</label>
                  <select
                    value={targetExamInput}
                    onChange={(e) => setTargetExamInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                  >
                    {TARGET_EXAM_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 block">Target Tagline / Note</label>
                <input
                  type="text"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="e.g. Aiming for 140+ marks in DSSSB TGT CS CBT Exam."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Submit / Save Bar */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                {isSavedToast ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Profile details saved successfully!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Changes store immediately in browser local storage.</span>
                )}

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DATA SYNC & EXPORT / IMPORT */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              
              {/* Information Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 text-indigo-950 p-4 rounded-2xl flex items-start gap-3">
                <Laptop className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-indigo-900">Client-Side Cross-Device Synchronization</p>
                  <p className="text-indigo-800/90 leading-relaxed">
                    Since your progress (test history, scores, bookmarks, and mistake vault) is saved strictly inside browser Local Storage for speed and privacy, you can export your backup file or sync code to load your progress on another device or browser.
                  </p>
                </div>
              </div>

              {/* Toast / Status Message */}
              {importStatus && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2.5 animate-fadeIn ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : importStatus.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                }`}>
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-extrabold">{importStatus.type === 'success' ? 'Sync Successful!' : 'Sync Notice'}</p>
                    <p className="font-medium mt-0.5">{importStatus.message}</p>
                  </div>
                  <button onClick={() => setImportStatus(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mode Toggle (Merge vs Overwrite) */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 px-3">Sync Import Mode:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setImportMergeMode('merge')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      importMergeMode === 'merge' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Merge with Existing Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMergeMode('overwrite')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      importMergeMode === 'overwrite' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Replace All Local Data
                  </button>
                </div>
              </div>

              {/* Grid: Export vs Import Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. EXPORT SECTION */}
                <div className="border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 bg-white flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Download className="w-4 h-4" />
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Option A: Export Data</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Download a JSON backup file or copy a 1-click Quick Sync Code to transfer your tests, bookmarks, and scores.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleExportFile}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                    >
                      <FileJson className="w-4 h-4 text-emerald-400" />
                      Download .json Backup File
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySyncCode}
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {copiedKey === 'sync_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                      <span>{copiedKey === 'sync_code' ? 'Quick Sync Code Copied!' : 'Copy Quick Sync Code String'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. IMPORT SECTION */}
                <div className="border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 bg-white">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Upload className="w-4 h-4" />
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Option B: Import Data</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Upload your exported JSON backup file or paste your Quick Sync Code from another browser.
                    </p>
                  </div>

                  {/* Drag & Drop JSON File Box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-xl p-3 text-center transition-all relative ${
                      isDragOver ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1 pointer-events-none">
                      <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                        <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Upload .json Backup File</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Drag &amp; drop file here or click to browse</p>
                    </div>
                  </div>

                  {/* Paste Sync Code Box */}
                  <form onSubmit={handleImportSyncCodeSubmit} className="space-y-2 pt-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={syncCodeInput}
                        onChange={(e) => setSyncCodeInput(e.target.value)}
                        placeholder="Paste Quick Sync Code (DSSSB_SYNC_V1:...)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!syncCodeInput.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync Progress Now
                    </button>
                  </form>
                </div>
              </div>

              {/* Danger Zone: Clear Local Data */}
              <div className="border border-rose-100 bg-rose-50/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-rose-900">Reset Local Profile &amp; Data</p>
                  <p className="text-[11px] text-rose-700/80 font-medium">Clear attempts, saved bookmarks, and reset profile on this device.</p>
                </div>

                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-rose-200 transition-all cursor-pointer shrink-0"
                  >
                    Reset Data
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllData();
                        setShowClearConfirm(false);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-2.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STATS & BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              
              {/* Metric Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Tests Taken</span>
                  <p className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    {stats.totalTestsTaken}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Avg Accuracy</span>
                  <p className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-600" />
                    {stats.avgAccuracy}%
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Saved Bookmarks</span>
                  <p className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500" />
                    {stats.bookmarksCount}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Mistake Vault</span>
                  <p className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    {stats.mistakeVaultCount}
                  </p>
                </div>
              </div>

              {/* Earned Badges Grid */}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Achievements &amp; Badges
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.earnedBadges.map((badge, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                        badge.unlocked
                          ? 'bg-amber-50/40 border-amber-200/80 text-slate-900'
                          : 'bg-slate-50 border-slate-200/60 opacity-60 grayscale'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                        {badge.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-xs text-slate-800">{badge.name}</h4>
                          {badge.unlocked ? (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">Unlocked</span>
                          ) : (
                            <span className="bg-slate-200 text-slate-600 text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase">Locked</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
