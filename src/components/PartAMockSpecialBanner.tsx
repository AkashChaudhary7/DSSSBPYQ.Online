import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowRight, Play, Sparkles, CheckCircle, ShieldAlert, Star } from 'lucide-react';

interface PartAMockSpecialBannerProps {
  onClick: () => void;
  className?: string;
}

export const PartAMockSpecialBanner: React.FC<PartAMockSpecialBannerProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 border border-blue-500/40 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-4 sm:p-6 hidden sm:block ${className}`}
    >
      {/* Dynamic decorative backdrop circles */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      
      {/* Decorative vector grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-5">
        
        {/* Left Section: Branding, Heading, Badges, Tagline */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Top Badge & Platform ID */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[9px] md:text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                ⭐ SUNDAY SPECIAL
              </span>
              <span className="text-[10px] md:text-xs font-bold text-blue-200 tracking-tight">
                BytePrep CS • CBT Exam Portal
              </span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* Core Titles */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                PART A FULL MOCK TEST
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xs sm:text-sm font-black tracking-wide uppercase">
                  100 Marks General Paper
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-white/95 text-xs sm:text-sm font-semibold">
                  Latest Pattern
                </span>
              </div>
            </div>
          </div>

          {/* Tagline / Motivational Quote (Bilingual) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 max-w-md">
            <p className="text-[11px] sm:text-xs font-medium text-slate-300 leading-relaxed">
              &quot;हर रविवार • एक कदम सफलता की ओर&quot; <span className="text-amber-400 font-extrabold ml-1">— Attempt free full length CBT mocks under real exam conditions today!</span>
            </p>
          </div>
        </div>

        {/* Middle Section: Crucial Benefits List (Grid on mobile, stacked on desktop) */}
        <div className="flex-1 lg:max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 self-center bg-slate-950/20 border border-white/5 rounded-2xl p-3">
          {[
            { text: 'Exam Pattern Based', desc: 'Latest Syllabus Covered', color: 'text-amber-400 bg-amber-400/10' },
            { text: 'Full Length CBT Mock', desc: 'Real Exam Interface & Timer', color: 'text-sky-400 bg-sky-400/10' },
            { text: 'Detailed Analytics', desc: 'Sectional & Speed Insights', color: 'text-emerald-400 bg-emerald-400/10' },
            { text: 'All India Rankings', desc: 'Compare Live Scores', color: 'text-purple-400 bg-purple-400/10' },
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${benefit.color}`}>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">{benefit.text}</p>
                <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section: Big Action Callout Button */}
        <div className="shrink-0 flex items-center justify-center lg:pl-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full lg:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-4.5 rounded-2xl shadow-[0_4px_12px_rgba(251,191,36,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2.5 active:translate-y-0.5 shrink-0 uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Attempt Free Test Now</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
};
