import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Gift, 
  QrCode,
  Award,
  Layers
} from 'lucide-react';

interface ScorecardShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  referralCode: string;
  initialMode?: 'part-wise' | 'subject-wise' | 'combined';
  predictiveInsights: {
    partAAvg: number;
    partBAvg: number;
    projectedScore: number;
    clearingChance: number;
    statusLabel: string;
    partACleared: boolean;
    partBCleared: boolean;
    advice: string;
  };
  subjectBreakdown: Array<{
    subjectName: string;
    category: string;
    attempts: number;
    avgScore: string;
    avgAccuracy: number;
    strength: string;
  }>;
  stats: {
    totalAttempts: number;
    avgScore: string | number;
    avgAccuracy: number;
    bestScore: number;
  };
}

export const ScorecardShareModal: React.FC<ScorecardShareModalProps> = ({
  isOpen,
  onClose,
  candidateName = 'DSSSB Aspirant',
  referralCode,
  initialMode = 'part-wise',
  predictiveInsights,
  subjectBreakdown,
  stats
}) => {
  const [mode, setMode] = useState<'part-wise' | 'subject-wise' | 'combined'>(initialMode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRenderingImage, setIsRenderingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dsssbpyq.online';
  const referralLink = `${currentOrigin}/?ref=${referralCode}`;

  const shareText = `🎯 My DSSSB TGT/PGT CS Mock Analytics:
📊 Projected CBT Score: ${predictiveInsights.projectedScore}/200
⚡ Selection Probability: ${predictiveInsights.clearingChance}%
✅ Part A Avg: ${predictiveInsights.partAAvg}/100 (${predictiveInsights.partACleared ? 'Cutoff Cleared' : 'Needs Work'})
✅ Part B CS Avg: ${predictiveInsights.partBAvg}/100 (${predictiveInsights.partBCleared ? 'Cutoff Cleared' : 'Needs Work'})

Practice with me on BytePrep! Use my referral code "${referralCode}" for an instant discount on All-Mock Pass:
👉 ${referralLink}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // High-Resolution Canvas Graphic Renderer
  const handleDownloadImage = () => {
    setIsRenderingImage(true);
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = mode === 'combined' ? 1400 : 1150;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsRenderingImage(false);
      return;
    }

    // 1. Sleek Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header Emblem
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('🏛️ DELHI SUBORDINATE SERVICES SELECTION BOARD (DSSSB)', 60, 80);

    // Main Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.fillText('TGT & PGT Computer Science 2026', 60, 135);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = '600 24px system-ui, sans-serif';
    ctx.fillText('Official CBT Mock Performance & Sectional Cutoff Scorecard', 60, 175);

    // Divider Line
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 205);
    ctx.lineTo(width - 60, 205);
    ctx.stroke();

    // Candidate Info Badge
    ctx.fillStyle = '#1e1b4b';
    ctx.roundRect?.(60, 230, width - 120, 90, 20);
    ctx.fill();
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 2;
    ctx.roundRect?.(60, 230, width - 120, 90, 20);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(`Candidate: ${candidateName}`, 90, 285);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(`Attempts: ${stats.totalAttempts} Tests | Avg Accuracy: ${stats.avgAccuracy}%`, width - 540, 285);

    let currentY = 360;

    // PART-WISE ANALYSIS SECTION
    if (mode === 'part-wise' || mode === 'combined') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('🎯 Part-Wise Sectional Score Radar (40% Cutoff Check)', 60, currentY);
      currentY += 45;

      // Box 1: Part A Card
      ctx.fillStyle = '#1e293b';
      ctx.roundRect?.(60, currentY, 460, 180, 20);
      ctx.fill();
      ctx.strokeStyle = predictiveInsights.partACleared ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.roundRect?.(60, currentY, 460, 180, 20);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('PART A (GENERAL SECTION)', 90, currentY + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px system-ui, sans-serif';
      ctx.fillText(`${predictiveInsights.partAAvg}`, 90, currentY + 110);
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('/ 100 Marks', 230, currentY + 110);

      ctx.fillStyle = predictiveInsights.partACleared ? '#34d399' : '#fb7185';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText(predictiveInsights.partACleared ? '✓ Cutoff Cleared (≥40)' : '✗ Cutoff Pending (<40)', 90, currentY + 150);

      // Box 2: Part B Domain Card
      ctx.fillStyle = '#1e293b';
      ctx.roundRect?.(560, currentY, 460, 180, 20);
      ctx.fill();
      ctx.strokeStyle = predictiveInsights.partBCleared ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 3;
      ctx.roundRect?.(560, currentY, 460, 180, 20);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('PART B (COMPUTER SCIENCE)', 590, currentY + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px system-ui, sans-serif';
      ctx.fillText(`${predictiveInsights.partBAvg}`, 590, currentY + 110);
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('/ 100 Marks', 730, currentY + 110);

      ctx.fillStyle = predictiveInsights.partBCleared ? '#34d399' : '#fb7185';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText(predictiveInsights.partBCleared ? '✓ Cutoff Cleared (≥40)' : '✗ Cutoff Pending (<40)', 590, currentY + 150);

      currentY += 210;

      // Projected Score & Probability Bar
      ctx.fillStyle = '#111827';
      ctx.roundRect?.(60, currentY, width - 120, 110, 20);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.roundRect?.(60, currentY, width - 120, 110, 20);
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText(`Projected CBT Score: ${predictiveInsights.projectedScore} / 200`, 90, currentY + 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(`Selection Probability: ${predictiveInsights.clearingChance}% (${predictiveInsights.statusLabel})`, 90, currentY + 88);

      currentY += 140;
    }

    // SUBJECT-WISE ANALYSIS SECTION
    if (mode === 'subject-wise' || mode === 'combined') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('📊 Subject-Wise Average Scores & Mastery', 60, currentY);
      currentY += 40;

      const topSubjects = subjectBreakdown.slice(0, 4);
      topSubjects.forEach((sub) => {
        ctx.fillStyle = '#1e293b';
        ctx.roundRect?.(60, currentY, width - 120, 65, 14);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(sub.subjectName, 90, currentY + 40);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`Avg: ${sub.avgScore} Marks`, width - 420, currentY + 40);

        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`${sub.avgAccuracy}% Acc`, width - 210, currentY + 40);

        currentY += 80;
      });
    }

    // REFERRAL LINK FOOTER BANNER ON GRAPHIC
    const footerY = height - 210;
    ctx.fillStyle = '#31104b';
    ctx.roundRect?.(60, footerY, width - 120, 160, 24);
    ctx.fill();
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 3;
    ctx.roundRect?.(60, footerY, width - 120, 160, 24);
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 28px system-ui, sans-serif';
    ctx.fillText('🎁 Practice With Me on BytePrep! Use My Referral Code For Discount', 90, footerY + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`Code: ${referralCode}`, 90, footerY + 100);

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`Direct Link: ${referralLink}`, 90, footerY + 135);

    // Generate Downloadable Image File
    try {
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `dsssb-analytics-${referralCode}.png`;
      a.click();
    } catch (e) {
      console.error('Image export error:', e);
    }

    setIsRenderingImage(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-400 dark:border-indigo-600 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-amber-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                VIRAL REFERRAL SCORECARD
              </span>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                Share Analytics Graphic with Referral Link
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setMode('part-wise')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'part-wise'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Part-Wise Cutoff Graphic
            </button>
            <button
              onClick={() => setMode('subject-wise')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'subject-wise'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Subject Mastery Graphic
            </button>
            <button
              onClick={() => setMode('combined')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'combined'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Full Scorecard
            </button>
          </div>

          {/* Graphic Visual Live Preview Card */}
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-indigo-500/50 shadow-xl space-y-4">
            
            {/* Top Emblem & Brand */}
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">
                  🏛️ DSSSB TGT/PGT CS CBT 2026
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Official CBT Analytics &amp; Cutoff Predictor
                </h3>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-800">
                {candidateName}
              </span>
            </div>

            {/* Content Based on Mode */}
            {(mode === 'part-wise' || mode === 'combined') && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 block">
                  Part-Wise Mandatory 40% Cutoff Radar
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-300">Part A (General)</span>
                    <div className="text-xl font-black text-white">{predictiveInsights.partAAvg} <span className="text-xs text-slate-400 font-bold">/ 100</span></div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${predictiveInsights.partACleared ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'}`}>
                      {predictiveInsights.partACleared ? '✓ Cutoff Cleared' : '✗ Cutoff Pending'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-300">Part B (CS Domain)</span>
                    <div className="text-xl font-black text-white">{predictiveInsights.partBAvg} <span className="text-xs text-slate-400 font-bold">/ 100</span></div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${predictiveInsights.partBCleared ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'}`}>
                      {predictiveInsights.partBCleared ? '✓ Cutoff Cleared' : '✗ Cutoff Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-amber-400/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">Projected CBT Merit Score</span>
                    <span className="text-lg font-black text-amber-300">{predictiveInsights.projectedScore} / 200 Marks</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">Chance of Selection</span>
                    <span className="text-lg font-black text-emerald-400">{predictiveInsights.clearingChance}%</span>
                  </div>
                </div>
              </div>
            )}

            {(mode === 'subject-wise' || mode === 'combined') && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300 block">
                  Subject Mastery Average Scores
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {subjectBreakdown.slice(0, 4).map((sub, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/10 border border-white/10 flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">{sub.subjectName}</span>
                      <span className="font-black text-cyan-300 shrink-0 ml-1">{sub.avgScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Referral Banner with Candidate Referral Link */}
            <div className="p-3.5 rounded-xl bg-purple-950/80 border-2 border-purple-400/70 text-center space-y-1">
              <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-300" />
                <span>Prepare with me on BytePrep! Use my referral code:</span>
              </span>
              <div className="inline-block px-3 py-1 bg-white text-purple-950 rounded-lg text-sm font-black font-mono tracking-wider shadow-sm">
                {referralCode}
              </div>
              <p className="text-[10px] text-purple-200 font-semibold truncate">
                {referralLink}
              </p>
            </div>

          </div>

          {/* Share Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleDownloadImage}
              disabled={isRenderingImage}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>{isRenderingImage ? 'Generating High-Res Image...' : 'Download Scorecard Graphic (PNG)'}</span>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Telegram</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ScorecardShareModal;
