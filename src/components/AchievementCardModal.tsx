import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Flame, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  Trophy, 
  Target, 
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface AchievementCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  profileId?: string;
  streakCount?: number;
  syllabusPercent?: number;
  syllabusCompletedCount?: number;
  syllabusTotalCount?: number;
  attemptsCount?: number;
  avgAccuracy?: number;
  targetExam?: string;
}

type CardTheme = 'cyber' | 'gold' | 'emerald' | 'sunset' | 'light';

export default function AchievementCardModal({
  isOpen,
  onClose,
  username = 'Candidate',
  streakCount = 0,
  syllabusPercent = 0,
  syllabusCompletedCount = 0,
  syllabusTotalCount = 101,
  attemptsCount = 0,
  avgAccuracy = 0,
  targetExam = 'DSSSB TGT Computer Science 2026'
}: AchievementCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('light');
  const [cardName, setCardName] = useState<string>(username);
  const [cardExam, setCardExam] = useState<string>(targetExam);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCardName(username || 'Candidate');
    setCardExam(targetExam || 'DSSSB TGT Computer Science 2026');
  }, [username, targetExam]);

  // Render Canvas whenever theme, cardName, cardExam, or metrics change
  useEffect(() => {
    if (!isOpen) return;
    renderCanvas();
  }, [isOpen, selectedTheme, cardName, cardExam, streakCount, syllabusPercent, syllabusCompletedCount, attemptsCount, avgAccuracy]);

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ) => {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    // Fallback implementation
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High Resolution Canvas (1200 x 675 - 16:9 social share standard)
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Theme Configs
    let bgGrad: CanvasGradient;
    let cardBg: string;
    let cardBorder: string;
    let textPrimary: string;
    let textSecondary: string;
    let accent1: string; // Streak color
    let accent2: string; // Syllabus color
    let badgeBg: string;
    let badgeText: string;

    if (selectedTheme === 'gold') {
      bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#020617');

      cardBg = 'rgba(255, 255, 255, 0.04)';
      cardBorder = 'rgba(245, 158, 11, 0.4)';
      textPrimary = '#ffffff';
      textSecondary = '#fbbf24';
      accent1 = '#f59e0b';
      accent2 = '#38bdf8';
      badgeBg = '#f59e0b';
      badgeText = '#090d16';
    } else if (selectedTheme === 'emerald') {
      bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#022c22');
      bgGrad.addColorStop(0.5, '#064e3b');
      bgGrad.addColorStop(1, '#0f172a');

      cardBg = 'rgba(255, 255, 255, 0.05)';
      cardBorder = 'rgba(16, 185, 129, 0.4)';
      textPrimary = '#ffffff';
      textSecondary = '#6ee7b7';
      accent1 = '#10b981';
      accent2 = '#fbbf24';
      badgeBg = '#10b981';
      badgeText = '#022c22';
    } else if (selectedTheme === 'sunset') {
      bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#4c0519');
      bgGrad.addColorStop(0.5, '#311b92');
      bgGrad.addColorStop(1, '#111827');

      cardBg = 'rgba(255, 255, 255, 0.05)';
      cardBorder = 'rgba(244, 63, 94, 0.4)';
      textPrimary = '#ffffff';
      textSecondary = '#fca5a5';
      accent1 = '#f97316';
      accent2 = '#ec4899';
      badgeBg = '#f43f5e';
      badgeText = '#ffffff';
    } else if (selectedTheme === 'light') {
      bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.5, '#eff6ff');
      bgGrad.addColorStop(1, '#e0e7ff');

      cardBg = '#ffffff';
      cardBorder = '#cbd5e1';
      textPrimary = '#0f172a';
      textSecondary = '#475569';
      accent1 = '#ea580c';
      accent2 = '#2563eb';
      badgeBg = '#4338ca';
      badgeText = '#ffffff';
    } else {
      // Cyber Indigo (Default)
      bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#311b92');

      cardBg = 'rgba(255, 255, 255, 0.05)';
      cardBorder = 'rgba(99, 102, 241, 0.4)';
      textPrimary = '#ffffff';
      textSecondary = '#c7d2fe';
      accent1 = '#f59e0b';
      accent2 = '#10b981';
      badgeBg = '#6366f1';
      badgeText = '#ffffff';
    }

    // Fill Outer Background
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Background Glow Circles
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // Circle 1
    const glow1 = ctx.createRadialGradient(200, 150, 10, 200, 150, 400);
    glow1.addColorStop(0, selectedTheme === 'light' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.25)');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(200, 150, 400, 0, Math.PI * 2);
    ctx.fill();

    // Circle 2
    const glow2 = ctx.createRadialGradient(1000, 500, 10, 1000, 500, 450);
    glow2.addColorStop(0, selectedTheme === 'light' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.2)');
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(1000, 500, 450, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Outer Framing Glass Border
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 30, 30, width - 60, height - 60, 32);
    ctx.stroke();

    // Fill Main Glass Card Box
    ctx.fillStyle = cardBg;
    if (selectedTheme === 'light') {
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
    }
    drawRoundedRect(ctx, 45, 45, width - 90, height - 90, 28);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // HEADER SECTION
    // Brand Pill Badge
    ctx.fillStyle = badgeBg;
    drawRoundedRect(ctx, 80, 80, 280, 42, 21);
    ctx.fill();

    ctx.fillStyle = badgeText;
    ctx.font = '900 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DSSSB PREP ONLINE 🎯', 220, 101);

    // Subtitle Badge
    ctx.fillStyle = textSecondary;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('dsssbpyq.online', width - 80, 101);

    // USER PROFILE SECTION
    // User Name
    ctx.fillStyle = textPrimary;
    ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const displayUser = cardName.trim() || 'Candidate';
    ctx.fillText(`Candidate: ${displayUser}`, 80, 148);

    // Exam Target Subtitle
    ctx.fillStyle = textSecondary;
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Target: ${cardExam}`, 80, 202);

    // MAIN STATS GRID - 2 GIANT CARDS (Streak + Syllabus)
    const gridY = 250;
    const gridWidth = 510;
    const gridHeight = 220;

    // CARD 1: STREAK COUNT
    ctx.save();
    ctx.fillStyle = selectedTheme === 'light' ? '#f1f5f9' : 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 80, gridY, gridWidth, gridHeight, 24);
    ctx.fill();
    ctx.stroke();

    // Streak Icon Header
    ctx.fillStyle = accent1;
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🔥 DAILY PREP STREAK', 110, gridY + 30);

    // Giant Streak Number
    ctx.fillStyle = textPrimary;
    ctx.font = '900 76px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${streakCount}`, 110, gridY + 68);

    // Streak Label
    ctx.fillStyle = textSecondary;
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DAYS ACTIVE IN A ROW!', 110, gridY + 152);
    ctx.restore();

    // CARD 2: SYLLABUS COMPLETION %
    ctx.save();
    ctx.fillStyle = selectedTheme === 'light' ? '#f1f5f9' : 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = accent2;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 610, gridY, gridWidth, gridHeight, 24);
    ctx.fill();
    ctx.stroke();

    // Syllabus Icon Header
    ctx.fillStyle = accent2;
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚡ SYLLABUS COVERAGE', 640, gridY + 30);

    // Giant Syllabus Percent Number
    ctx.fillStyle = textPrimary;
    ctx.font = '900 76px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${syllabusPercent}%`, 640, gridY + 68);

    // Syllabus Progress Bar inside card
    const barX = 640;
    const barY = gridY + 158;
    const barW = 450;
    const barH = 16;

    ctx.fillStyle = selectedTheme === 'light' ? '#cbd5e1' : '#334155';
    drawRoundedRect(ctx, barX, barY, barW, barH, 8);
    ctx.fill();

    const filledW = Math.max(12, (Math.min(100, syllabusPercent) / 100) * barW);
    ctx.fillStyle = accent2;
    drawRoundedRect(ctx, barX, barY, filledW, barH, 8);
    ctx.fill();

    // Topics count text
    ctx.fillStyle = textSecondary;
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${syllabusCompletedCount} of ${syllabusTotalCount} Syllabus Topics Checked`, 640, gridY + 185);
    ctx.restore();

    // BOTTOM SECONDARY METRICS BAR (3 mini pills)
    const botY = 495;
    const pillW = 326;
    const pillH = 75;

    // Pill 1: Mocks Attempted
    ctx.fillStyle = selectedTheme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = selectedTheme === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 80, botY, pillW, pillH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textSecondary;
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TOTAL MOCKS TAKEN', 105, botY + 16);

    ctx.fillStyle = textPrimary;
    ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${attemptsCount} Tests`, 105, botY + 36);

    // Pill 2: Accuracy
    drawRoundedRect(ctx, 437, botY, pillW, pillH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textSecondary;
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('AVERAGE ACCURACY', 462, botY + 16);

    ctx.fillStyle = textPrimary;
    ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${avgAccuracy > 0 ? avgAccuracy + '%' : 'N/A'}`, 462, botY + 36);

    // Pill 3: Preparation Status
    drawRoundedRect(ctx, 794, botY, pillW, pillH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textSecondary;
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CBT READINESS STATUS', 819, botY + 16);

    ctx.fillStyle = streakCount >= 5 ? '#10b981' : '#f59e0b';
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    const statusLabel = streakCount >= 10 ? '🏆 CHAMPION' : streakCount >= 3 ? '⚡ ON FIRE' : '🎯 ON TRACK';
    ctx.fillText(statusLabel, 819, botY + 38);

    // FOOTER CALL TO ACTION
    ctx.fillStyle = textSecondary;
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generated on DSSSB Prep Online — https://dsssbpyq.online', width / 2, height - 52);
  };

  // Download card as PNG
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `DSSSB_Prep_Achievement_${cardName.replace(/\s+/g, '_')}_${streakCount}d_streak.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  // Copy Canvas Image to Clipboard or Share Native
  const handleShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsGenerating(false);
        return;
      }

      const file = new File([blob], `dsssb_achievement_${streakCount}d_streak.png`, { type: 'image/png' });

      // 1. Try Native Web Share API with File
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `My DSSSB CBT Exam Streak: ${streakCount} Days!`,
            text: `🔥 I'm on a ${streakCount}-day study streak and ${syllabusPercent}% syllabus coverage for ${cardExam} on DSSSB Prep Online! Join me: https://dsssbpyq.online`,
            files: [file]
          });
          setIsGenerating(false);
          return;
        } catch (shareErr) {
          console.log('Web share dismissed or failed, falling back to copy:', shareErr);
        }
      }

      // 2. Fallback: Clipboard write image
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 3000);
        } else {
          // If clipboard item unsupported, trigger direct download
          handleDownloadImage();
        }
      } catch (clipErr) {
        console.warn('Clipboard write image failed, downloading instead:', clipErr);
        handleDownloadImage();
      }

      setIsGenerating(false);
    }, 'image/png', 1.0);
  };

  // Copy text share summary
  const handleCopyShareText = () => {
    const shareText = `🔥 My DSSSB Prep Achievement:\n• Daily Streak: ${streakCount} Days in a row!\n• Syllabus Completed: ${syllabusPercent}% (${syllabusCompletedCount}/${syllabusTotalCount} Topics)\n• Target Exam: ${cardExam}\n\nPractice FREE mock tests on DSSSB Prep Online:\nhttps://dsssbpyq.online`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-4xl w-full text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                Social Share Generator
              </span>
              <span className="text-xs text-indigo-700 font-extrabold">1200 x 675 High-Res Image</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Shareable Achievement Card</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition-colors cursor-pointer border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Customization Bar: Theme Picker & Name Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                Choose Card Theme
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'light', label: 'Light Crisp', bg: 'bg-indigo-600' },
                  { id: 'cyber', label: 'Cyber Dark', bg: 'bg-slate-900' },
                  { id: 'gold', label: 'Gold Champion', bg: 'bg-amber-500' },
                  { id: 'emerald', label: 'Emerald Zen', bg: 'bg-emerald-500' },
                  { id: 'sunset', label: 'Sunset Fire', bg: 'bg-rose-500' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id as CardTheme)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedTheme === t.id
                        ? 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.bg}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                Name on Card
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* CANVAS PREVIEW DISPLAY */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-200/60 shadow-inner flex items-center justify-center p-2 sm:p-3">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-w-full rounded-xl shadow-md border border-slate-300/80"
            />
          </div>

          {/* Quick Metrics Text Bar */}
          <div className="bg-indigo-50/90 border border-indigo-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black shrink-0 shadow-2xs">
                <Flame className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">
                  {streakCount} Days Daily Streak • {syllabusPercent}% Syllabus Covered
                </p>
                <p className="text-slate-600 text-xs font-medium">
                  Ready to post on WhatsApp Status, Instagram Story, Twitter/X, or LinkedIn!
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyShareText}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Text!' : 'Copy Post Text'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDownloadImage}
              className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Download PNG Image</span>
            </button>

            <button
              onClick={handleShareImage}
              disabled={isGenerating}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 hover:from-amber-300 hover:to-amber-300 font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Image Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Achievement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
