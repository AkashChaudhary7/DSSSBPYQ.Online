import React, { useEffect } from 'react';
import { Smartphone, Zap, Target, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { isIOS } from '../lib/deviceDetection';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=online.dsssbpyq.twa';

export default function MobileAppGate() {
  const isIosDevice = isIOS();

  useEffect(() => {
    // Disable body scroll while mobile app gate is active
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
    };
  }, []);

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Open Google Play Store externally
    e.preventDefault();
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto min-h-screen px-5 py-8 sm:px-8 sm:py-12 select-none"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + 2rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-gate-heading"
    >
      {/* Dynamic backdrop glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header / Branding */}
      <header className="flex flex-col items-center text-center space-y-3 pt-2">
        {/* App Logo Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center border border-blue-500/30">
            <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 animate-pulse" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-[10px] font-extrabold uppercase tracking-widest shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            DSSSBPYQ.Online
          </div>
          <h1 id="mobile-gate-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Get the Better Experience with Our App
          </h1>
        </div>
      </header>

      {/* Center Body & Value Proposition */}
      <main className="my-auto py-6 space-y-6 max-w-sm mx-auto w-full">
        {/* Main message */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-3 backdrop-blur-md">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium text-center">
            Download the <strong className="text-white font-extrabold">DSSSBPYQ</strong> app for a faster, smoother and more convenient exam preparation experience.
          </p>
          <div className="h-px bg-slate-800 w-full" />
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed text-center">
            Practice DSSSB/TGT Computer Science questions, mocks and study material with a smoother mobile experience.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">680+ CBT Mock Tests & PYQs</h4>
              <p className="text-[10px] text-slate-400">Instant test loading with automatic score analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Real Exam Simulation</h4>
              <p className="text-[10px] text-slate-400">Sectional timer, 0.25 negative marking & instant review</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">100% Free & Ad-Optimized</h4>
              <p className="text-[10px] text-slate-400">Designed natively for mobile devices</p>
            </div>
          </div>
        </div>

        {/* Action Button & Device-specific messaging */}
        <div className="space-y-3 pt-2">
          {isIosDevice ? (
            <div className="space-y-3 text-center">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-medium space-y-1">
                <p className="font-extrabold text-amber-300">Notice for iOS Users</p>
                <p>The DSSSBPYQ app is currently available for Android.</p>
              </div>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>View on Google Play</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
                className="w-full py-4 px-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer border border-emerald-400/30 tracking-wide"
              >
                {/* Google Play Icon SVG */}
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.97C20.14,13.2 20.14,12.8 18.81,12.03L16.81,10.88L14.81,12.88L16.81,15.12M14.26,12.55L4.82,22.01L15.39,15.91L14.26,12.55M14.26,11.45L15.39,8.09L4.82,1.99L14.26,11.45Z" />
                </svg>
                <span>Download on Google Play</span>
              </a>

              <p className="text-[10px] text-slate-500 text-center font-medium">
                Official Android Package: <span className="font-mono text-slate-400">online.dsssbpyq.twa</span>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Tagline */}
      <footer className="text-center pt-4 border-t border-slate-900">
        <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center justify-center gap-2">
          <span>Fast</span>
          <span>•</span>
          <span>Focused</span>
          <span>•</span>
          <span>Exam Ready</span>
        </p>
      </footer>
    </div>
  );
}
