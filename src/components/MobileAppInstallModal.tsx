import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=online.dsssbpyq.twa';
export const DISMISSAL_STORAGE_KEY = 'byteprep_app_install_prompt_dismissed';
export const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  try {
    // 1. Check navigator.userAgentData (modern browsers)
    const nav = navigator as any;
    if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
      if (nav.userAgentData.mobile) return true;
    }

    // 2. User Agent regex test
    const ua = navigator.userAgent || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|Tablet|Touch/i;
    if (mobileRegex.test(ua)) return true;

    // 3. iPadOS 13+ detection (Macintosh UA with touch points)
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
      return true;
    }
  } catch {
    // Silent fail
  }

  return false;
}

export function isCrawler(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const crawlerRegex = /Googlebot|bingbot|yandexbot|DuckDuckBot|slurp|Mediapartners-Google|AdsBot-Google|google-app-manifest|FeedFetcher-Google/i;
  return crawlerRegex.test(ua);
}

export default function MobileAppInstallModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Do not show on app-ads.txt or ads.txt
    const pathname = window.location.pathname.toLowerCase();
    if (pathname === '/app-ads.txt' || pathname === '/ads.txt') return;

    // 2. Do not show for search engine crawlers
    if (isCrawler()) return;

    // 3. Do not show on desktop
    if (!isMobileDevice()) return;

    // 4. Check frequency control in localStorage
    try {
      const lastDismissed = localStorage.getItem(DISMISSAL_STORAGE_KEY);
      if (lastDismissed) {
        const timestamp = parseInt(lastDismissed, 10);
        if (!isNaN(timestamp) && Date.now() - timestamp < DISMISSAL_COOLDOWN_MS) {
          return; // Dismissed recently within cooldown
        }
      }
    } catch {
      // Ignore storage errors
    }

    // 5. Show after short delay (1.5s) to allow page to render first
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSAL_STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage errors
    }
  };

  const handleInstallClick = () => {
    handleDismiss();
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-install-title"
    >
      <div 
        className="w-full max-w-[340px] sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative p-4 sm:p-5 space-y-3 animate-in slide-in-from-bottom duration-300"
      >
        {/* Close button (×) */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header with App Icon */}
        <div className="flex items-center gap-3 pr-6">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <img 
              src="/pwa-192.png" 
              alt="BytePrep App Logo" 
              className="w-full h-full object-cover rounded-[10px] sm:rounded-[12px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider">
              <Smartphone className="w-3 h-3" />
              <span>BytePrep Official App</span>
            </div>
            <h3 id="app-install-title" className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug truncate">
              📱 Get BytePrep CS App
            </h3>
          </div>
        </div>

        {/* Modal Description */}
        <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium">
          Practice TGT/PGT Computer Science PYQs, mock tests and preparation resources faster with the BytePrep Android app.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-0.5">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInstallClick}
            className="w-full py-2.5 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Install App</span>
          </a>

          <button
            onClick={handleDismiss}
            className="w-full py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center active:scale-[0.98] cursor-pointer"
          >
            Continue on Website
          </button>
        </div>
      </div>
    </div>
  );
}
