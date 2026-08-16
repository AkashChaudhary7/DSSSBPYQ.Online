import React, { useEffect, useRef } from 'react';
import { trackAdImpression } from '../lib/analytics';

interface AdBannerProps {
  format?: 'leaderboard' | 'medium_rectangle' | 'inline_banner' | 'responsive' | 'native_card';
  location?: string;
  adClient?: string;
  adSlot?: string;
  className?: string;
}

export default function AdBanner({
  format = 'responsive',
  location = 'general',
  adClient = 'ca-pub-9282190735069880',
  adSlot,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only initialize AdSense on desktop screens (width >= 768px)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    trackAdImpression(format, location);

    if (adSlot && adRef.current && !pushedRef.current) {
      try {
        pushedRef.current = true;
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.warn('AdSense push warning:', err);
      }
    }
  }, [format, location, adSlot]);

  return (
    <div className={`my-4 mx-auto text-center overflow-hidden transition-all max-w-full hidden md:block ${className}`} id={`ad-container-${location}`}>
      <div className="text-[9px] font-extrabold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1 opacity-75">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>SPONSORED ADVERTISEMENT</span>
      </div>
      <div className="bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-2.5 min-h-[90px] flex flex-col items-center justify-center text-center transition-all">
        {adSlot ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '250px', minHeight: '90px', width: '100%' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={format === 'responsive' ? 'auto' : 'fluid'}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1 py-1">
            <span className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {location.includes('mob') ? 'Google AdMob Smart Banner' : 'Google AdSense Native Ad'}
            </span>
            <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-500 leading-normal max-w-md px-4">
              Auto-optimized for Google Play Store upload and mobile viewing. Double-complying with Google publisher policies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

