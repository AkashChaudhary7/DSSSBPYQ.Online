import React from 'react';
import { X, Youtube, Send, Sparkles, ExternalLink, CheckCircle2, Heart } from 'lucide-react';
import { Glass3dIcon } from './Glass3dIcons';

interface SubscribeBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreContentHub?: () => void;
}

export const SubscribeBannerModal: React.FC<SubscribeBannerModalProps> = ({
  isOpen,
  onClose,
  onExploreContentHub,
}) => {
  if (!isOpen) return null;

  const YOUTUBE_URL = 'https://www.youtube.com/@dsssbpyqonline';
  const TELEGRAM_URL = 'https://t.me/+k4QlJ1RnZl9lNWY9';

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-scaleUp">
        {/* Background Decorative Accent Glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon Group */}
        <div className="flex items-center justify-center -space-x-3 mb-4 pt-2">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/60 shadow-md">
            <Glass3dIcon type="youtube" size="md" />
          </div>
          <div className="p-2 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800/60 shadow-md z-10">
            <Glass3dIcon type="telegram" size="md" />
          </div>
        </div>

        {/* Main Title & Tagline */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500/10 to-sky-500/10 border border-rose-200 dark:border-rose-800/40 px-3 py-1 rounded-full text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Support DSSSB PYQ Online
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscribe &amp; Join Our Channels! 🚀
          </h2>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            "If you find this website beneficial for your preparation, please subscribe to our official <span className="text-rose-600 dark:text-rose-400 font-extrabold">YouTube Channel</span> &amp; join our <span className="text-sky-600 dark:text-sky-400 font-extrabold">Telegram Group</span> for free notes and updates!"
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 mb-6 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5 bg-rose-50/60 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
            <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span><strong>YouTube:</strong> Free video lecture series, subject-wise PYQ solved papers &amp; exam strategy tips.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-sky-50/60 dark:bg-sky-950/20 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/40">
            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <span><strong>Telegram:</strong> Instant PDF study materials, daily quiz practice, and official DSSSB announcements.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* YouTube Subscribe Button */}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md hover:shadow-rose-500/20 active:scale-98 transition-all cursor-pointer text-center"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>Subscribe YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Telegram Join Button */}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md hover:shadow-sky-500/20 active:scale-98 transition-all cursor-pointer text-center"
            >
              <Send className="w-4 h-4" />
              <span>Join Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Explore Content Hub button if provided */}
          {onExploreContentHub && (
            <button
              onClick={() => {
                onClose();
                onExploreContentHub();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Explore Content Hub &amp; PDF Notes</span>
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1 transition-colors cursor-pointer"
          >
            Close / Continue to Website
          </button>
        </div>
      </div>
    </div>
  );
};
