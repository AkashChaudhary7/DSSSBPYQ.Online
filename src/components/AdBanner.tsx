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
  adSlot = '1000000001',
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only initialize AdSense on desktop screens (width >= 768px)
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      return;
    }

    if (!adSlot || !adRef.current || pushedRef.current) {
      return;
    }

    let observer: ResizeObserver | IntersectionObserver | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const pushAdIfVisible = () => {
      if (!adRef.current || pushedRef.current) return false;

      // Check if the element is rendered and has a valid visible width
      const width = adRef.current.offsetWidth || adRef.current.parentElement?.offsetWidth || 0;
      if (width > 0) {
        pushedRef.current = true;
        trackAdImpression(format, location);
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
          console.warn('AdSense push warning:', err);
        }
        return true;
      }
      return false;
    };

    // Attempt immediate push if width > 0
    if (!pushAdIfVisible()) {
      // Use ResizeObserver / IntersectionObserver to wait for non-zero width layout pass
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          if (pushAdIfVisible() && observer) {
            observer.disconnect();
            observer = null;
          }
        });
        observer.observe(adRef.current);
      } else {
        // Fallback polling for layout rendering
        const poll = () => {
          if (!pushAdIfVisible()) {
            timerId = setTimeout(poll, 200);
          }
        };
        timerId = setTimeout(poll, 100);
      }
    }

    return () => {
      if (observer) observer.disconnect();
      if (timerId) clearTimeout(timerId);
    };
  }, [format, location, adSlot]);

  // Strictly obey AdSense Policy: Do NOT show fake placeholder text or mock ad frames
  // If no adSlot is provided, collapse gracefully to prevent "Screen without publisher content" warnings.
  if (!adSlot) {
    return null;
  }

  return (
    <div className={`my-2 md:my-3 mx-auto text-center overflow-hidden transition-all max-w-full hidden md:block ${className}`} id={`ad-container-${location}`}>
      <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1 opacity-60">
        <span>ADVERTISEMENT</span>
      </div>
      <div className="bg-transparent flex flex-col items-center justify-center text-center transition-all min-h-[90px] w-full">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '250px', minHeight: '90px', width: '100%' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={format === 'responsive' ? 'auto' : 'fluid'}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
