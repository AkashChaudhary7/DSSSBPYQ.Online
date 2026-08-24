import React, { useState, useEffect } from 'react';
import { Shield, Cookie, X, Check } from 'lucide-react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or customized cookie consent
    const consent = localStorage.getItem('dsssb_cookie_consent');
    if (!consent) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('dsssb_cookie_consent', JSON.stringify({
      acceptedAt: new Date().toISOString(),
      analytics: true,
      advertising: true,
      necessary: true
    }));
    setShowBanner(false);
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem('dsssb_cookie_consent', JSON.stringify({
      acceptedAt: new Date().toISOString(),
      analytics: false,
      advertising: false,
      necessary: true
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 md:left-6 md:right-auto md:max-w-md bg-slate-900/95 dark:bg-slate-900/98 text-white border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-[200] animate-slideUp font-sans">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
          <Cookie className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Cookie &amp; Privacy Notice</span>
        </div>
        <button
          onClick={handleNecessaryOnly}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
        We use cookies and Google AdSense to personalize content, serve relevant advertisements, analyze traffic, and ensure seamless examination performance. By clicking &quot;Accept All&quot;, you consent to our privacy practices.
      </p>

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
        <button
          onClick={handleAcceptAll}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Accept All
        </button>

        <button
          onClick={handleNecessaryOnly}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Essential Only
        </button>

        <a
          href="/privacypolicy"
          className="text-[11px] text-blue-400 hover:underline font-semibold px-1"
        >
          Policy
        </a>
      </div>
    </div>
  );
}
