import React from 'react';
import { ExternalLink, ChevronRight, Sparkles, Send, Youtube, BookOpen, Trophy, ArrowRight, Bell, Flame } from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

/**
 * PROMOTIONAL BANNER CONFIGURATION
 * 
 * You can easily add, remove, or modify banners here!
 * - To add a custom image banner: specify `imageUrl`.
 * - To link to an external website: set `link: 'https://...'` and `isExternal: true`.
 * - To trigger an internal app action: set `actionType` ('subscribe_modal', 'content_hub', 'tgt_cs', 'syllabus', 'quiz').
 */
export interface PromoBannerConfig {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  buttonText: string;
  link?: string;
  isExternal?: boolean;
  actionType?: 'subscribe_modal' | 'content_hub' | 'tgt_cs' | 'syllabus' | 'quiz';
  imageUrl?: string; // Optional custom banner image URL
  gradient: string; // Tailwind background gradient class
  badgeBg?: string;
  iconType?: 'telegram' | 'youtube' | 'books' | 'trophy' | 'target' | 'lightning' | 'calendar' | 'sparkles';
  hideOnMobile?: boolean; // Hide on mobile view
}

// Default Promos array - Easily edited or extended!
export const DEFAULT_PROMO_BANNERS: PromoBannerConfig[] = [
  {
    id: 'app-install-promo',
    title: 'BYTEPREP MOBILE APP',
    subtitle: 'Practice TGT/PGT CS PYQs & Mock Tests Faster',
    badge: 'Android App',
    buttonText: 'Install App',
    link: 'https://play.google.com/store/apps/details?id=online.dsssbpyq.twa',
    isExternal: true,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    badgeBg: 'bg-white/20 text-white',
    iconType: 'sparkles',
  },
  {
    id: 'telegram-promo',
    title: 'GET PROMOS ON TELEGRAM',
    subtitle: 'Daily PDF Notes, PYQs & Official Updates',
    badge: 'Telegram Channel',
    buttonText: 'Join Now',
    link: 'https://t.me/+k4QlJ1RnZl9lNWY9',
    isExternal: true,
    gradient: 'from-sky-500 via-blue-600 to-indigo-600',
    badgeBg: 'bg-white/20 text-white',
    iconType: 'telegram',
  },
  {
    id: 'tgt-cs-promo',
    title: 'TGT CS MOCK TESTS',
    subtitle: 'Computer Science + General Ability Practice',
    badge: 'CBT Pattern',
    buttonText: 'Start Tests',
    actionType: 'tgt_cs',
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    badgeBg: 'bg-slate-900/30 text-amber-100',
    iconType: 'books',
    hideOnMobile: true,
  },
  {
    id: 'syllabus-promo',
    title: 'SYLLABUS TRACKER',
    subtitle: 'Part A & Part B Syllabus Notes',
    badge: 'Live Tracker',
    buttonText: 'Explore',
    actionType: 'syllabus',
    gradient: 'from-indigo-600 via-purple-600 to-sky-600',
    badgeBg: 'bg-white/20 text-white',
    iconType: 'calendar',
    hideOnMobile: true,
  },
];

interface PromoBannersProps {
  banners?: PromoBannerConfig[];
  onOpenSubscribeModal?: () => void;
  onNavigateToView?: (view: string) => void;
  className?: string;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({
  banners = DEFAULT_PROMO_BANNERS,
  onOpenSubscribeModal,
  onNavigateToView,
  className = '',
}) => {
  if (!banners || banners.length === 0) return null;

  const handleBannerClick = (banner: PromoBannerConfig) => {
    if (banner.actionType === 'subscribe_modal' && onOpenSubscribeModal) {
      onOpenSubscribeModal();
      return;
    }

    if (banner.actionType && onNavigateToView) {
      if (banner.actionType === 'tgt_cs') onNavigateToView('tgt-cs-view');
      else if (banner.actionType === 'content_hub') onNavigateToView('content');
      else if (banner.actionType === 'syllabus') onNavigateToView('syllabus');
      else if (banner.actionType === 'quiz') onNavigateToView('test-list');
      return;
    }

    if (banner.link) {
      if (banner.isExternal) {
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      } else {
        // Internal navigation without full-page browser refresh
        if (onNavigateToView) {
          const target = banner.link.replace(/^\//, '');
          if (target.includes('tgt-cs') || target.includes('computer-science')) onNavigateToView('tgt-cs-view');
          else if (target.includes('content')) onNavigateToView('content');
          else if (target.includes('syllabus')) onNavigateToView('syllabus');
          else if (target.includes('common-dsssb') || target.includes('general-ability')) onNavigateToView('common-dsssb-view');
          else onNavigateToView('dashboard');
        } else {
          window.history.pushState({}, '', banner.link);
          window.dispatchEvent(new Event('popstate'));
        }
      }
    }
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Banner Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 dark:bg-amber-400/20 rounded-lg text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Featured Announcements &amp; Updates
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          Clickable Links
        </span>
      </div>

      {/* Single Horizontal Line (Row) Promotional Banners */}
      <div className="flex flex-row items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 pt-0.5 px-0.5 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner)}
            className={`group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 bg-gradient-to-br ${banner.gradient} text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-row items-center justify-between gap-2.5 sm:gap-3 min-h-[64px] sm:min-h-[68px] border border-white/10 shrink-0 snap-start w-[88%] sm:w-[360px] lg:flex-1 ${
              banner.hideOnMobile ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Background Pattern / Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

            {/* Mobile Layout Left Side / Desktop Top Content */}
            <div className="flex items-center sm:items-start gap-2.5 sm:gap-3 min-w-0 flex-1 relative z-10">
              {/* Icon rendering or Image thumbnail */}
              <div className="shrink-0">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-xl border border-white/30 shadow-sm"
                  />
                ) : banner.iconType ? (
                  <div className="transform scale-90 sm:scale-100 origin-left group-hover:scale-110 transition-transform duration-300">
                    <Glass3dIcon type={banner.iconType} size="sm" />
                  </div>
                ) : null}
              </div>

              {/* Title, Badge & Subtitle */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {banner.badge && (
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md shadow-2xs border border-white/20 ${banner.badgeBg || 'bg-black/20 text-white'}`}>
                      {banner.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-base font-black leading-snug tracking-tight drop-shadow-xs group-hover:text-amber-200 transition-colors truncate sm:whitespace-normal sm:line-clamp-2">
                  {banner.title}
                </h4>
                {banner.subtitle && (
                  <p className="text-[10px] sm:text-xs text-white/90 font-medium truncate sm:whitespace-normal sm:line-clamp-2 leading-tight">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom/Right Call to Action Pill Button */}
            <div className="shrink-0 relative z-10 pt-0 sm:pt-2 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 bg-white text-slate-900 font-extrabold text-[10px] sm:text-[11px] px-3 sm:px-3.5 py-1.5 rounded-full shadow-md group-hover:bg-amber-300 group-hover:text-slate-950 transition-all whitespace-nowrap">
                <span>{banner.buttonText}</span>
                {banner.isExternal ? (
                  <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-80" />
                ) : (
                  <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBanners;
